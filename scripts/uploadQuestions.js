/**
 * Script to upload initial question sets and questions to Firebase
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

// Define Question Sets
const questionSets = {
  math: [
    {
      name: 'Addition Basics',
      description: 'Practice simple addition problems',
      difficulty: 'easy',
      upvotes: 25,
      questions: [
        {
          question: 'What is 7 + 8?',
          choices: ['13', '15', '16', '14'],
          correctIndex: 1
        },
        {
          question: 'What is 9 + 9?',
          choices: ['17', '18', '19', '20'],
          correctIndex: 1
        },
        {
          question: 'What is 5 + 6?',
          choices: ['10', '11', '12', '13'],
          correctIndex: 1
        },
        {
          question: 'What is 25 + 17?',
          choices: ['41', '42', '43', '44'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Subtraction Practice',
      description: 'Learn subtraction with ease',
      difficulty: 'easy',
      upvotes: 20,
      questions: [
        {
          question: 'What is 12 - 5?',
          choices: ['7', '8', '6', '9'],
          correctIndex: 0
        },
        {
          question: 'What is 20 - 8?',
          choices: ['11', '12', '13', '14'],
          correctIndex: 1
        },
        {
          question: 'What is 30 - 15?',
          choices: ['10', '15', '20', '25'],
          correctIndex: 1
        },
        {
          question: 'What is 100 - 45?',
          choices: ['50', '55', '60', '65'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Multiplication Master',
      description: 'Times tables made fun',
      difficulty: 'medium',
      upvotes: 30,
      questions: [
        {
          question: 'What is 6 × 7?',
          choices: ['42', '48', '36', '54'],
          correctIndex: 0
        },
        {
          question: 'What is 4 × 9?',
          choices: ['32', '36', '40', '45'],
          correctIndex: 1
        },
        {
          question: 'What is 8 × 8?',
          choices: ['64', '56', '72', '48'],
          correctIndex: 0
        },
        {
          question: 'What is 5 × 6?',
          choices: ['25', '30', '35', '40'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Division Challenge',
      description: 'Practice division skills',
      difficulty: 'medium',
      upvotes: 15,
      questions: [
        {
          question: 'What is 15 ÷ 3?',
          choices: ['3', '5', '6', '4'],
          correctIndex: 1
        },
        {
          question: 'What is 24 ÷ 6?',
          choices: ['4', '5', '6', '3'],
          correctIndex: 0
        },
        {
          question: 'What is 36 ÷ 9?',
          choices: ['3', '4', '5', '6'],
          correctIndex: 1
        },
        {
          question: 'What is 48 ÷ 8?',
          choices: ['5', '6', '7', '8'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Mixed Operations',
      description: 'All operations combined',
      difficulty: 'hard',
      upvotes: 18,
      questions: [
        {
          question: 'What is 7 + 8?',
          choices: ['13', '15', '16', '14'],
          correctIndex: 1
        },
        {
          question: 'What is 20 - 8?',
          choices: ['11', '12', '13', '14'],
          correctIndex: 1
        },
        {
          question: 'What is 6 × 7?',
          choices: ['42', '48', '36', '54'],
          correctIndex: 0
        },
        {
          question: 'What is 15 ÷ 3?',
          choices: ['3', '5', '6', '4'],
          correctIndex: 1
        }
      ]
    }
  ],
  reading: [
    {
      name: 'Synonyms & Antonyms',
      description: 'Master word meanings',
      difficulty: 'easy',
      upvotes: 28,
      questions: [
        {
          question: 'What is a synonym for "happy"?',
          choices: ['Sad', 'Joyful', 'Angry', 'Tired'],
          correctIndex: 1
        },
        {
          question: 'What is the opposite of "big"?',
          choices: ['Large', 'Small', 'Huge', 'Tall'],
          correctIndex: 1
        },
        {
          question: 'What is a synonym for "big"?',
          choices: ['Tiny', 'Large', 'Small', 'Short'],
          correctIndex: 1
        },
        {
          question: 'Which word means the same as "start"?',
          choices: ['End', 'Begin', 'Stop', 'Finish'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Rhyming Words',
      description: 'Find words that rhyme',
      difficulty: 'easy',
      upvotes: 22,
      questions: [
        {
          question: 'Which word rhymes with "cat"?',
          choices: ['Dog', 'Hat', 'Run', 'Jump'],
          correctIndex: 1
        },
        {
          question: 'What rhymes with "tree"?',
          choices: ['Free', 'Car', 'Dog', 'Hat'],
          correctIndex: 0
        },
        {
          question: 'What rhymes with "book"?',
          choices: ['Cook', 'Ball', 'Sun', 'Fish'],
          correctIndex: 0
        },
        {
          question: 'What rhymes with "play"?',
          choices: ['Day', 'Night', 'Go', 'Stop'],
          correctIndex: 0
        }
      ]
    },
    {
      name: 'Parts of Speech',
      description: 'Identify nouns, verbs, and more',
      difficulty: 'medium',
      upvotes: 20,
      questions: [
        {
          question: 'Which word is a noun?',
          choices: ['Run', 'Happy', 'Book', 'Quickly'],
          correctIndex: 2
        },
        {
          question: 'Which is a verb?',
          choices: ['Table', 'Red', 'Jump', 'Book'],
          correctIndex: 2
        },
        {
          question: 'Which is an adjective?',
          choices: ['Happy', 'Run', 'Book', 'Today'],
          correctIndex: 0
        },
        {
          question: 'Which is an adverb?',
          choices: ['Book', 'Red', 'Jump', 'Quickly'],
          correctIndex: 3
        }
      ]
    },
    {
      name: 'Alphabet & Letters',
      description: 'Letter recognition and basics',
      difficulty: 'easy',
      upvotes: 25,
      questions: [
        {
          question: 'What letter does "apple" start with?',
          choices: ['B', 'A', 'C', 'D'],
          correctIndex: 1
        },
        {
          question: 'Which letter comes after M?',
          choices: ['L', 'N', 'O', 'P'],
          correctIndex: 1
        },
        {
          question: 'What letter does "zebra" start with?',
          choices: ['X', 'Y', 'Z', 'W'],
          correctIndex: 2
        },
        {
          question: 'How many letters in the alphabet?',
          choices: ['24', '25', '26', '27'],
          correctIndex: 2
        }
      ]
    },
    {
      name: 'Word Structure',
      description: 'Syllables and word forms',
      difficulty: 'medium',
      upvotes: 16,
      questions: [
        {
          question: 'How many syllables in "butterfly"?',
          choices: ['1', '2', '3', '4'],
          correctIndex: 2
        },
        {
          question: 'What is the plural of "child"?',
          choices: ['Childs', 'Children', 'Childes', 'Childer'],
          correctIndex: 1
        },
        {
          question: 'Which word has 2 syllables?',
          choices: ['Cat', 'Rainbow', 'Dog', 'Sun'],
          correctIndex: 1
        },
        {
          question: 'What is the past tense of "run"?',
          choices: ['Runned', 'Ran', 'Running', 'Runs'],
          correctIndex: 1
        }
      ]
    }
  ],
  finance: [
    {
      name: 'Coin Values',
      description: 'Learn about pennies, nickels, and more',
      difficulty: 'easy',
      upvotes: 26,
      questions: [
        {
          question: 'Which coin is worth 25 cents?',
          choices: ['Penny', 'Nickel', 'Dime', 'Quarter'],
          correctIndex: 3
        },
        {
          question: 'A dime is worth how many cents?',
          choices: ['1', '5', '10', '25'],
          correctIndex: 2
        },
        {
          question: 'A nickel is worth how many pennies?',
          choices: ['1', '5', '10', '25'],
          correctIndex: 1
        },
        {
          question: 'How many pennies make a dollar?',
          choices: ['10', '25', '50', '100'],
          correctIndex: 3
        }
      ]
    },
    {
      name: 'Making Change',
      description: 'Practice calculating change',
      difficulty: 'medium',
      upvotes: 22,
      questions: [
        {
          question: 'A toy costs $10. You have $15. How much change?',
          choices: ['$5', '$10', '$15', '$25'],
          correctIndex: 0
        },
        {
          question: 'You buy candy for $3. You pay with $5. Change?',
          choices: ['$1', '$2', '$3', '$4'],
          correctIndex: 1
        },
        {
          question: 'Item costs $7. You pay $10. Change?',
          choices: ['$2', '$3', '$4', '$5'],
          correctIndex: 1
        },
        {
          question: 'Book costs $12. You pay $20. Change?',
          choices: ['$6', '$7', '$8', '$9'],
          correctIndex: 2
        }
      ]
    },
    {
      name: 'Money Math',
      description: 'Addition and subtraction with money',
      difficulty: 'easy',
      upvotes: 24,
      questions: [
        {
          question: 'If you have $5 and earn $3 more, how much do you have?',
          choices: ['$2', '$5', '$8', '$10'],
          correctIndex: 2
        },
        {
          question: 'You earn $20 and spend $12. How much left?',
          choices: ['$8', '$10', '$12', '$32'],
          correctIndex: 0
        },
        {
          question: 'Which costs more: $5 or $3?',
          choices: ['$3', '$5', 'Same', 'Cannot tell'],
          correctIndex: 1
        },
        {
          question: 'If candy costs $2 each, how much for 3?',
          choices: ['$3', '$5', '$6', '$8'],
          correctIndex: 2
        }
      ]
    },
    {
      name: 'Budgeting Basics',
      description: 'Learn to plan spending',
      difficulty: 'medium',
      upvotes: 19,
      questions: [
        {
          question: 'What does "save money" mean?',
          choices: ['Spend it all', 'Keep it for later', 'Lose it', 'Give it away'],
          correctIndex: 1
        },
        {
          question: 'What is a "budget"?',
          choices: ['Money you find', 'Plan for spending', 'Free money', 'A game'],
          correctIndex: 1
        },
        {
          question: 'If you save $2 per week for 4 weeks, how much total?',
          choices: ['$4', '$6', '$8', '$10'],
          correctIndex: 2
        },
        {
          question: 'You have $20. Save $5. How much to spend?',
          choices: ['$10', '$15', '$20', '$25'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Shopping Smart',
      description: 'Make good buying decisions',
      difficulty: 'medium',
      upvotes: 17,
      questions: [
        {
          question: 'Which costs more: $5 or $3?',
          choices: ['$3', '$5', 'Same', 'Cannot tell'],
          correctIndex: 1
        },
        {
          question: 'You have $10. Can you buy a $12 toy?',
          choices: ['Yes', 'No', 'Maybe', 'Not sure'],
          correctIndex: 1
        },
        {
          question: 'Best deal: $5 for 2 or $3 for 1?',
          choices: ['$5 for 2', '$3 for 1', 'Same', 'Cannot tell'],
          correctIndex: 0
        },
        {
          question: 'You want a $15 game. You have $12. How much more?',
          choices: ['$1', '$2', '$3', '$4'],
          correctIndex: 2
        }
      ]
    }
  ]
};

async function uploadQuestionSets() {
  console.log('Starting question sets and questions upload...\n');

  let totalSetsCreated = 0;
  let totalQuestionsCreated = 0;
  let errorCount = 0;

  // Process each subject
  for (const subject of ['math', 'reading', 'finance']) {
    console.log(`\n=== Processing ${subject.toUpperCase()} ===`);
    
    const sets = questionSets[subject];
    
    for (const setData of sets) {
      try {
        // Create the question set
        const setDoc = {
          name: setData.name,
          description: setData.description,
          subject: subject,
          createdBy: 'system',
          upvotes: setData.upvotes,
          downvotes: 0,
          questionCount: setData.questions.length,
          difficulty: setData.difficulty,
          tags: [],
          createdAt: serverTimestamp()
        };

        const setRef = await addDoc(collection(db, 'questionSets'), setDoc);
        console.log(`✓ Created set: "${setData.name}" (ID: ${setRef.id}, ${setData.questions.length} questions)`);
        totalSetsCreated++;

        // Add questions for this set
        for (let i = 0; i < setData.questions.length; i++) {
          const q = setData.questions[i];
          
          const questionDoc = {
            subject: subject,
            question: q.question,
            choices: q.choices,
            correctIndex: q.correctIndex,
            questionSetId: setRef.id,
            orderInSet: i,
            difficulty: setData.difficulty,
            createdBy: 'system',
            upvotes: 0,
            downvotes: 0,
            createdAt: serverTimestamp()
          };

          await addDoc(collection(db, 'questions'), questionDoc);
          totalQuestionsCreated++;
        }

      } catch (error) {
        console.error(`✗ Error creating set "${setData.name}":`, error.message);
        errorCount++;
      }
    }
  }

  console.log(`\n=== Upload Complete ===`);
  console.log(`✓ Successfully created: ${totalSetsCreated} question sets`);
  console.log(`✓ Successfully created: ${totalQuestionsCreated} questions`);
  console.log(`✗ Errors: ${errorCount}`);
  console.log(`\nBreakdown by subject:`);
  console.log(`  Math: ${questionSets.math.length} sets`);
  console.log(`  Reading: ${questionSets.reading.length} sets`);
  console.log(`  Finance: ${questionSets.finance.length} sets`);
  console.log(`  Total: ${totalSetsCreated} sets with ${totalQuestionsCreated} questions`);

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the upload
uploadQuestionSets().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
