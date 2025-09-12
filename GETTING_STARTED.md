# AlgoBook - Getting Started with Development

## 🚀 Quick Start

### 1. Navigate to the Web Application
```bash
cd algobook-web
```

### 2. Install Dependencies (Already Done)
Dependencies are already installed, but if you need to reinstall:
```bash
npm install
```

### 3. Set Up Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```

For development, you can use the free Judge0 API. No API key required for basic testing!

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

## 🏗️ Project Structure

### Core Architecture
```
algobook-web/
├── src/
│   ├── components/
│   │   ├── interactive/          # Interactive learning components
│   │   │   ├── CodePlayground.tsx    # Live code editor
│   │   │   ├── MultipleChoice.tsx    # Quiz component
│   │   │   └── CodingExercise.tsx    # Auto-graded exercises
│   │   └── layout/               # Navigation and layout
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Layout.tsx
│   ├── lib/
│   │   ├── api/judge0.ts         # Judge0 integration
│   │   ├── utils/progress.ts     # Progress tracking
│   │   └── types/index.ts        # TypeScript definitions
│   └── app/
│       ├── page.tsx              # Homepage
│       └── chapter/[id]/         # Dynamic chapter pages
└── content/
    └── chapters/                 # Chapter content and exercises
```

### Key Features Ready
✅ **Interactive Code Editor** - Monaco Editor with Python syntax highlighting
✅ **Judge0 Integration** - Automated code execution and testing
✅ **Progress Tracking** - Local storage with granular reset options
✅ **Responsive Layout** - Header, sidebar navigation, and main content area
✅ **Chapter System** - Dynamic routing for chapters
✅ **Exercise System** - Automated testing with multiple test cases
✅ **Quiz System** - Multiple choice with explanations and progress tracking

## 🎯 What You Can Do Right Now

### 1. View the Homepage
Visit `http://localhost:3000` to see the landing page with:
- Hero section explaining the learning approach
- Feature highlights
- Learning path overview
- Call-to-action buttons

### 2. Try Chapter 1
Navigate to `http://localhost:3000/chapter/01-getting-started` to see:
- **Interactive Code Playground** - Live Python code execution
- **Multiple Choice Quiz** - With immediate feedback and explanations  
- **Coding Exercise** - Automated testing with Judge0 API
- **Progress Tracking** - Your attempts and completion status are saved

### 3. Test Interactive Components

#### Code Playground Features:
- Write and run Python code instantly
- Syntax highlighting and error detection
- Show/hide hints system
- Reset functionality
- Real-time output display

#### Coding Exercise Features:
- Starter code templates
- Multiple test cases (visible and hidden)
- Automated grading and feedback
- Difficulty indicators
- Progress tracking
- Hints and solution viewing
- Attempt history

#### Quiz Features:
- Immediate feedback on answers
- Detailed explanations for all options
- Progress tracking and attempt counting
- Try-again functionality for incorrect answers

## 🔧 Development Workflow

### Adding New Chapters
1. Create content in `content/chapters/[chapter-id]/`
2. Add chapter data to the routing system
3. Include exercises and quizzes in the chapter structure

### Judge0 API Usage
- **Development**: Uses free Judge0 CE API (50 requests/day per IP)
- **Production**: Consider upgrading to paid tier or self-hosting
- **Language**: Currently configured for Python 3.8.1 (language_id: 71)

### Progress Tracking
- **Storage**: Local storage with `algobook_` prefix
- **Granular Reset**: By chapter, section, exercise type, or complete wipe
- **Data**: Tracks completion, attempts, scores, and time spent

## 🎨 Customization

### Styling
- **Framework**: Tailwind CSS for rapid styling
- **Theme**: Clean, academic design with blue primary color
- **Responsive**: Mobile-first design approach

### Interactive Components
- **Monaco Editor**: Full-featured code editor in browser
- **Judge0**: Secure code execution in sandboxed environment
- **Progress**: Persistent across browser sessions

## 🚦 Next Steps

### Phase 2: Enhanced Components
- [ ] Visual algorithm animations
- [ ] Advanced code editor features (autocomplete, debugging)
- [ ] Video explanations integration
- [ ] Social features (sharing solutions)

### Phase 3: Content Expansion
- [ ] Complete all 26 chapters
- [ ] Add more programming languages (C++, Java)
- [ ] Create assessment system
- [ ] Add project-based learning

### Phase 4: Advanced Features
- [ ] User accounts and cloud sync
- [ ] AI-powered hints and explanations
- [ ] Peer review system
- [ ] Certificate generation

## 📝 Content Creation Guide

### Chapter Structure
Each chapter should follow this pattern:
1. **Learning Objectives** - Clear goals
2. **Motivation** - Why learn this now?
3. **Core Concepts** - Theory with examples
4. **Interactive Examples** - Code playgrounds
5. **Practice Problems** - Coding exercises
6. **Check Understanding** - Multiple choice quizzes
7. **Key Takeaways** - Summary and next steps

### Exercise Design
- **Progressive Difficulty** - Start simple, build complexity
- **Real Problems** - Solve actual challenges, not abstract puzzles
- **Multiple Test Cases** - Include edge cases and hidden tests
- **Helpful Hints** - Guide without giving away the answer
- **Clear Explanations** - Why the solution works

## 🐛 Troubleshooting

### Common Issues

#### Monaco Editor Not Loading
- Check network connection for CDN resources
- Verify React 19 compatibility

#### Judge0 API Errors
- Check API endpoint configuration
- Verify internet connection
- Consider rate limiting (50 requests/day for free tier)

#### Progress Not Saving
- Check browser local storage settings
- Verify localStorage is enabled
- Check for storage quota limits

### Development Tips
- Use browser dev tools to monitor Judge0 API calls
- Check console for React warnings and errors
- Test with different screen sizes for responsiveness

## 🎉 You're All Set!

The AlgoBook platform is ready for development and testing. You have:
- A fully functional interactive learning platform
- Automated code execution and testing
- Progress tracking system
- Professional, responsive UI
- Solid foundation for content expansion

Start the dev server and begin exploring the integrated Python + Algorithms + Data Structures curriculum!