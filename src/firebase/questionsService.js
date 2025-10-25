import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Cache for questions to reduce Firebase reads
const questionCache = {
  math: { data: null, timestamp: null },
  reading: { data: null, timestamp: null },
  finance: { data: null, timestamp: null }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get top questions by subject from Firebase
 * Uses caching to reduce Firebase reads
 * 
 * @param {string} subject - Subject type: 'math', 'reading', or 'finance'
 * @param {number} limitCount - Number of questions to fetch (default 10)
 * @returns {Promise<Array>} Array of question objects
 */
export async function getTopQuestionsBySubject(subject, limitCount = 10) {
  try {
    // Check cache first
    const cached = questionCache[subject];
    const now = Date.now();
    
    if (cached.data && cached.timestamp && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`Using cached questions for ${subject}`);
      return cached.data.slice(0, limitCount);
    }

    console.log(`Fetching questions for ${subject} from Firebase...`);

    // Query Firestore for top questions by upvotes
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('subject', '==', subject),
      orderBy('upvotes', 'desc'),
      limit(Math.max(limitCount, 20)) // Fetch extra for cache
    );

    const querySnapshot = await getDocs(q);
    const questions = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      questions.push({
        id: doc.id,
        question: data.question,
        choices: data.choices,
        correctIndex: data.correctIndex,
        subject: data.subject,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        difficulty: data.difficulty
      });
    });

    // Update cache
    questionCache[subject] = {
      data: questions,
      timestamp: now
    };

    console.log(`Fetched ${questions.length} questions for ${subject}`);
    return questions.slice(0, limitCount);

  } catch (error) {
    console.error('Error fetching questions from Firebase:', error);
    throw error;
  }
}

/**
 * Add a new question to Firebase
 * 
 * @param {Object} questionData - Question data object
 * @returns {Promise<string>} Document ID of created question
 */
export async function addQuestion(questionData) {
  try {
    const questionsRef = collection(db, 'questions');
    
    const newQuestion = {
      subject: questionData.subject,
      question: questionData.question,
      choices: questionData.choices,
      correctIndex: questionData.correctIndex,
      createdBy: questionData.createdBy || 'system',
      upvotes: 0,
      downvotes: 0,
      createdAt: serverTimestamp(),
      difficulty: questionData.difficulty || 'medium'
    };

    const docRef = await addDoc(questionsRef, newQuestion);
    console.log('Question added with ID:', docRef.id);

    // Invalidate cache for this subject
    if (questionCache[questionData.subject]) {
      questionCache[questionData.subject].timestamp = null;
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
}

/**
 * Vote on a question (upvote or downvote)
 * 
 * @param {string} questionId - ID of the question document
 * @param {string} voteType - 'upvote' or 'downvote'
 * @returns {Promise<void>}
 */
export async function voteQuestion(questionId, voteType) {
  try {
    const questionRef = doc(db, 'questions', questionId);
    
    const field = voteType === 'upvote' ? 'upvotes' : 'downvotes';
    
    await updateDoc(questionRef, {
      [field]: increment(1)
    });

    console.log(`${voteType} recorded for question ${questionId}`);

    // Invalidate all caches since vote counts changed
    Object.keys(questionCache).forEach(subject => {
      questionCache[subject].timestamp = null;
    });

  } catch (error) {
    console.error('Error voting on question:', error);
    throw error;
  }
}

/**
 * Clear cache for a specific subject or all subjects
 * 
 * @param {string|null} subject - Subject to clear, or null for all
 */
export function clearCache(subject = null) {
  if (subject) {
    if (questionCache[subject]) {
      questionCache[subject].timestamp = null;
      questionCache[subject].data = null;
    }
  } else {
    Object.keys(questionCache).forEach(key => {
      questionCache[key].timestamp = null;
      questionCache[key].data = null;
    });
  }
  console.log('Question cache cleared');
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus() {
  const status = {};
  Object.keys(questionCache).forEach(subject => {
    const cached = questionCache[subject];
    status[subject] = {
      hasCachedData: !!cached.data,
      questionCount: cached.data ? cached.data.length : 0,
      ageMs: cached.timestamp ? Date.now() - cached.timestamp : null,
      isValid: cached.timestamp ? (Date.now() - cached.timestamp) < CACHE_DURATION : false
    };
  });
  return status;
}
