from firebase_functions import https_fn
from firebase_functions.params import StringParam
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app, storage, firestore
from pydantic import BaseModel, Field
from openai import OpenAI
from typing import Literal
import hashlib
import io
from datetime import datetime, timedelta

# Gemini SDK (python)
try:
    # New official Python SDK
    from google import genai
except Exception:  # pragma: no cover
    genai = None

set_global_options(max_instances=10)
initialize_app()

# Configure secrets from environment
OPENAI_API_KEY = StringParam("OPENAI_API_KEY")
GOOGLE_API_KEY = StringParam("GOOGLE_API_KEY")

# Pydantic models for structured output
class QuestionOption(BaseModel):
    label: Literal["A", "B", "C", "D"]
    text: str

class MultipleChoiceQuestion(BaseModel):
    stem: str = Field(description="The question text/prompt")
    labeled_options: list[QuestionOption] = Field(description="Exactly 4 answer options with labels A, B, C, D")
    correct_label: Literal["A", "B", "C", "D"] = Field(description="The label of the correct answer")
    explanation: str = Field(description="Explanation of why the correct answer is correct")
    difficulty: Literal["easy", "medium", "hard"] = Field(description="Estimated difficulty level")
    topic: str = Field(description="Specific topic or skill being tested")

class QuestionSet(BaseModel):
    questions: list[MultipleChoiceQuestion] = Field(max_length=10, description="Up to 10 multiple choice questions extracted from the PDF")
    village: Literal["earning", "saving", "spending"] = Field(description="The village/domain this question set belongs to")


@https_fn.on_call()
def extract_questions_from_pdf(req: https_fn.CallableRequest):
    """
    Extract questions from a PDF file in Firebase Storage using GPT-4o-mini.
    
    Expected request data:
    {
        "storage_path": "path/to/file.pdf",  # Path to PDF in Firebase Storage
        "village": "earning" | "saving" | "spending"  # Which village to assign questions to
    }
    """
    try:
        print(f"Function called with data: {req.data}")
        
        # Get parameters
        storage_path = req.data.get("storage_path")
        village = req.data.get("village")
        
        print(f"Extracted params - storage_path: {storage_path}, village: {village}")
        
        if not storage_path:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message="storage_path is required"
            )
        
        if village not in ["earning", "saving", "spending"]:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message="village must be 'earning', 'saving', or 'spending'"
            )
        
        # Download PDF from Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(storage_path)
        
        if not blob.exists():
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.NOT_FOUND,
                message=f"File not found at {storage_path}"
            )
        
        pdf_bytes = blob.download_as_bytes()
        
        # Initialize OpenAI client
        client = OpenAI(api_key=OPENAI_API_KEY.value)
        
        # Upload the PDF to OpenAI Files API and reference by file_id
        uploaded = client.files.create(
            file=(storage_path.split("/")[-1] or "document.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
            purpose="assistants"
        )
        
        # Extract questions using GPT-4o-mini with structured output
        def build_input():
            return [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "You are an expert at extracting educational assessment questions from PDFs.\n"
                                "Extract up to 10 high-quality multiple choice questions from the provided PDF.\n"
                                "Return strictly valid JSON that matches the provided schema.\n"
                                "Each question must have exactly 4 options labeled A, B, C, and D.\n"
                                f"The questions should be appropriate for the '{village}' domain.\n"
                                "Ensure questions are clear, accurate, and educationally valuable."
                            )
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "input_file", "file_id": uploaded.id}
                    ]
                }
            ]
        
        # First attempt with cost-efficient model
        chosen_model = "gpt-4o-mini"
        response = client.responses.parse(
            model=chosen_model,
            input=build_input(),
            text_format=QuestionSet
        )
        question_set_data = response.output_parsed
        
        # Fallback to gpt-4o if nothing extracted
        if not question_set_data or not getattr(question_set_data, "questions", None):
            print("No questions extracted with gpt-4o-mini; retrying with gpt-4o-2024-08-06")
            chosen_model = "gpt-4o-2024-08-06"
            response = client.responses.parse(
                model=chosen_model,
                input=build_input(),
                text_format=QuestionSet
            )
            question_set_data = response.output_parsed
        
        # Get Firestore client
        db = firestore.client()
        
        # Create question documents
        question_ids = []
        questions_inline = []
        batch = db.batch()
        
        for question in question_set_data.questions:
            # Generate unique ID based on question content
            question_hash = hashlib.md5(question.stem.encode()).hexdigest()[:8]
            
            # Prepare question document
            question_doc = {
                "stem": question.stem,
                "labeled_options": [opt.model_dump() for opt in question.labeled_options],
                "options": [opt.text for opt in question.labeled_options],
                "correct_label": question.correct_label,
                "correct_index": ord(question.correct_label) - ord("A"),
                "correct_text": next(opt.text for opt in question.labeled_options if opt.label == question.correct_label),
                "explanation": question.explanation,
                "difficulty": question.difficulty,
                "topic": question.topic,
                "skill": question.topic,
                "subject": village,
                "domain": village.capitalize(),
                "question_format": "multiple_choice",
                "grid_in_answer": None,
                "figure_description": None,
                "schema_version": 1,
                "source": {
                    "pdf_path": storage_path,
                    "processed_at_iso": datetime.utcnow().isoformat(),
                    "extraction_method": "openai-structured-output",
                    "model": chosen_model
                },
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP
            }
            
            # Add to batch
            question_ref = db.collection("questions").document(question_hash)
            batch.set(question_ref, question_doc)
            question_ids.append(question_hash)
            # Include inline for immediate client display (strip non-serializable fields)
            inline_doc = {k: v for k, v in question_doc.items() if k not in ("created_at", "updated_at")}
            questions_inline.append({"id": question_hash, **inline_doc})
        
        # Create question set document
        question_set_id = hashlib.md5(storage_path.encode()).hexdigest()[:12]
        question_set_doc = {
            "name": f"Questions from {storage_path.split('/')[-1]}",
            "village": village,
            "question_ids": question_ids,
            "question_count": len(question_ids),
            "source": {
                "pdf_path": storage_path,
                "extraction_method": "gpt-4o-mini-structured-output"
            },
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        question_set_ref = db.collection("question_sets").document(question_set_id)
        batch.set(question_set_ref, question_set_doc)
        
        # Commit batch
        batch.commit()
        
        # Read back the question_set doc to ensure it exists and return it
        qs_snap = question_set_ref.get()
        qs_data = qs_snap.to_dict() if qs_snap.exists else None
        if qs_data is not None:
            # Convert Firestore timestamps to strings to ensure JSON serializable
            for ts_field in ("created_at", "updated_at"):
                if ts_field in qs_data and hasattr(qs_data[ts_field], "isoformat"):
                    qs_data[ts_field] = qs_data[ts_field].isoformat()
            qs_data["id"] = question_set_id
        print(f"question_set created: id={question_set_id}, exists={qs_snap.exists}, questions={len(question_ids)}")
        
        return {
            "success": True,
            "question_set_id": question_set_id,
            "question_ids": question_ids,
            "question_count": len(question_ids),
            "village": village,
            "question_set": qs_data,
            "questions_inline": questions_inline
        }
        
    except https_fn.HttpsError:
        # Re-raise HttpsError as-is
        raise
    except Exception as e:
        print(f"Error in function: {str(e)}")
        import traceback
        traceback.print_exc()
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"Error extracting questions: {str(e)}"
        )


