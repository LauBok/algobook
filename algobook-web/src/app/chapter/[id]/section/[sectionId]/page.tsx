import { notFound } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { CodePlayground, MultipleChoice } from '@/components/interactive';
import ProcessedMarkdownContent from '@/components/content/ProcessedMarkdownContent';
import SectionHeader from '@/components/layout/SectionHeader';
import SectionNavigationComponent from '@/components/layout/SectionNavigation';
import { getSectionData } from '@/lib/content/contentLoader';
import { Section } from '@/lib/types/content';

interface SectionPageProps {
  params: {
    id: string;
    sectionId: string;
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { id, sectionId } = await params;
  const sectionData = getSectionData(id, sectionId);
  
  if (!sectionData) {
    notFound();
  }

  const { section, navigation } = sectionData;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Section Header with Progress */}
        <SectionHeader 
          chapter={navigation.chapter}
          section={section as Section}
        />

        {/* Section Content with Mixed Prose and Interactive Elements */}
        <ProcessedMarkdownContent 
          content={section.content} 
          quizzes={(section as any).quizzes || []} 
          exercises={(section as any).exercises || []} 
          callouts={(section as any).callouts || []} 
          plots={(section as any).plots || []} 
          tables={(section as any).tables || []} 
          algorithmWidgets={(section as any).algorithmWidgets || []}
          widgets={(section as any).widgets || []}
        />

        {/* Interactive Elements */}
        {section.interactiveElements.map((element) => (
          <div key={element.id} className="mb-8">
            {element.type === 'code-playground' && 'initialCode' in element.data && (
              <CodePlayground
                initialCode={element.data.initialCode}
                description={element.data.description}
                hints={element.data.hints}
                editable={element.data.editable}
                showOutput={element.data.showOutput}
              />
            )}
          </div>
        ))}

        {/* End-of-section Quiz (only show if not already rendered inline) */}
        {section.quiz && (!(section as any).quizzes || (section as any).quizzes.length === 0) && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Check Your Understanding</h3>
            {section.quiz.questions.map((question) => (
              <div key={question.id} className="mb-6">
                <MultipleChoice
                  id={question.id}
                  question={question.question}
                  options={question.options}
                  explanation={question.explanation}
                />
              </div>
            ))}
          </div>
        )}


        {/* Section Navigation */}
        <SectionNavigationComponent navigation={navigation as any} />
      </div>
    </Layout>
  );
}