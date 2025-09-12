import { readFileSync } from 'fs';
import { join } from 'path';
import { Section, SectionNavigation } from '../types';
import { parseMarkdownContent, ParsedMarkdownContent } from './markdownParser';
import { getChapterMetadata, ChapterMetadata } from '../data/chapterMetadata';

const CONTENT_ROOT = join(process.cwd(), 'content', 'chapters');

export function loadSectionContent(chapterId: string, sectionId: string): string {
  try {
    const filePath = join(CONTENT_ROOT, chapterId, 'sections', `${sectionId}.md`);
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error loading section content for ${chapterId}/${sectionId}:`, error);
    return `# Section ${sectionId}\n\nContent not found.`;
  }
}

export function loadParsedSectionContent(chapterId: string, sectionId: string): ParsedMarkdownContent {
  try {
    const filePath = join(CONTENT_ROOT, chapterId, 'sections', `${sectionId}.md`);
    const rawContent = readFileSync(filePath, 'utf-8');
    return parseMarkdownContent(rawContent);
  } catch (error) {
    console.error(`Error loading section content for ${chapterId}/${sectionId}:`, error);
    return {
      content: `# Section ${sectionId}\n\nContent not found.`,
      quizzes: [],
      exercises: [],
      callouts: [],
      plots: [],
      tables: [],
      algorithmWidgets: []
    };
  }
}

interface FallbackData {
  interactiveElements?: unknown[];
  quiz?: unknown;
  exercises?: unknown[];
}

/**
 * Create section from markdown-parsed content with optional fallback data
 */
function createSectionFromMarkdown(
  chapterId: string, 
  sectionId: string, 
  sectionTitle: string, 
  order: number, 
  estimatedMinutes: number,
  fallbackData?: FallbackData
): Section {
  const parsed = loadParsedSectionContent(chapterId, sectionId);
  
  // Use title from markdown if available, otherwise fallback to provided title
  const finalTitle = parsed.title || sectionTitle;
  
  return {
    id: sectionId,
    title: finalTitle,
    order,
    estimatedMinutes,
    content: parsed.content,
    interactiveElements: fallbackData?.interactiveElements || [],
    exercises: parsed.exercises.length > 0 ? parsed.exercises : (fallbackData?.exercises || []),
    quiz: parsed.quizzes.length > 0 ? parsed.quizzes[0] : fallbackData?.quiz || null,
    quizzes: parsed.quizzes.length > 0 ? parsed.quizzes : [],
    callouts: parsed.callouts || [],
    plots: parsed.plots || [],
    tables: parsed.tables || [],
    algorithmWidgets: parsed.algorithmWidgets || []
  };
}

function createSectionsFromMetadata(chapterMetadata: ChapterMetadata): Record<string, Section> {
  const sections: Record<string, Section> = {};
  
  chapterMetadata.sections.forEach((sectionMeta) => {
    sections[sectionMeta.id] = createSectionFromMarkdown(
      chapterMetadata.id,
      sectionMeta.id,
      sectionMeta.title,
      sectionMeta.order,
      sectionMeta.estimatedMinutes
    );
  });
  
  return sections;
}

function createNavigationFromMetadata(
  chapterMetadata: ChapterMetadata,
  sections: Record<string, Section>,
  sectionId: string
): SectionNavigation | null {
  const section = sections[sectionId];
  if (!section) return null;
  
  const chapterSections = Object.values(sections);
  const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
  
  return {
    current: section,
    previous: currentIndex > 0 ? {
      chapterId: chapterMetadata.id,
      sectionId: chapterSections[currentIndex - 1].id,
      title: chapterSections[currentIndex - 1].title
    } : undefined,
    next: currentIndex < chapterSections.length - 1 ? {
      chapterId: chapterMetadata.id,
      sectionId: chapterSections[currentIndex + 1].id,
      title: chapterSections[currentIndex + 1].title
    } : undefined,
    chapter: {
      id: chapterMetadata.id,
      title: chapterMetadata.title,
      sections: chapterSections.map(s => ({
        id: s.id,
        title: s.title,
        completed: false
      }))
    }
  };
}

