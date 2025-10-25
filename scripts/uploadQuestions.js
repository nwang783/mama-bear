/**
 * Script to upload initial questions to Firebase
 * 
 * Usage:
 *   node scripts/uploadQuestions.js
 * 
 * Make sure to:
 * 1. Set up .env file with Firebase credentials
 * 2. Deploy firestore.rules and firestore.indexes.json first
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Math questions with voting data
const mathQuestions = [
  {
    subject: 'math',
    question: 'What is 7 + 8?',
    choices: ['13', '15', '16', '14'],
    correctIndex: 1,
    upvotes: 15,
    difficulty: 'easy'
  },
  {
    subject: 'math',
    question: 'What is 12 - 5?',
    choices: ['7', '8', '6', '9'],
    correctIndex: 0,
    upvotes: 12,
    difficulty: 'easy'
  },
  {
    subject: 'math',
    question: 'What is 6 × 7?',
    choices: ['42', '48', '36', '54'],
    correctIndex: 0,
    upvotes: 18,
    difficulty: 'medium'
  },
  {
    subject: 'math',
    question: 'What is 15 ÷ 3?',
    choices: ['3', '5', '6', '4'],
    correctIndex: 1,
    upvotes: 10,
    difficulty: 'medium'
  },
  {
    subject: 'math',
    question: 'What is 9 + 9?',
    choices: ['17', '18', '19', '20'],
    correctIndex: 1,
    upvotes: 14,
    difficulty: 'easy'
  },
  {
    subject: 'math',
    question: 'What is 20 - 8?',
    choices: ['11', '12', '13', '14'],
    correctIndex: 1,
    upvotes: 11,
    difficulty: 'easy'
  },
  {
    subject: 'math',
    question: 'What is 4 × 9?',
    choices: ['32', '36', '40', '45'],
    correctIndex: 1,
    upvotes: 16,
    difficulty: 'medium'
  },
  {
    subject: 'math',
    question: 'What is 25 + 17?',
    choices: ['41', '42', '43', '44'],
    correctIndex: 1,
    upvotes: 13,
    difficulty: 'medium'
  },
  {
    subject: 'math',
    question: 'What is 8 × 8?',
    choices: ['64', '56', '72', '48'],
    correctIndex: 0,
    upvotes: 20,
    difficulty: 'medium'
  },
  {
    subject: 'math',
    question: 'What is 30 - 15?',
    choices: ['10', '15', '20', '25'],
    correctIndex: 1,
    upvotes: 9,
    difficulty: 'easy'
  },
  {
    subject: 'math',
    question: 'What is 5 × 6?',
    choices: ['25', '30', '35', '40'],
    correctIndex: 1,
    upvotes: 17,
    difficulty: 'easy'
  },
  {
    subject: 'math',
    question: 'What is 100 - 45?',
    choices: ['50', '55', '60', '65'],
    correctIndex: 1,
    upvotes: 8,
    difficulty: 'medium'
  }
];

// Reading questions with voting data
const readingQuestions = [
  {
    subject: 'reading',
    question: 'What is a synonym for "happy"?',
    choices: ['Sad', 'Joyful', 'Angry', 'Tired'],
    correctIndex: 1,
    upvotes: 22,
    difficulty: 'easy'
  },
  {
    subject: 'reading',
    question: 'Which word rhymes with "cat"?',
    choices: ['Dog', 'Hat', 'Run', 'Jump'],
    correctIndex: 1,
    upvotes: 18,
    difficulty: 'easy'
  },
  {
    subject: 'reading',
    question: 'What is the opposite of "big"?',
    choices: ['Large', 'Small', 'Huge', 'Tall'],
    correctIndex: 1,
    upvotes: 20,
    difficulty: 'easy'
  },
  {
    subject: 'reading',
    question: 'How many syllables in "butterfly"?',
    choices: ['1', '2', '3', '4'],
    correctIndex: 2,
    upvotes: 15,
    difficulty: 'medium'
  },
  {
    subject: 'reading',
    question: 'What letter does "apple" start with?',
    choices: ['B', 'A', 'C', 'D'],
    correctIndex: 1,
    upvotes: 25,
    difficulty: 'easy'
  },
  {
    subject: 'reading',
    question: 'Which word is a noun?',
    choices: ['Run', 'Happy', 'Book', 'Quickly'],
    correctIndex: 2,
    upvotes: 14,
    difficulty: 'medium'
  },
  {
    subject: 'reading',
    question: 'What is a synonym for "big"?',
    choices: ['Tiny', 'Large', 'Small', 'Short'],
    correctIndex: 1,
    upvotes: 19,
    difficulty: 'easy'
  },
  {
    subject: 'reading',
    question: 'Which word means the same as "start"?',
    choices: ['End', 'Begin', 'Stop', 'Finish'],
    correctIndex: 1,
    upvotes: 17,
    difficulty: 'easy'
  },
  {
    subject: 'reading',
    question: 'What rhymes with "tree"?',
    choices: ['Free', 'Car', 'Dog', 'Hat'],
    correctIndex: 0,
    upvotes: 16,
    difficulty: 'easy'
  },
  {
    subject: 'reading',
    question: 'Which is a verb?',
    choices: ['Table', 'Red', 'Jump', 'Book'],
    correctIndex: 2,
    upvotes: 13,
    difficulty: 'medium'
  },
  {
    subject: 'reading',
    question: 'What is the plural of "child"?',
    choices: ['Childs', 'Children', 'Childes', 'Childer'],
    correctIndex: 1,
    upvotes: 21,
    difficulty: 'medium'
  },
  {
    subject: 'reading',
    question: 'Which word has 2 syllables?',
    choices: ['Cat', 'Rainbow', 'Dog', 'Sun'],
    correctIndex: 1,
    upvotes: 12,
    difficulty: 'medium'
  }
];

// Finance questions with voting data
const financeQuestions = [
  {
    subject: 'finance',
    question: 'If you have $5 and earn $3 more, how much do you have?',
    choices: ['$2', '$5', '$8', '$10'],
    correctIndex: 2,
    upvotes: 24,
    difficulty: 'easy'
  },
  {
    subject: 'finance',
    question: 'A toy costs $10. You have $15. How much change?',
    choices: ['$5', '$10', '$15', '$25'],
    correctIndex: 0,
    upvotes: 20,
    difficulty: 'easy'
  },
  {
    subject: 'finance',
    question: 'Which coin is worth 25 cents?',
    choices: ['Penny', 'Nickel', 'Dime', 'Quarter'],
    correctIndex: 3,
    upvotes: 18,
    difficulty: 'easy'
  },
  {
    subject: 'finance',
    question: 'How many pennies make a dollar?',
    choices: ['10', '25', '50', '100'],
    correctIndex: 3,
    upvotes: 22,
    difficulty: 'medium'
  },
  {
    subject: 'finance',
    question: 'What does "save money" mean?',
    choices: ['Spend it all', 'Keep it for later', 'Lose it', 'Give it away'],
    correctIndex: 1,
    upvotes: 16,
    difficulty: 'easy'
  },
  {
    subject: 'finance',
    question: 'If candy costs $2 each, how much for 3?',
    choices: ['$3', '$5', '$6', '$8'],
    correctIndex: 2,
    upvotes: 19,
    difficulty: 'medium'
  },
  {
    subject: 'finance',
    question: 'A dime is worth how many cents?',
    choices: ['1', '5', '10', '25'],
    correctIndex: 2,
    upvotes: 17,
    difficulty: 'easy'
  },
  {
    subject: 'finance',
    question: 'You earn $20 and spend $12. How much left?',
    choices: ['$8', '$10', '$12', '$32'],
    correctIndex: 0,
    upvotes: 21,
    difficulty: 'medium'
  },
  {
    subject: 'finance',
    question: 'Which costs more: $5 or $3?',
    choices: ['$3', '$5', 'Same', 'Cannot tell'],
    correctIndex: 1,
    upvotes: 15,
    difficulty: 'easy'
  },
  {
    subject: 'finance',
    question: 'A nickel is worth how many pennies?',
    choices: ['1', '5', '10', '25'],
    correctIndex: 1,
    upvotes: 14,
    difficulty: 'easy'
  },
  {
    subject: 'finance',
    question: 'What is a "budget"?',
    choices: ['Money you find', 'Plan for spending', 'Free money', 'A game'],
    correctIndex: 1,
    upvotes: 23,
    difficulty: 'medium'
  },
  {
    subject: 'finance',
    question: 'If you save $2 per week for 4 weeks, how much total?',
    choices: ['$4', '$6', '$8', '$10'],
    correctIndex: 2,
    upvotes: 20,
    difficulty: 'medium'
  }
];

async function uploadQuestions() {
  console.log('Starting question upload...\n');

  const allQuestions = [
    ...mathQuestions,
    ...readingQuestions,
    ...financeQuestions
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const question of allQuestions) {
    try {
      const questionData = {
        ...question,
        author: 'system',
        downvotes: 0,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'questions'), questionData);
      console.log(`✓ Added ${question.subject} question: "${question.question.substring(0, 40)}..." (ID: ${docRef.id})`);
      successCount++;
    } catch (error) {
      console.error(`✗ Error adding question: ${question.question}`);
      console.error(`  Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n=== Upload Complete ===`);
  console.log(`✓ Successfully uploaded: ${successCount} questions`);
  console.log(`✗ Failed to upload: ${errorCount} questions`);
  console.log(`\nBreakdown:`);
  console.log(`  Math: ${mathQuestions.length} questions`);
  console.log(`  Reading: ${readingQuestions.length} questions`);
  console.log(`  Finance: ${financeQuestions.length} questions`);
  console.log(`  Total: ${allQuestions.length} questions`);

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the upload
uploadQuestions().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
