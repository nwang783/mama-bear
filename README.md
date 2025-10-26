# 🐻 Mama Bear Learning

A free educational platform for teaching children financial literacy through interactive games.

## Overview

Mama Bear Learning is a hackathon project that allows parents to upload educational content and transform it into engaging 2D games. Children can explore different villages, each focused on a specific aspect of financial literacy:

- 💼 **Earning Village** - Learn about earning money through work and entrepreneurship
- 🏦 **Saving Village** - Understand saving, goals, and growing your money
- 🛒 **Spending Village** - Make smart spending choices and budget wisely

## Tech Stack

- **Frontend**: React (Create React App)
- **Game Engine**: Phaser 3
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

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

## Project Structure

```
mama-bear/
├── src/
│   ├── components/
│   │   ├── LandingPage.js      # Landing page component
│   │   ├── LandingPage.css     # Landing page styles
│   │   ├── Game.js              # Game wrapper component
│   │   └── Game.css             # Game wrapper styles
│   ├── game/
│   │   └── LobbyScene.js        # Phaser lobby scene
│   ├── App.js                   # Main app with routing
│   └── index.js                 # Entry point
├── public/
└── package.json
```

## Features

### Current Implementation

- ✅ Attractive landing page with gradient background
- ✅ Navigation to game lobby
- ✅ Interactive Phaser-based lobby with three villages
- ✅ Animated village buildings with hover effects
- ✅ Responsive design
- ✅ Simple routing system

### Future Enhancements

- [ ] Individual game scenes for each village
- [ ] Content upload functionality for parents
- [ ] User authentication
- [ ] Progress tracking
- [ ] More interactive game mechanics
- [ ] Character customization
- [ ] Rewards and achievements system

## Development Notes

This project uses Create React App for simplicity (perfect for hackathons). For production, consider migrating to Vite or Next.js for better performance.

The Phaser game is integrated directly into React components using refs and useEffect hooks for proper lifecycle management.

## License

MIT

## Contributing

This is a hackathon project. Feel free to fork and enhance!