@https_fn.on_call()
def chat_with_assistant(req: https_fn.CallableRequest):
    """
    Simple text-based chat with Gemini AI assistant.

    Request data:
    {
      "message": string,           // User's message
      "village": string,           // Optional: village context (earning, saving, spending)
      "history": list              // Optional: conversation history
    }

    Returns:
    {
      "response": string,          // AI response text
      "success": boolean
    }
    """
    try:
        if genai is None:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                message="google-genai SDK not installed"
            )

        api_key = GOOGLE_API_KEY.value
        if not api_key:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.FAILED_PRECONDITION,
                message="GOOGLE_API_KEY is not configured"
            )

        # Get parameters
        message = req.data.get("message", "")
        village = req.data.get("village", "the village")
        history = req.data.get("history", [])

        if not message:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
                message="message is required"
            )

        # Create client
        client = genai.Client(api_key=api_key)

        # Build system instruction
        system_instruction = f"""You are a friendly, helpful AI assistant named Mama Bear who lives in {village}.
You help players learn about financial literacy in a fun, encouraging way.
Keep your responses brief (1-2 sentences), friendly, and age-appropriate for kids.
Use simple language and be positive and supportive.
If asked about the game, mention that players can explore villages and play mini-games to learn about earning, saving, and spending money."""

        # Generate response
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=message,
            config={
                "temperature": 0.7,
                "system_instruction": system_instruction
            }
        )

        response_text = response.text if hasattr(response, 'text') else str(response)

        return {
            "success": True,
            "response": response_text
        }

    except https_fn.HttpsError:
        raise
    except Exception as e:
        print(f"Error in chat: {e}")
        import traceback
        traceback.print_exc()
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INTERNAL,
            message=f"Chat error: {str(e)}"
        )
