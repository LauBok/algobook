# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlgoBook is an interactive tutorial book covering algorithms and data structures with a dual-format approach:
- **Online Version**: Next.js web application with live code execution, quizzes, and progress tracking
- **PDF Version**: Static version generated from the same source content

The curriculum integrates Python programming with algorithms and data structures, teaching concepts exactly when needed to solve real problems.

## Commands

### Development
```bash
cd algobook-web
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

### Dependencies
```bash
cd algobook-web
npm install          # Install all dependencies
```

## Project Architecture

### Repository Structure
```
AlgoBook/
├── algobook-web/           # Next.js 15 web application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   │   ├── interactive/  # CodePlayground, MultipleChoice, CodingExercise
│   │   │   └── layout/      # Header, Sidebar, Layout
│   │   └── lib/           # API integrations and utilities
│   │       ├── api/judge0.ts    # Judge0 code execution
│   │       ├── utils/progress.ts # Progress tracking
│   │       └── types/index.ts   # TypeScript definitions
│   └── content/           # All chapter content, exercises, and examples
│       └── chapters/      # Chapter markdown files organized by chapter/section
├── scripts/               # Build and utility scripts
├── CLAUDE.md             # Project instructions for Claude Code
├── INTEGRATED_CURRICULUM.md # Complete curriculum outline
└── README.md             # Main project documentation
```

### Technology Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4 with Typography plugin
- **Code Editor**: Monaco Editor with Python syntax highlighting
- **Code Execution**: Judge0 CE API (free tier: 50 requests/day)
- **Progress Tracking**: Local storage with granular reset options
- **Content**: Markdown with GitHub Flavored Markdown and syntax highlighting

### Interactive Components
- **CodePlayground**: Live Python code editor with execution
- **MultipleChoice**: Quiz component with immediate feedback
- **CodingExercise**: Auto-graded exercises with test cases
- **Progress Tracking**: Persistent across browser sessions

## Development Guidelines

### Working Directory
Always navigate to `algobook-web/` before running development commands as the Next.js application is contained within this subdirectory.

### Chapter System
- Uses Next.js App Router with dynamic routing: `/chapter/[id]`
- Content stored in `algobook-web/content/chapters/`
- Each chapter includes theory, interactive examples, and exercises

### Judge0 Integration
- **Language**: Python 3.8.1 (language_id: 71)
- **Development**: Free CE API with rate limiting
- **Configuration**: Located in `src/lib/api/judge0.ts`

### Progress System
- **Storage**: Browser localStorage with `algobook_` prefix
- **Features**: Granular reset by chapter, section, or exercise type
- **Data**: Tracks completion, attempts, scores, and time spent

### Content Creation Pattern
Each chapter follows this structure:
1. Learning Objectives
2. Motivation (why learn this now)
3. Core Concepts with examples
4. Interactive Code Playgrounds
5. Practice Problems (coding exercises)
6. Check Understanding (multiple choice)
7. Key Takeaways

## Curriculum Structure

The curriculum is organized into 7 parts covering 26 chapters:
- **Part I**: Programming Foundations & Simple Algorithms (Chapters 1-5)
- **Part II**: Efficient Algorithms & Complexity (Chapters 6-9)
- **Part III**: Data Structures as Tools (Chapters 10-14)
- **Part IV**: Trees and Hierarchical Thinking (Chapters 15-17)
- **Part V**: Graph Theory and Network Algorithms (Chapters 18-20)
- **Part VI**: Advanced Problem-Solving Patterns (Chapters 21-23)
- **Part VII**: Specialized Applications (Chapters 24-26)

The philosophy is "Learn by Building, Apply Immediately" - Python concepts are introduced exactly when needed for implementing algorithms.