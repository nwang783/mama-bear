# Firebase Functions - PDF Question Extraction

## Overview

This Firebase function extracts multiple choice questions from PDF files using OpenAI's GPT-4o-mini with structured outputs. The questions are automatically stored in Firestore and organized into question sets.

## Function: `extract_questions_from_pdf`

### Description
Extracts up to 10 multiple choice questions from a PDF file stored in Firebase Storage and creates a question set in one of three "villages" (earning, saving, or spending).

### Parameters

```typescript
{
  storage_path: string;  // Path to the PDF in Firebase Storage (e.g., "pdfs/earning-questions.pdf")
  village: "earning" | "saving" | "spending";  // Which domain/village to assign the questions to
}
```

### Response

```typescript
{
  success: boolean;
  question_set_id: string;  // ID of the created question set
  question_ids: string[];   // Array of IDs for the created questions
  question_count: number;   // Number of questions extracted
  village: string;          // The village the questions were assigned to
}
```

### Setup

1. **Set up Python Virtual Environment**
   
   ```bash
   cd functions
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure OpenAI API Key**
   
   **For local development**, create a `.env.local` file:
   ```bash
   cd functions
   echo "OPENAI_API_KEY=your_actual_api_key_here" > .env.local
   ```
   
   **For production**, set the secret:
   ```bash
   firebase functions:secrets:set OPENAI_API_KEY
   ```
   
   Enter your OpenAI API key when prompted.

3. **Deploy the function**
   
   ```bash
   firebase deploy --only functions
   ```

### Usage Example

#### From Client SDK (JavaScript/TypeScript)

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const extractQuestions = httpsCallable(functions, 'extract_questions_from_pdf');

// Call the function
const result = await extractQuestions({
  storage_path: 'pdfs/earning-basics.pdf',
  village: 'earning'
});

console.log(`Created ${result.data.question_count} questions`);
console.log(`Question set ID: ${result.data.question_set_id}`);
```

#### From Python Admin SDK

```python
from firebase_admin import functions

# Call the function
result = functions.call(
    'extract_questions_from_pdf',
    {
        'storage_path': 'pdfs/saving-goals.pdf',
        'village': 'saving'
    }
)

print(f"Created {result['question_count']} questions")
```

### Question Structure

Each extracted question is stored with the following structure:

```typescript
{
  stem: string;                    // The question text
  labeled_options: Array<{         // Options with labels
    label: "A" | "B" | "C" | "D";
    text: string;
  }>;
  options: string[];               // Plain text options
  correct_label: "A" | "B" | "C" | "D";
  correct_index: number;           // 0-3
  correct_text: string;            // Text of correct answer
  explanation: string;             // Why the answer is correct
  difficulty: "easy" | "medium" | "hard";
  topic: string;                   // Specific skill/topic
  subject: string;                 // Village name
  domain: string;                  // Capitalized village
  question_format: "multiple_choice";
  schema_version: 1;
  source: {
    pdf_path: string;
    processed_at_iso: string;
    extraction_method: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### Question Set Structure

```typescript
{
  name: string;                    // Generated from PDF filename
  village: "earning" | "saving" | "spending";
  question_ids: string[];          // References to question documents
  question_count: number;
  source: {
    pdf_path: string;
    extraction_method: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### Features

- **Structured Output**: Uses OpenAI's structured output feature to ensure consistent question format
- **Batch Operations**: Uses Firestore batch writes for efficient document creation
- **Unique IDs**: Generates deterministic IDs based on question content
- **Automatic Metadata**: Adds creation timestamps and source information
- **Error Handling**: Comprehensive error handling with meaningful error messages
- **Type Safety**: Pydantic models ensure data validation

### Cost Optimization

The function is configured with `max_instances=10` to control costs. Adjust this in `main.py` if needed:

```python
set_global_options(max_instances=10)
```

### Testing

To test the function locally:

```bash
firebase emulators:start --only functions,storage,firestore
```

Then call the function using the emulator URL.

### Notes

- The PDF must already be uploaded to Firebase Storage before calling this function
- GPT-4o-mini is used for cost efficiency while maintaining quality
- Questions are deduplicated using MD5 hashes of the question stem
- Maximum of 10 questions per PDF to control API costs
- The village parameter is required and validated
