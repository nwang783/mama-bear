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

// Cache for question sets to reduce Firebase reads
const questionSetsCache = {
  earning: { data: null, timestamp: null },
  saving: { data: null, timestamp: null },
  spending: { data: null, timestamp: null }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get top question sets by subject from Firebase
 * Ordered by upvotes, returns top 5
 * 
 * @param {string} subject - Subject type: 'earning', 'saving', or 'spending'
 * @param {number} limitCount - Number of sets to fetch (default 5)
 * @returns {Promise<Array>} Array of question set objects
 */
export async function getQuestionSetsBySubject(subject, limitCount = 5) {
  try {
    // Check cache first
    const cached = questionSetsCache[subject];
    const now = Date.now();
    
    if (cached.data && cached.timestamp && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`Using cached question sets for ${subject}`);
      return cached.data.slice(0, limitCount);
    }

    console.log(`Fetching question sets for ${subject} from Firebase...`);

    // Query Firestore for top sets by upvotes
    const setsRef = collection(db, 'questionSets');
    const q = query(
      setsRef,
      where('subject', '==', subject),
      orderBy('upvotes', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const sets = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sets.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        subject: data.subject,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        questionCount: data.questionCount || 0,
        difficulty: data.difficulty || 'medium',
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        tags: data.tags || []
      });
    });

    // Update cache
    questionSetsCache[subject] = {
      data: sets,
      timestamp: now
    };

    console.log(`Fetched ${sets.length} question sets for ${subject}`);
    return sets;

  } catch (error) {
    console.error('Error fetching question sets from Firebase:', error);
    throw error;
  }
}

/**
 * Add a new question set to Firebase
 * 
 * @param {Object} setData - Question set data
 * @returns {Promise<string>} Document ID of created set
 */
export async function addQuestionSet(setData) {
  try {
    const setsRef = collection(db, 'questionSets');
    
    const newSet = {
      name: setData.name,
      description: setData.description || '',
      subject: setData.subject,
      createdBy: setData.createdBy || 'system',
      upvotes: 0,
      downvotes: 0,
      questionCount: setData.questionCount || 0,
      difficulty: setData.difficulty || 'medium',
      tags: setData.tags || [],
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(setsRef, newSet);
    console.log('Question set added with ID:', docRef.id);

    // Invalidate cache for this subject
    if (questionSetsCache[setData.subject]) {
      questionSetsCache[setData.subject].timestamp = null;
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding question set:', error);
    throw error;
  }
}

/**
 * Vote on a question set (upvote or downvote)
 * 
 * @param {string} setId - ID of the question set document
 * @param {string} voteType - 'upvote' or 'downvote'
 * @returns {Promise<void>}
 */
export async function voteQuestionSet(setId, voteType) {
  try {
    const setRef = doc(db, 'questionSets', setId);
    
    const field = voteType === 'upvote' ? 'upvotes' : 'downvotes';
    
    await updateDoc(setRef, {
      [field]: increment(1)
    });

    console.log(`${voteType} recorded for question set ${setId}`);

    // Invalidate all caches since vote counts changed
    Object.keys(questionSetsCache).forEach(subject => {
      questionSetsCache[subject].timestamp = null;
    });

  } catch (error) {
    console.error('Error voting on question set:', error);
    throw error;
  }
}

/**
 * Clear cache for a specific subject or all subjects
 * 
 * @param {string|null} subject - Subject to clear, or null for all
 */
export function clearQuestionSetsCache(subject = null) {
  if (subject) {
    if (questionSetsCache[subject]) {
      questionSetsCache[subject].timestamp = null;
      questionSetsCache[subject].data = null;
    }
  } else {
    Object.keys(questionSetsCache).forEach(key => {
      questionSetsCache[key].timestamp = null;
      questionSetsCache[key].data = null;
    });
  }
  console.log('Question sets cache cleared');
}

/**
 * Get cache status for debugging
 */
export function getQuestionSetsCacheStatus() {
  const status = {};
  Object.keys(questionSetsCache).forEach(subject => {
    const cached = questionSetsCache[subject];
    status[subject] = {
      hasCachedData: !!cached.data,
      setCount: cached.data ? cached.data.length : 0,
      ageMs: cached.timestamp ? Date.now() - cached.timestamp : null,
      isValid: cached.timestamp ? (Date.now() - cached.timestamp) < CACHE_DURATION : false
    };
  });
  return status;
}