export function getSectionData(chapterId: string, sectionId: string): { section: Section; navigation: SectionNavigation } | null {
  const chapterMetadata = getChapterMetadata(chapterId);
  if (chapterMetadata) {
    const sections = createSectionsFromMetadata(chapterMetadata);
    const section = sections[sectionId];
    if (!section) return null;
    
    const navigation = createNavigationFromMetadata(chapterMetadata, sections, sectionId);
    if (!navigation) return null;
    
    return { section, navigation };
  }
  
  // Fallback to legacy hardcoded data for chapters not yet in metadata
  if (chapterId === '01-getting-started') {
    const sections = {
      '1.1': createSectionFromMarkdown(chapterId, '1.1', 'What is an Algorithm? Pure Problem-Solving Concepts', 1, 15),
      '1.2': createSectionFromMarkdown(chapterId, '1.2', 'Python Basics: Your First Code', 2, 30),
      '1.3': createSectionFromMarkdown(chapterId, '1.3', 'Building Complete Programs', 3, 50),
      '1.4': createSectionFromMarkdown(chapterId, '1.4', 'Practice and Chapter Review', 4, 60)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Getting Started with Algorithms',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '02-logic-control-flow') {
    const sections = {
      '2.1': createSectionFromMarkdown(chapterId, '2.1', 'Boolean Logic: True, False, and Comparisons', 1, 40),
      '2.2': createSectionFromMarkdown(chapterId, '2.2', 'Making Decisions with If Statements', 2, 45),
      '2.3': createSectionFromMarkdown(chapterId, '2.3', 'Multiple Choices and Complex Decisions', 3, 50),
      '2.4': createSectionFromMarkdown(chapterId, '2.4', 'Practice and Review: Decision-Based Problem Solving', 4, 60)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Conditionals and Logic',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '03-loops-iteration') {
    const sections = {
      '3.1': createSectionFromMarkdown(chapterId, '3.1', 'Why Loops? The Power of Repetition', 1, 40),
      '3.2': createSectionFromMarkdown(chapterId, '3.2', 'For Loops: Controlled Repetition', 2, 45),
      '3.3': createSectionFromMarkdown(chapterId, '3.3', 'While Loops and Common Patterns', 3, 40),
      '3.4': createSectionFromMarkdown(chapterId, '3.4', 'Practice and Review: Building with Loops', 4, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Loops and Iteration',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '04-lists-algorithms') {
    const sections = {
      '4.1': createSectionFromMarkdown(chapterId, '4.1', 'Python Lists: Your First Data Structure', 1, 45),
      '4.2': createSectionFromMarkdown(chapterId, '4.2', 'List Processing with Loops', 2, 50),
      '4.3': createSectionFromMarkdown(chapterId, '4.3', 'List Manipulation and Transformation', 3, 55),
      '4.4': createSectionFromMarkdown(chapterId, '4.4', 'Introduction to Sorting: Bubble Sort', 4, 60),
      '4.5': createSectionFromMarkdown(chapterId, '4.5', 'Practice and Review: List Algorithm Mastery', 5, 30)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Lists and Basic Algorithms',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '05-functions') {
    const sections = {
      '5.1': createSectionFromMarkdown(chapterId, '5.1', 'Why Functions? Code Organization and Reuse', 1, 40),
      '5.2': createSectionFromMarkdown(chapterId, '5.2', 'Creating Your First Functions', 2, 45),
      '5.3': createSectionFromMarkdown(chapterId, '5.3', 'Parameters and Return Values', 3, 40),
      '5.4': createSectionFromMarkdown(chapterId, '5.4', 'Functions as Values and Lambda', 4, 35),
      '5.5': createSectionFromMarkdown(chapterId, '5.5', 'Practice and Review: Building with Functions', 5, 30)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Functions and Code Organization',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '06-recursion-divide-conquer') {
    const sections = {
      '6.1': createSectionFromMarkdown(chapterId, '6.1', 'The Recursive Mindset: Problems Within Problems', 1, 40),
      '6.2': createSectionFromMarkdown(chapterId, '6.2', 'Your First Recursive Functions', 2, 45),
      '6.3': createSectionFromMarkdown(chapterId, '6.3', 'Mathematical Recursion: Numbers and Sequences', 3, 40),
      '6.4': createSectionFromMarkdown(chapterId, '6.4', 'Divide and Conquer: Breaking Problems in Half', 4, 50),
      '6.5': createSectionFromMarkdown(chapterId, '6.5', 'Practice: Recursive Problem Solving', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Recursion and Divide & Conquer',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '07-algorithm-efficiency') {
    const sections = {
      '7.1': createSectionFromMarkdown(chapterId, '7.1', 'Performance Problems: When Algorithms Matter', 1, 50),
      '7.2': createSectionFromMarkdown(chapterId, '7.2', 'Measuring Performance: Timing and Counting Operations', 2, 45),
      '7.3': createSectionFromMarkdown(chapterId, '7.3', 'Mathematical Analysis: Big O Notation', 3, 60),
      '7.4': createSectionFromMarkdown(chapterId, '7.4', 'Analyzing Recursive Algorithms', 4, 50),
      '7.5': createSectionFromMarkdown(chapterId, '7.5', 'Practice: Algorithm Efficiency Analysis', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Algorithm Efficiency and Big O',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '08-binary-search') {
    const sections = {
      '8.1': createSectionFromMarkdown(chapterId, '8.1', 'Binary Search Revisited: From Basics to Mastery', 1, 45),
      '8.2': createSectionFromMarkdown(chapterId, '8.2', 'Binary Search Variations: Beyond Simple Search', 2, 50),
      '8.3': createSectionFromMarkdown(chapterId, '8.3', 'Binary Search on Answers: Optimization Applications', 3, 55),
      '8.4': createSectionFromMarkdown(chapterId, '8.4', 'Advanced Applications: 2D Search and Beyond', 4, 50),
      '8.5': createSectionFromMarkdown(chapterId, '8.5', 'Practice: Binary Search Problem Solving', 5, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Binary Search Mastery',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '09-sorting') {
    const sections = {
      '9.1': createSectionFromMarkdown(chapterId, '9.1', 'Why Sorting Matters: Foundation of Computer Science', 1, 45),
      '9.2': createSectionFromMarkdown(chapterId, '9.2', 'Merge Sort: Recursive Divide-and-Conquer Sorting', 2, 55),
      '9.3': createSectionFromMarkdown(chapterId, '9.3', 'Quick Sort: Efficient Recursive Partitioning', 3, 55),
      '9.4': createSectionFromMarkdown(chapterId, '9.4', 'Sorting Algorithm Analysis and Comparison', 4, 50),
      '9.5': createSectionFromMarkdown(chapterId, '9.5', 'Practice: Advanced Sorting Applications', 5, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Sorting Algorithms',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '10-dictionaries-hash') {
    const sections = {
      '10.1': createSectionFromMarkdown(chapterId, '10.1', 'The Dictionary Advantage: Instant Lookups', 1, 40),
      '10.2': createSectionFromMarkdown(chapterId, '10.2', 'Hash Tables: The Magic Behind Dictionaries', 2, 45),
      '10.3': createSectionFromMarkdown(chapterId, '10.3', 'Dictionary-Based Algorithm Patterns', 3, 40),
      '10.4': createSectionFromMarkdown(chapterId, '10.4', 'Sets: Hash Tables for Membership Testing', 4, 35),
      '10.5': createSectionFromMarkdown(chapterId, '10.5', 'Practice: Hash-Based Problem Solving', 5, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Dictionaries and Hash-Based Solutions',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '11-stacks') {
    const sections = {
      '11.1': createSectionFromMarkdown(chapterId, '11.1', 'The Stack Abstraction: LIFO in Action', 1, 40),
      '11.2': createSectionFromMarkdown(chapterId, '11.2', 'Stack Implementation: Using Python Lists', 2, 45),
      '11.3': createSectionFromMarkdown(chapterId, '11.3', 'Expression Evaluation: Parsing with Stacks', 3, 50),
      '11.4': createSectionFromMarkdown(chapterId, '11.4', 'Backtracking Applications: Systematic Search', 4, 45),
      '11.5': createSectionFromMarkdown(chapterId, '11.5', 'Practice: Stack-Based Algorithm Design', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Stacks: Last In, First Out',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '12-queues') {
    const sections = {
      '12.1': createSectionFromMarkdown(chapterId, '12.1', 'The Queue Abstraction: FIFO Processing', 1, 40),
      '12.2': createSectionFromMarkdown(chapterId, '12.2', 'Queue Implementation Strategies', 2, 45),
      '12.3': createSectionFromMarkdown(chapterId, '12.3', 'Breadth-First Processing: Level-by-Level Exploration', 3, 50),
      '12.4': createSectionFromMarkdown(chapterId, '12.4', 'Practice: Queue-Based Algorithm Design', 4, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Queues: First In, First Out',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '13-oop-data-structures') {
    const sections = {
      '13.1': createSectionFromMarkdown(chapterId, '13.1', 'Classes and Objects: Organizing Code and Data', 1, 45),
      '13.2': createSectionFromMarkdown(chapterId, '13.2', 'Building Custom Data Structures', 2, 50),
      '13.3': createSectionFromMarkdown(chapterId, '13.3', 'Encapsulation and Advanced OOP Concepts', 3, 45),
      '13.4': createSectionFromMarkdown(chapterId, '13.4', 'Practice: Data Structure Design and Implementation', 4, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Object-Oriented Programming for Data Structures',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '14-linked-lists') {
    const sections = {
      '14.1': createSectionFromMarkdown(chapterId, '14.1', 'From Arrays to Linked Structures: Motivation and Concepts', 1, 45),
      '14.2': createSectionFromMarkdown(chapterId, '14.2', 'Singly Linked Lists: Implementation and Operations', 2, 50),
      '14.3': createSectionFromMarkdown(chapterId, '14.3', 'Advanced Linked List Concepts and Variants', 3, 45),
      '14.4': createSectionFromMarkdown(chapterId, '14.4', 'Practice: Linked List Problem Solving', 4, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Linked Lists: Dynamic Memory Management',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '15-trees') {
    const sections = {
      '15.1': createSectionFromMarkdown(chapterId, '15.1', 'Tree Fundamentals: Hierarchical Organization', 1, 45),
      '15.2': createSectionFromMarkdown(chapterId, '15.2', 'Tree Implementation: Recursive Data Structures', 2, 50),
      '15.3': createSectionFromMarkdown(chapterId, '15.3', 'Tree Traversal: Systematic Exploration', 3, 50),
      '15.4': createSectionFromMarkdown(chapterId, '15.4', 'Tree Applications: Real-World Hierarchical Problems', 4, 45),
      '15.5': createSectionFromMarkdown(chapterId, '15.5', 'Practice: Tree Algorithm Design', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Trees: Hierarchical Data',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '16-binary-search-trees') {
    const sections = {
      '16.1': createSectionFromMarkdown(chapterId, '16.1', 'Binary Search Tree Property and Motivation', 1, 45),
      '16.2': createSectionFromMarkdown(chapterId, '16.2', 'BST Operations: Search, Insert, and Traversal', 2, 50),
      '16.3': createSectionFromMarkdown(chapterId, '16.3', 'BST Deletion and Advanced Operations', 3, 50),
      '16.4': createSectionFromMarkdown(chapterId, '16.4', 'BST Performance Analysis and Balance Issues', 4, 45),
      '16.5': createSectionFromMarkdown(chapterId, '16.5', 'Practice: BST Applications and Problem Solving', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Binary Search Trees: Efficient Searching',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '17-heaps-priority-queues') {
    const sections = {
      '17.1': createSectionFromMarkdown(chapterId, '17.1', 'Priority Queues: When Order Isn\'t Enough', 1, 40),
      '17.2': createSectionFromMarkdown(chapterId, '17.2', 'Heap Data Structure: Efficient Priority Implementation', 2, 50),
      '17.3': createSectionFromMarkdown(chapterId, '17.3', 'Heap Operations: Maintaining the Heap Property', 3, 45),
      '17.4': createSectionFromMarkdown(chapterId, '17.4', 'Applications and Python\'s heapq Module', 4, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Heaps and Priority Queues',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '18-trie-strings') {
    const sections = {
      '18.1': createSectionFromMarkdown(chapterId, '18.1', 'The Prefix Problem: Beyond Hash Tables', 1, 40),
      '18.2': createSectionFromMarkdown(chapterId, '18.2', 'Trie Implementation: Nested Tree Structure', 2, 50),
      '18.3': createSectionFromMarkdown(chapterId, '18.3', 'Trie Operations: Search, Prefix, and Deletion', 3, 45),
      '18.4': createSectionFromMarkdown(chapterId, '18.4', 'Applications: Autocomplete and Word Games', 4, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Trie: Prefix Tree for String Operations',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '19-graphs') {
    const sections = {
      '19.1': createSectionFromMarkdown(chapterId, '19.1', 'Graph Theory Foundations: Vertices and Edges', 1, 45),
      '19.2': createSectionFromMarkdown(chapterId, '19.2', 'Graph Representation: Data Structure Design', 2, 50),
      '19.3': createSectionFromMarkdown(chapterId, '19.3', 'Basic Graph Operations: Building Blocks', 3, 40),
      '19.4': createSectionFromMarkdown(chapterId, '19.4', 'Graph Applications: Modeling Real Systems', 4, 45),
      '19.5': createSectionFromMarkdown(chapterId, '19.5', 'Practice: Graph Construction and Analysis', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Graphs: Modeling Relationships',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '20-graph-traversal') {
    const sections = {
      '20.1': createSectionFromMarkdown(chapterId, '20.1', 'Graph Traversal Fundamentals: Systematic Exploration', 1, 45),
      '20.2': createSectionFromMarkdown(chapterId, '20.2', 'Depth-First Search: Going Deep', 2, 50),
      '20.3': createSectionFromMarkdown(chapterId, '20.3', 'Breadth-First Search: Going Wide', 3, 50),
      '20.4': createSectionFromMarkdown(chapterId, '20.4', 'Graph Search Applications and Connected Components', 4, 45),
      '20.5': createSectionFromMarkdown(chapterId, '20.5', 'Practice: Graph Traversal Problem Solving', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Graph Traversal and Search',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '21-shortest-paths') {
    const sections = {
      '21.1': createSectionFromMarkdown(chapterId, '21.1', 'Shortest Path Problems: From Navigation to Networks', 1, 45),
      '21.2': createSectionFromMarkdown(chapterId, '21.2', 'Dijkstra\'s Algorithm: Greedy Shortest Paths', 2, 60),
      '21.3': createSectionFromMarkdown(chapterId, '21.3', 'Advanced Shortest Path Algorithms', 3, 50),
      '21.4': createSectionFromMarkdown(chapterId, '21.4', 'Network Analysis and Applications', 4, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Shortest Paths and Network Analysis',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '22-union-find') {
    const sections = {
      '22.1': createSectionFromMarkdown(chapterId, '22.1', 'The Dynamic Connectivity Problem', 1, 40),
      '22.2': createSectionFromMarkdown(chapterId, '22.2', 'Union-Find Data Structure: Disjoint Sets', 2, 50),
      '22.3': createSectionFromMarkdown(chapterId, '22.3', 'Optimization: Union by Rank and Path Compression', 3, 45),
      '22.4': createSectionFromMarkdown(chapterId, '22.4', 'Applications: Kruskal\'s MST and Connectivity Problems', 4, 50)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Union-Find: Efficient Connectivity Queries',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '23-topological-sorting') {
    const sections = {
      '23.1': createSectionFromMarkdown(chapterId, '23.1', 'Dependency Problems and DAGs', 1, 40),
      '23.2': createSectionFromMarkdown(chapterId, '23.2', 'Kahn\'s Algorithm: BFS-Based Topological Sort', 2, 50),
      '23.3': createSectionFromMarkdown(chapterId, '23.3', 'DFS-Based Topological Sort', 3, 45),
      '23.4': createSectionFromMarkdown(chapterId, '23.4', 'Applications: Task Scheduling and Build Systems', 4, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Topological Sorting: Ordering Dependencies',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '24-dynamic-programming') {
    const sections = {
      '24.1': createSectionFromMarkdown(chapterId, '24.1', 'The Dynamic Programming Paradigm: Optimal Substructure', 1, 50),
      '24.2': createSectionFromMarkdown(chapterId, '24.2', 'Memoization: Top-Down Dynamic Programming', 2, 50),
      '24.3': createSectionFromMarkdown(chapterId, '24.3', 'Tabulation: Bottom-Up Dynamic Programming', 3, 50),
      '24.4': createSectionFromMarkdown(chapterId, '24.4', 'Classic DP Problems: Recognizing Patterns', 4, 60),
      '24.5': createSectionFromMarkdown(chapterId, '24.5', 'Advanced DP Techniques: Multi-dimensional and Optimization', 5, 55),
      '24.6': createSectionFromMarkdown(chapterId, '24.6', 'Practice: DP Problem Solving and Analysis', 6, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Dynamic Programming: Optimal Solutions',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '25-greedy-algorithms') {
    const sections = {
      '25.1': createSectionFromMarkdown(chapterId, '25.1', 'The Greedy Strategy: Making Locally Optimal Choices', 1, 45),
      '25.2': createSectionFromMarkdown(chapterId, '25.2', 'Classic Greedy Algorithms: Proven Patterns', 2, 55),
      '25.3': createSectionFromMarkdown(chapterId, '25.3', 'Greedy Correctness: Proving Optimality', 3, 50),
      '25.4': createSectionFromMarkdown(chapterId, '25.4', 'Practice: Greedy Problem Analysis and Design', 4, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Greedy Algorithms: Local Optimal Choices',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '26-backtracking') {
    const sections = {
      '26.1': createSectionFromMarkdown(chapterId, '26.1', 'Backtracking Strategy: Systematic Solution Space Exploration', 1, 50),
      '26.2': createSectionFromMarkdown(chapterId, '26.2', 'Constraint Satisfaction and Pruning', 2, 45),
      '26.3': createSectionFromMarkdown(chapterId, '26.3', 'Classic Backtracking Problems', 3, 55),
      '26.4': createSectionFromMarkdown(chapterId, '26.4', 'Advanced Backtracking and Optimization', 4, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Backtracking: Systematic Search',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '27-string-algorithms') {
    const sections = {
      '27.1': createSectionFromMarkdown(chapterId, '27.1', 'Advanced Pattern Matching: Beyond Naive Search', 1, 50),
      '27.2': createSectionFromMarkdown(chapterId, '27.2', 'String Hashing and Rolling Hash Techniques', 2, 45),
      '27.3': createSectionFromMarkdown(chapterId, '27.3', 'Suffix-Based Data Structures', 3, 50),
      '27.4': createSectionFromMarkdown(chapterId, '27.4', 'Text Analysis and Bioinformatics Applications', 4, 45),
      '27.5': createSectionFromMarkdown(chapterId, '27.5', 'Practice: Advanced String Algorithm Implementation', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'String Algorithms and Text Processing',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '28-computational-geometry') {
    const sections = {
      '28.1': createSectionFromMarkdown(chapterId, '28.1', 'Geometric Primitives and Coordinate Systems', 1, 45),
      '28.2': createSectionFromMarkdown(chapterId, '28.2', 'Line and Polygon Algorithms', 2, 50),
      '28.3': createSectionFromMarkdown(chapterId, '28.3', 'Convex Hull: Finding Outer Boundaries', 3, 50),
      '28.4': createSectionFromMarkdown(chapterId, '28.4', 'Spatial Data Structures and Applications', 4, 45)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Computational Geometry',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '29-number-theory') {
    const sections = {
      '29.1': createSectionFromMarkdown(chapterId, '29.1', 'Prime Numbers and Factorization Algorithms', 1, 50),
      '29.2': createSectionFromMarkdown(chapterId, '29.2', 'Modular Arithmetic and Mathematical Foundations', 2, 45),
      '29.3': createSectionFromMarkdown(chapterId, '29.3', 'Cryptographic Algorithms and Security', 3, 55),
      '29.4': createSectionFromMarkdown(chapterId, '29.4', 'Applications and Advanced Topics', 4, 45),
      '29.5': createSectionFromMarkdown(chapterId, '29.5', 'Practice: Mathematical Security Implementation', 5, 40)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Number Theory and Cryptography',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '30-two-pointers-sliding-window') {
    const sections = {
      '30.1': createSectionFromMarkdown(chapterId, '30.1', 'Two Pointers Pattern: Meeting in the Middle', 1, 40),
      '30.2': createSectionFromMarkdown(chapterId, '30.2', 'Sliding Window: Fixed and Variable Size', 2, 45),
      '30.3': createSectionFromMarkdown(chapterId, '30.3', 'Contest Applications: Common Problem Patterns', 3, 50)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Two Pointers and Sliding Window Techniques',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '31-range-queries') {
    const sections = {
      '31.1': createSectionFromMarkdown(chapterId, '31.1', 'Range Query Problems: Beyond Linear Scan', 1, 45),
      '31.2': createSectionFromMarkdown(chapterId, '31.2', 'Segment Trees: Divide and Conquer Queries', 2, 60),
      '31.3': createSectionFromMarkdown(chapterId, '31.3', 'Fenwick Trees (Binary Indexed Trees)', 3, 50)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Range Query Data Structures',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  if (chapterId === '32-contest-math') {
    const sections = {
      '32.1': createSectionFromMarkdown(chapterId, '32.1', 'Modular Arithmetic: Working with Large Numbers', 1, 45),
      '32.2': createSectionFromMarkdown(chapterId, '32.2', 'Prime Numbers and Factorization', 2, 50),
      '32.3': createSectionFromMarkdown(chapterId, '32.3', 'Combinatorics: Counting and Arrangements', 3, 55)
    };

    const section = sections[sectionId as keyof typeof sections];
    if (!section) return null;

    const chapterSections = Object.values(sections);
    const currentIndex = chapterSections.findIndex(s => s.id === sectionId);
    
    return {
      section,
      navigation: {
        current: section,
        previous: currentIndex > 0 ? {
          chapterId,
          sectionId: chapterSections[currentIndex - 1].id,
          title: chapterSections[currentIndex - 1].title
        } : undefined,
        next: currentIndex < chapterSections.length - 1 ? {
          chapterId,
          sectionId: chapterSections[currentIndex + 1].id,
          title: chapterSections[currentIndex + 1].title
        } : undefined,
        chapter: {
          id: chapterId,
          title: 'Contest Math and Number Theory',
          sections: chapterSections.map(s => ({
            id: s.id,
            title: s.title,
            completed: false
          }))
        }
      }
    };
  }

  // Continue with legacy chapters that haven't been migrated to metadata yet...
  // (All the other hardcoded chapters would remain here until migrated)
  
  return null;
}