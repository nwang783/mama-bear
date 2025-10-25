/**
 * Question providers for different subjects
 * Each provider returns an array of question objects with:
 * - question: string (the question text)
 * - choices: array of strings (answer choices)
 * - correctIndex: number (index of correct answer in choices array)
 */

/**
 * Generate math questions
 */
export function getMathQuestions(count = 10) {
  const questions = [];
  const operations = [
    { symbol: '+', name: 'addition', minNum: 1, maxNum: 20 },
    { symbol: '-', name: 'subtraction', minNum: 5, maxNum: 30 },
    { symbol: '×', name: 'multiplication', minNum: 1, maxNum: 10 }
  ];

  for (let i = 0; i < count; i++) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, correctAnswer;

    switch (op.symbol) {
      case '+':
        num1 = Math.floor(Math.random() * (op.maxNum - op.minNum + 1)) + op.minNum;
        num2 = Math.floor(Math.random() * (op.maxNum - op.minNum + 1)) + op.minNum;
        correctAnswer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * (op.maxNum - op.minNum + 1)) + op.minNum;
        num2 = Math.floor(Math.random() * num1) + 1;
        correctAnswer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * (op.maxNum - op.minNum + 1)) + op.minNum;
        num2 = Math.floor(Math.random() * (op.maxNum - op.minNum + 1)) + op.minNum;
        correctAnswer = num1 * num2;
        break;
      default:
        correctAnswer = 0;
    }

    // Generate wrong answers
    const choices = [correctAnswer];
    while (choices.length < 4) {
      const offset = Math.floor(Math.random() * 10) - 5; // -5 to +5
      const wrongAnswer = correctAnswer + offset;
      if (wrongAnswer > 0 && !choices.includes(wrongAnswer)) {
        choices.push(wrongAnswer);
      }
    }

    // Shuffle choices
    for (let j = choices.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [choices[j], choices[k]] = [choices[k], choices[j]];
    }

    questions.push({
      question: `${num1} ${op.symbol} ${num2} = ?`,
      choices: choices.map(String),
      correctIndex: choices.indexOf(correctAnswer)
    });
  }

  return questions;
}

/**
 * Generate reading questions
 */
export function getReadingQuestions(count = 10) {
  const questionBank = [
    {
      question: 'What is a synonym for "happy"?',
      choices: ['Sad', 'Joyful', 'Angry', 'Tired'],
      correctIndex: 1
    },
    {
      question: 'Which word rhymes with "cat"?',
      choices: ['Dog', 'Hat', 'Run', 'Jump'],
      correctIndex: 1
    },
    {
      question: 'What is the opposite of "big"?',
      choices: ['Large', 'Small', 'Huge', 'Tall'],
      correctIndex: 1
    },
    {
      question: 'How many syllables in "butterfly"?',
      choices: ['1', '2', '3', '4'],
      correctIndex: 2
    },
    {
      question: 'What letter does "apple" start with?',
      choices: ['B', 'A', 'C', 'D'],
      correctIndex: 1
    },
    {
      question: 'Which word is a noun?',
      choices: ['Run', 'Happy', 'Book', 'Quickly'],
      correctIndex: 2
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
    },
    {
      question: 'What rhymes with "tree"?',
      choices: ['Free', 'Car', 'Dog', 'Hat'],
      correctIndex: 0
    },
    {
      question: 'Which is a verb?',
      choices: ['Table', 'Red', 'Jump', 'Book'],
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
    }
  ];

  // Shuffle and return requested count
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, questionBank.length));
}

/**
 * Generate finance questions
 */
export function getFinanceQuestions(count = 10) {
  const questionBank = [
    {
      question: 'If you have $5 and earn $3 more, how much do you have?',
      choices: ['$2', '$5', '$8', '$10'],
      correctIndex: 2
    },
    {
      question: 'A toy costs $10. You have $15. How much change?',
      choices: ['$5', '$10', '$15', '$25'],
      correctIndex: 0
    },
    {
      question: 'Which coin is worth 25 cents?',
      choices: ['Penny', 'Nickel', 'Dime', 'Quarter'],
      correctIndex: 3
    },
    {
      question: 'How many pennies make a dollar?',
      choices: ['10', '25', '50', '100'],
      correctIndex: 3
    },
    {
      question: 'What does "save money" mean?',
      choices: ['Spend it all', 'Keep it for later', 'Lose it', 'Give it away'],
      correctIndex: 1
    },
    {
      question: 'If candy costs $2 each, how much for 3?',
      choices: ['$3', '$5', '$6', '$8'],
      correctIndex: 2
    },
    {
      question: 'A dime is worth how many cents?',
      choices: ['1', '5', '10', '25'],
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
      question: 'A nickel is worth how many pennies?',
      choices: ['1', '5', '10', '25'],
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
    }
  ];

  // Shuffle and return requested count
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, questionBank.length));
}

/**
 * Get questions based on subject/village type
 */
export function getQuestionsBySubject(subject, count = 10) {
  switch (subject.toLowerCase()) {
    case 'math':
      return getMathQuestions(count);
    case 'reading':
      return getReadingQuestions(count);
    case 'finance':
      return getFinanceQuestions(count);
    default:
      return getMathQuestions(count);
  }
}
