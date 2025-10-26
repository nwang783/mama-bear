# 🐻 Mama Bear Learning

A free educational platform for teaching children financial literacy through interactive retro-style games.

## Overview

Mama Bear Learning transforms financial education into an engaging adventure. Children explore three unique villages, each focused on a core money concept. Parents and educators can upload their own content (PDFs) which are automatically converted into playable question sets using AI.

### The Three Villages

- 💼 **Earning Village** - Learn about earning money through work, entrepreneurship, and value creation
- 🏦 **Saving Village** - Master saving strategies, goal-setting, and growing money over time  
- 🛒 **Spending Village** - Make smart spending choices, budgeting, and distinguishing needs vs wants

## Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router v7** - Client-side routing
- **Phaser 3** - Game engine for 2D retro gameplay
- **Vanilla CSS** - Custom retro/pixel-art styling

### Backend & Services
- **Firebase Firestore** - Question and question set storage
- **Firebase Storage** - PDF file storage
- **Firebase Functions (Python)** - Serverless backend
  - PDF question extraction using OpenAI GPT-4o-mini
  - Gemini Live API ephemeral token generation
- **Google Gemini API** - AI-powered chat assistance

### Development
- **Create React App** - Build tooling
- **Firebase Hosting** - Deployment

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for backend features)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mama-bear
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase (see [Firebase Setup](#firebase-setup) below)

### Running the App

Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable the following services:
   - Firestore Database
   - Storage
   - Functions
   - Hosting (optional)

3. Create `src/firebase/config.js` with your Firebase config:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getStorage } from 'firebase/storage';
   import { getFunctions } from 'firebase/functions';

   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   export const storage = getStorage(app);
   export const functions = getFunctions(app);
   ```

4. Set up Firebase Functions (see `functions/README.md` for detailed instructions)

## Project Structure

```
mama-bear/
├── public/
│   ├── assets/                  # Game assets and images
│   ├── index.html
│   ├── favicon.svg              # Mama Bear logo
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── LandingPage.js       # Marketing landing page
│   │   ├── LandingPage.css
│   │   ├── Game.js              # Phaser game wrapper
│   │   ├── Game.css
│   │   ├── QuestionExtractor.js # PDF upload interface
│   │   └── FruitCatch.js        # Standalone fruit catch game
│   ├── game/
│   │   ├── config/
│   │   │   ├── gameConfig.js    # Centralized game settings
│   │   │   └── questionProviders.js
│   │   ├── entities/
│   │   │   ├── Player.js        # Playable character
│   │   │   ├── CatNPC.js        # Wandering cat companion
│   │   │   ├── ChatBotNPC.js    # AI chat assistant NPC
│   │   │   ├── House.js         # Interactive buildings
│   │   │   └── Village.js       # Village entity
│   │   ├── scenes/
│   │   │   ├── BootScene.js     # Asset loading
│   │   │   ├── WorldScene.js    # Main overworld map
│   │   │   ├── VillageScene.js  # Base village scene
│   │   │   ├── EarningVillageScene.js
│   │   │   ├── SavingVillageScene.js
│   │   │   ├── SpendingVillageScene.js
│   │   │   ├── QuestionSetSelectionScene.js
│   │   │   ├── FruitCollectorScene.js  # Q&A mini-game
│   │   │   ├── FishingScene.js         # Q&A mini-game
│   │   │   ├── ChatScene.js            # AI assistant chat
│   │   │   └── UIScene.js              # HUD overlay
│   │   ├── utils/
│   │   │   └── audioUtils.js    # Music management
│   │   └── FruitCatchScene.js
│   ├── firebase/
│   │   ├── config.js            # Firebase initialization
│   │   ├── questionSetsService.js
│   │   ├── questionsService.js
│   │   └── pdfExtractionService.js
│   ├── App.js                   # Main app with routing
│   ├── App.css
│   └── index.js                 # Entry point
├── functions/                   # Firebase Functions (Python)
│   ├── main.py                  # Cloud functions
│   ├── requirements.txt
│   └── README.md               # Functions documentation
└── package.json
```

## Features

### ✅ Implemented Features

#### Game Experience
- **Retro pixel-art aesthetic** with custom sprites and animations
- **Open-world navigation** - Explore a large map with three distinct villages
- **Interactive NPCs** - Meet wandering cats and chat with Mama Bear AI
- **Multiple mini-games**:
  - 🍇 Fruit Collector - Catch falling fruits while answering questions
  - 🎣 Fishing Game - Reel in fish by answering correctly
- **Question-based progression** - Answer correctly to advance
- **Dynamic backgrounds** with parallax scrolling

#### Content Management  
- **PDF Upload System** - Parents/educators upload learning materials
- **AI Question Extraction** - Automatic conversion to multiple-choice questions
- **Question Sets** - Organized by difficulty and topic
- **Community Question Library** - Browse and play curated content
- **Three Subject Domains** - Questions tagged for earning, saving, or spending

#### Technical Features
- **Responsive design** - Works on desktop and tablet
- **Firebase integration** - Real-time data sync
- **Camera follow system** - Smooth player tracking
- **Collision detection** - Physics-based interactions
- **Audio system** - Background music per village (mutable)
- **Scene transitions** - Seamless navigation between areas

### 🚧 Future Enhancements

- [ ] User authentication and profiles
- [ ] Progress tracking and save states
- [ ] Achievements and reward system
- [ ] Character customization
- [ ] Multiplayer features
- [ ] More mini-games (budgeting simulator, store management, etc.)
- [ ] Parent/teacher dashboard
- [ ] Analytics and learning insights
- [ ] Mobile app (React Native)
- [ ] Voice interaction with Mama Bear

## Game Controls

- **Arrow Keys** or **WASD** - Move player
- **E** - Interact with buildings/NPCs
- **M** - Mute/unmute music
- **Mouse** - Click UI buttons

## Contributing

Contributions are welcome! This project was created for a hackathon but is actively being developed.

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Run tests and linter
4. Update documentation
5. Submit a pull request

### Code Style

- Use ES6+ JavaScript
- Follow existing naming conventions
- Add comments for complex game logic
- Keep scenes modular and reusable

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Phaser 3 community for excellent game development resources
- Firebase for backend infrastructure  
- OpenAI for question extraction capabilities
- Google Gemini for AI chat features
- All contributors and testers

## Support

For questions, issues, or suggestions:
- Open a GitHub issue
- Check existing documentation
- Review `functions/README.md` for backend setup

## Project Status

🟢 **Active Development** - This project is under active development with regular updates.
