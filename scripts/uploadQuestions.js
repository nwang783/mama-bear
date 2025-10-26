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
  earning: [
    {
      name: 'Allowance Basics',
      description: 'Learn about earning an allowance',
      difficulty: 'easy',
      upvotes: 25,
      questions: [
        {
          question: 'If you earn $2 allowance each week, how much after 2 weeks?',
          choices: ['$2', '$4', '$6', '$8'],
          correctIndex: 1
        },
        {
          question: 'You get $5 for doing chores. How much for doing chores twice?',
          choices: ['$5', '$10', '$15', '$20'],
          correctIndex: 1
        },
        {
          question: 'Mom gives you $3 on Monday and $3 on Friday. Total earned?',
          choices: ['$3', '$6', '$9', '$12'],
          correctIndex: 1
        },
        {
          question: 'You earn $1 per day for a week (7 days). How much total?',
          choices: ['$5', '$6', '$7', '$8'],
          correctIndex: 2
        }
      ]
    },
    {
      name: 'Chores & Money',
      description: 'Earn money by helping at home',
      difficulty: 'easy',
      upvotes: 20,
      questions: [
        {
          question: 'Which chore might help you earn money at home?',
          choices: ['Watching TV', 'Washing dishes', 'Playing games', 'Sleeping'],
          correctIndex: 1
        },
        {
          question: 'You earn $2 for cleaning your room. Fair payment?',
          choices: ['Yes', 'No', 'Maybe', 'Too much'],
          correctIndex: 0
        },
        {
          question: 'Dad pays $5 to mow the lawn. How many times to earn $15?',
          choices: ['2 times', '3 times', '4 times', '5 times'],
          correctIndex: 1
        },
        {
          question: 'Walking the dog pays $1. Washing car pays $3. Which earns more?',
          choices: ['Dog walking', 'Washing car', 'Same', 'Neither'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Jobs for Kids',
      description: 'Ways kids can earn money',
      difficulty: 'medium',
      upvotes: 30,
      questions: [
        {
          question: 'Which is a good way for kids to earn money?',
          choices: ['Lemonade stand', 'Asking for gifts', 'Taking money', 'Watching TV'],
          correctIndex: 0
        },
        {
          question: 'You sell 4 cookies for $1 each. How much do you earn?',
          choices: ['$2', '$3', '$4', '$5'],
          correctIndex: 2
        },
        {
          question: 'What does "earning money" mean?',
          choices: ['Finding it', 'Getting it for work', 'Stealing it', 'Borrowing it'],
          correctIndex: 1
        },
        {
          question: 'You babysit for $8/hour for 2 hours. Total earned?',
          choices: ['$8', '$10', '$14', '$16'],
          correctIndex: 3
        }
      ]
    },
    {
      name: 'Entrepreneurship',
      description: 'Start your own small business',
      difficulty: 'medium',
      upvotes: 15,
      questions: [
        {
          question: 'You sell lemonade for $0.50 per cup. 10 cups earns how much?',
          choices: ['$3', '$4', '$5', '$6'],
          correctIndex: 2
        },
        {
          question: 'What is a "business"?',
          choices: ['A school', 'Selling goods/services', 'A toy', 'A game'],
          correctIndex: 1
        },
        {
          question: 'You make bracelets and sell each for $2. Sell 6, earn?',
          choices: ['$10', '$12', '$14', '$16'],
          correctIndex: 1
        },
        {
          question: 'Why might someone pay you to do a job?',
          choices: ['They are kind', 'You provide value', 'They have to', 'It is fun'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Work & Rewards',
      description: 'Understanding work and payment',
      difficulty: 'hard',
      upvotes: 18,
      questions: [
        {
          question: 'You work 3 hours at $4/hour. Total earned?',
          choices: ['$7', '$12', '$15', '$20'],
          correctIndex: 1
        },
        {
          question: 'Fair pay means getting paid based on what?',
          choices: ['Your age', 'Your work', 'Your height', 'Your wishes'],
          correctIndex: 1
        },
        {
          question: 'You earn $20 and split it equally with a friend. Each gets?',
          choices: ['$5', '$10', '$15', '$20'],
          correctIndex: 1
        },
        {
          question: 'Which job likely pays more per hour?',
          choices: ['Walking dogs', 'Being a doctor', 'Playing', 'Eating lunch'],
          correctIndex: 1
        }
      ]
    }
  ],
  saving: [
    {
      name: 'Piggy Bank Basics',
      description: 'Learn to save your money',
      difficulty: 'easy',
      upvotes: 28,
      questions: [
        {
          question: 'What does it mean to "save money"?',
          choices: ['Spend it all', 'Keep it for later', 'Lose it', 'Give it away'],
          correctIndex: 1
        },
        {
          question: 'You have $10 and save $5. How much did you save?',
          choices: ['$5', '$10', '$15', '$20'],
          correctIndex: 0
        },
        {
          question: 'Where is a safe place to save money?',
          choices: ['On the ground', 'In a bank', 'Give to strangers', 'Throw away'],
          correctIndex: 1
        },
        {
          question: 'You save $2 each week for 3 weeks. Total saved?',
          choices: ['$2', '$4', '$6', '$8'],
          correctIndex: 2
        }
      ]
    },
    {
      name: 'Saving Goals',
      description: 'Save money for things you want',
      difficulty: 'easy',
      upvotes: 22,
      questions: [
        {
          question: 'You want a $10 toy. You have $4. How much more to save?',
          choices: ['$4', '$6', '$10', '$14'],
          correctIndex: 1
        },
        {
          question: 'What is a "savings goal"?',
          choices: ['Spending everything', 'Saving for something', 'Losing money', 'A game'],
          correctIndex: 1
        },
        {
          question: 'You save $1 per day. In 5 days, how much saved?',
          choices: ['$1', '$3', '$5', '$7'],
          correctIndex: 2
        },
        {
          question: 'Which is a good reason to save money?',
          choices: ['To buy something later', 'To forget about it', 'To lose it', 'No reason'],
          correctIndex: 0
        }
      ]
    },
    {
      name: 'Growing Your Savings',
      description: 'Watch your money grow',
      difficulty: 'medium',
      upvotes: 20,
      questions: [
        {
          question: 'You have $20 saved. You add $5 more. New total?',
          choices: ['$15', '$20', '$25', '$30'],
          correctIndex: 2
        },
        {
          question: 'What is "interest" on savings?',
          choices: ['Losing money', 'Extra money earned', 'Spending money', 'Finding money'],
          correctIndex: 1
        },
        {
          question: 'If you save $3 per week for 4 weeks, total saved?',
          choices: ['$9', '$12', '$15', '$18'],
          correctIndex: 1
        },
        {
          question: 'Why is it good to save regularly?',
          choices: ['It is boring', 'Money grows over time', 'It is hard', 'No reason'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Emergency Savings',
      description: 'Save for unexpected needs',
      difficulty: 'easy',
      upvotes: 25,
      questions: [
        {
          question: 'What is an "emergency fund"?',
          choices: ['Fun money', 'Money for surprises', 'Lunch money', 'Toy money'],
          correctIndex: 1
        },
        {
          question: 'You save $10 for emergencies. Your bike breaks. Good to use it?',
          choices: ['Yes', 'No', 'Maybe', 'Never'],
          correctIndex: 0
        },
        {
          question: 'How much of your money should you try to save?',
          choices: ['None', 'All of it', 'Some of it', 'Depends'],
          correctIndex: 2
        },
        {
          question: 'Which is an emergency?',
          choices: ['Want new toy', 'Lost wallet', 'Bored', 'Hungry for candy'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Saving Strategies',
      description: 'Smart ways to save money',
      difficulty: 'medium',
      upvotes: 16,
      questions: [
        {
          question: 'Which helps you save more money?',
          choices: ['Buy everything', 'Save first, spend later', 'Spend all', 'Forget about it'],
          correctIndex: 1
        },
        {
          question: 'You get $10. Save 50%. How much saved?',
          choices: ['$2', '$5', '$7', '$10'],
          correctIndex: 1
        },
        {
          question: 'Why use a piggy bank or bank account?',
          choices: ['To lose money', 'Keep money safe', 'Make it disappear', 'To hide it'],
          correctIndex: 1
        },
        {
          question: 'Which shows good saving habits?',
          choices: ['Spend immediately', 'Save regularly', 'Never save', 'Forget about money'],
          correctIndex: 1
        }
      ]
    }
  ],
  spending: [
    {
      name: 'Needs vs Wants',
      description: 'Learn the difference',
      difficulty: 'easy',
      upvotes: 26,
      questions: [
        {
          question: 'Which is a "need"?',
          choices: ['Candy', 'Food', 'Toys', 'Video games'],
          correctIndex: 1
        },
        {
          question: 'Which is a "want"?',
          choices: ['Water', 'Shelter', 'New bike', 'Clothes'],
          correctIndex: 2
        },
        {
          question: 'Should you buy needs or wants first?',
          choices: ['Wants', 'Needs', 'Both same', 'Neither'],
          correctIndex: 1
        },
        {
          question: 'You have $5. Need lunch ($3), want toy ($4). What to buy?',
          choices: ['Toy', 'Lunch', 'Both', 'Neither'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Price Comparison',
      description: 'Find the best deals',
      difficulty: 'medium',
      upvotes: 22,
      questions: [
        {
          question: 'Same toy: Store A $10, Store B $8. Which is better?',
          choices: ['Store A', 'Store B', 'Same', 'Cannot tell'],
          correctIndex: 1
        },
        {
          question: 'You want 4 apples. $1 each or $3 for 4. Better deal?',
          choices: ['$1 each', '$3 for 4', 'Same', 'Cannot tell'],
          correctIndex: 1
        },
        {
          question: 'Why compare prices before buying?',
          choices: ['To waste time', 'To save money', 'It is fun', 'No reason'],
          correctIndex: 1
        },
        {
          question: 'Shirt costs $15 on sale, was $20. How much saved?',
          choices: ['$3', '$5', '$10', '$15'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Smart Shopping',
      description: 'Make wise purchases',
      difficulty: 'easy',
      upvotes: 24,
      questions: [
        {
          question: 'You have $10. Toy costs $12. Can you buy it?',
          choices: ['Yes', 'No', 'Maybe', 'Not sure'],
          correctIndex: 1
        },
        {
          question: 'What should you check before buying something?',
          choices: ['The color', 'If you have enough money', 'The size', 'The brand'],
          correctIndex: 1
        },
        {
          question: 'You see a toy you want. What should you do first?',
          choices: ['Buy it now', 'Check the price', 'Ask for it', 'Take it'],
          correctIndex: 1
        },
        {
          question: 'Why make a shopping list?',
          choices: ['To forget things', 'To buy what you need', 'To waste paper', 'No reason'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Budgeting for Spending',
      description: 'Plan your purchases',
      difficulty: 'medium',
      upvotes: 19,
      questions: [
        {
          question: 'You have $20 to spend this week. Spend $15 Monday. How much left?',
          choices: ['$3', '$5', '$10', '$15'],
          correctIndex: 1
        },
        {
          question: 'What is a "budget"?',
          choices: ['Money you find', 'A spending plan', 'Free money', 'A game'],
          correctIndex: 1
        },
        {
          question: 'You budget $10 for fun. Good to spend $12?',
          choices: ['Yes', 'No', 'Maybe', 'Always'],
          correctIndex: 1
        },
        {
          question: 'Why is budgeting important?',
          choices: ['It is boring', 'Helps not overspend', 'Takes too long', 'No reason'],
          correctIndex: 1
        }
      ]
    },
    {
      name: 'Making Change',
      description: 'Practice with money',
      difficulty: 'medium',
      upvotes: 17,
      questions: [
        {
          question: 'Item costs $7. You pay $10. How much change?',
          choices: ['$2', '$3', '$4', '$5'],
          correctIndex: 1
        },
        {
          question: 'You buy candy for $3. Pay with $5. Change?',
          choices: ['$1', '$2', '$3', '$4'],
          correctIndex: 1
        },
        {
          question: 'Book costs $12. Pay with $20. Change?',
          choices: ['$6', '$7', '$8', '$9'],
          correctIndex: 2
        },
        {
          question: 'Why is it important to count your change?',
          choices: ['To waste time', 'To check it is correct', 'It is fun', 'No reason'],
          correctIndex: 1
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
  for (const subject of ['earning', 'saving', 'spending']) {
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
  console.log(`  Earning: ${questionSets.earning.length} sets`);
  console.log(`  Saving: ${questionSets.saving.length} sets`);
  console.log(`  Spending: ${questionSets.spending.length} sets`);
  console.log(`  Total: ${totalSetsCreated} sets with ${totalQuestionsCreated} questions`);

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the upload
uploadQuestionSets().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
