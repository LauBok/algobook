import { notFound } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { getChapterMetadata, CURRICULUM_STRUCTURE } from '@/lib/data/chapterMetadata';
import { loadParsedSectionContent } from '@/lib/content/contentLoader';
import ChapterSections from '@/components/chapter/ChapterSections';
import ChapterStartCTA from '@/components/chapter/ChapterStartCTA';

const getChapterData = (id: string) => {
  const metadata = getChapterMetadata(id);
  if (!metadata) return null;
  
  return {
    id: metadata.id,
    title: metadata.title,
    part: metadata.part,
    partTitle: metadata.partTitle,
    description: metadata.description,
    sections: metadata.sections.map(section => {
      // Load markdown content and extract the actual title
      try {
        const parsed = loadParsedSectionContent(id, section.id);
        const actualTitle = parsed.title || section.title; // Fallback to metadata title
        
        return {
          id: section.id,
          title: actualTitle,
          estimatedMinutes: section.estimatedMinutes,
          description: section.description
        };
      } catch (error) {
        console.error(`Error loading section ${section.id}:`, error);
        // Fallback to metadata title if markdown parsing fails
        return {
          id: section.id,
          title: section.title,
          estimatedMinutes: section.estimatedMinutes,
          description: section.description
        };
      }
    }),
    learningObjectives: metadata.learningObjectives
  };
};


const getPreviousChapter = (currentChapterId: string) => {
  for (const part of CURRICULUM_STRUCTURE) {
    const currentIndex = part.chapters.findIndex(ch => ch.id === currentChapterId);
    if (currentIndex > 0) {
      return part.chapters[currentIndex - 1];
    } else if (currentIndex === 0) {
      // Find previous part's last chapter
      const partIndex = CURRICULUM_STRUCTURE.findIndex(p => p.part === part.part);
      if (partIndex > 0) {
        const prevPart = CURRICULUM_STRUCTURE[partIndex - 1];
        return prevPart.chapters[prevPart.chapters.length - 1];
      }
    }
  }
  return null;
};

const getNextChapter = (currentChapterId: string) => {
  for (const part of CURRICULUM_STRUCTURE) {
    const currentIndex = part.chapters.findIndex(ch => ch.id === currentChapterId);
    if (currentIndex >= 0 && currentIndex < part.chapters.length - 1) {
      return part.chapters[currentIndex + 1];
    } else if (currentIndex === part.chapters.length - 1) {
      // Find next part's first chapter
      const partIndex = CURRICULUM_STRUCTURE.findIndex(p => p.part === part.part);
      if (partIndex < CURRICULUM_STRUCTURE.length - 1) {
        const nextPart = CURRICULUM_STRUCTURE[partIndex + 1];
        return nextPart.chapters[0];
      }
    }
  }
  return null;
};

interface ChapterPageProps {
  params: {
    id: string;
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id } = await params;
  const chapter = getChapterData(id);
  
  if (!chapter) {
    notFound();
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Chapter Header */}
        <div className="mb-8">
          <div className="text-sm text-blue-600 font-medium mb-2">
            Part {chapter.part}: {chapter.partTitle}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {chapter.title}
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            {chapter.description}
          </p>

          {/* Learning Objectives */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">Learning Objectives</h2>
            <p className="text-blue-800 mb-3">By the end of this chapter, you will:</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              {chapter.learningObjectives ? chapter.learningObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              )) : (
                <li>Objectives will be defined for this chapter</li>
              )}
            </ul>
          </div>
        </div>

        {/* Chapter Sections */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chapter Sections</h2>
          <ChapterSections chapterId={id} sections={chapter.sections} />
        </div>

        {/* Start Learning CTA */}
        <ChapterStartCTA chapterId={id} sections={chapter.sections} />

        {/* Chapter Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <div>
            {(() => {
              const prevChapter = getPreviousChapter(chapter.id);
              return prevChapter ? (
                <div className="text-left">
                  <div className="text-sm text-gray-500 mb-2">Previous Chapter</div>
                  <Link
                    href={`/chapter/${prevChapter.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← {prevChapter.title}
                  </Link>
                </div>
              ) : null;
            })()}
          </div>
          
          <div className="text-center">
            {(() => {
              const nextChapter = getNextChapter(chapter.id);
              return nextChapter ? (
                <>
                  <div className="text-sm text-gray-500 mb-2">Next Chapter</div>
                  <Link
                    href={`/chapter/${nextChapter.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {nextChapter.title} →
                  </Link>
                </>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </Layout>
  );
}