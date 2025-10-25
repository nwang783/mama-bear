import { ref, uploadBytes } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { storage, functions } from './config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Upload PDF to Firebase Storage
 * 
 * @param {File} file - PDF file to upload
 * @param {string} village - Village to assign (reading, math, or finance)
 * @returns {Promise<string>} - Storage path of uploaded file
 */
export async function uploadPDF(file, village) {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    // Validate village
    if (!['reading', 'math', 'finance'].includes(village)) {
      throw new Error('Village must be reading, math, or finance');
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${village}_${timestamp}_${file.name}`;
    const storagePath = `pdfs/${village}/${filename}`;

    // Create storage reference and upload
    const storageRef = ref(storage, storagePath);
    console.log('Uploading PDF to:', storagePath);

    await uploadBytes(storageRef, file);
    console.log('PDF uploaded successfully');

    return storagePath;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}

/**
 * Extract questions from uploaded PDF using Firebase Function
 * 
 * @param {string} storagePath - Path to PDF in Firebase Storage
 * @param {string} village - Village to assign questions to
 * @returns {Promise<Object>} - Extraction result with question IDs
 */
export async function extractQuestionsFromPDF(storagePath, village) {
  try {
    console.log('Calling extraction function with:', { storagePath, village });

    // Get the callable function
    const extractFunction = httpsCallable(functions, 'extract_questions_from_pdf');

    // Call the function
    const result = await extractFunction({
      storage_path: storagePath,
      village: village
    });

    console.log('Extraction result:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error extracting questions:', error);
    throw error;
  }
}

/**
 * Get extracted questions by their IDs
 * 
 * @param {Array<string>} questionIds - Array of question document IDs
 * @returns {Promise<Array>} - Array of question objects
 */
export async function getQuestionsByIds(questionIds) {
  try {
    const questions = [];

    for (const questionId of questionIds) {
      const questionRef = doc(db, 'questions', questionId);
      const questionSnap = await getDoc(questionRef);

      if (questionSnap.exists()) {
        questions.push({
          id: questionSnap.id,
          ...questionSnap.data()
        });
      }
    }

    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Get a question set by ID
 * 
 * @param {string} questionSetId - Question set document ID
 * @returns {Promise<Object>} - Question set object
 */
export async function getQuestionSet(questionSetId) {
  try {
    const setRef = doc(db, 'question_sets', questionSetId);
    const setSnap = await getDoc(setRef);

    if (!setSnap.exists()) {
      throw new Error('Question set not found');
    }

    return {
      id: setSnap.id,
      ...setSnap.data()
    };
  } catch (error) {
    console.error('Error fetching question set:', error);
    throw error;
  }
}

/**
 * Full workflow: Upload PDF and extract questions
 * 
 * @param {File} file - PDF file to process
 * @param {string} village - Village to assign questions to
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Complete extraction result with questions
 */
export async function uploadAndExtractQuestions(file, village, onProgress) {
  try {
    // Step 1: Upload PDF
    onProgress?.({ step: 'uploading', progress: 25 });
    const storagePath = await uploadPDF(file, village);

    // Step 2: Extract questions
    onProgress?.({ step: 'extracting', progress: 50 });
    const extractionResult = await extractQuestionsFromPDF(storagePath, village);

    // Step 3: Fetch the actual questions
    onProgress?.({ step: 'fetching', progress: 75 });
    let questions = await getQuestionsByIds(extractionResult.question_ids);
    if ((!questions || questions.length === 0) && extractionResult.questions_inline) {
      console.warn('Falling back to inline questions returned by function');
      questions = extractionResult.questions_inline;
    }

    // Step 4: Get question set info (use returned doc if available to avoid read-after-write race)
    let questionSet = extractionResult.question_set;
    // Ensure id is present even if returned from backend without it
    if (questionSet && !questionSet.id && extractionResult.question_set_id) {
      questionSet = { id: extractionResult.question_set_id, ...questionSet };
    }
    if (!questionSet) {
      try {
        questionSet = await getQuestionSet(extractionResult.question_set_id);
      } catch (e) {
        console.warn('Question set read failed, constructing minimal object from extraction result');
        questionSet = {
          id: extractionResult.question_set_id,
          village,
          question_ids: extractionResult.question_ids,
          question_count: extractionResult.question_count,
          source: { pdf_path: storagePath }
        };
      }
    }

    onProgress?.({ step: 'complete', progress: 100 });

    return {
      success: true,
      storagePath,
      questionSet,
      questions,
      extractionResult
    };
  } catch (error) {
    console.error('Error in upload and extract workflow:', error);
    throw error;
  }
}
