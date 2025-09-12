# AlgoBook Author Guidelines

## Core Philosophy: Learn by Building, Apply Immediately

Students learn Python concepts **exactly when needed** to implement algorithms and solve real problems. They always understand **why** they're learning something because they immediately apply it.

## Chapter Structure Requirements

### Essential Template
Every chapter follows this progression:
```
**Motivation** → **Overview** → **Details** → **Applications** → **Summary/Exercise**
```

**Sections per Chapter:**
- 4-5 sections following Overview → Details → Summary pattern
- Details can expand to multiple sections based on content complexity
- Final section always includes comprehensive exercises

### Mandatory Elements
Each chapter must include:
- **Motivation**: Clear "why learn this now?" opening
- **Python Skills**: Specific new concepts introduced
- **Algorithm Focus**: Core algorithmic concepts
- **Why Now**: Prerequisite foundation and readiness explanation
- **Assessment Integration**: Multi-modal exercise types

## Concept Sequencing Rules

### Never Use Before Teaching
**Critical Rule**: Do not use materials students haven't seen unless trivially self-explanatory.
- ✅ OK: `min()` with explanation "returns minimum value of a list"
- ❌ Wrong: Using list comprehensions before Chapter 4.3
- ❌ Wrong: Using classes before Chapter 13
- ❌ Wrong: Coding exercises in Chapter 1.1 (no Python taught yet)

### Build Systematically
- Reference previous chapters explicitly: "using recursion from Ch 6"
- Verify prerequisites in your chapter's dependencies
- Test concept flow: can students follow without gaps?

## Content Design Principles

### Motivation-First Approach
**Always show WHY before WHAT before HOW:**
1. **Problem Motivation**: Show limitations of current approach
2. **Concept Introduction**: Present solution to the problem  
3. **Implementation**: Teach syntax and technique
4. **Application**: Immediate practice with real problems

### Examples That Teach
- **Short and Direct**: Examples should illuminate concepts, not obscure them
- **Progressive Complexity**: Start simple, build to realistic applications
- **Immediate Relevance**: Students should see clear connection to learning goals
- **Self-Contained**: Don't require external knowledge to understand

### Algorithm Explanations
- **Easiest Path First**: Find most intuitive explanation approach
- **Essential Details Only**: Include technical details students need to understand
- **Visual Support**: Use diagrams/tables when concepts benefit from visualization
- **Correctness Matters**: Address why algorithms work, not just how

## Assessment Design

### Exercise Types Required
**Within Sections:**
- **Contextual Multiple Choice**: Scenario-based questions requiring understanding (not rote recall)
- **Simple Coding Exercises**: Exact input/output format, unambiguous results
- **Concept Application**: Use new concept immediately in small problems

**End of Chapter:**
- **Complex Coding Exercises**: Multi-concept integration with precise I/O specifications
- **Review Questions**: Can include direct recall (unlike in-section questions)
- **Algorithm Analysis**: Apply chapter concepts to analyze or design

### Auto-Gradable Exercise Requirements
- **Exact Output Match**: Exercises graded on identical output match
- **Unambiguous Results**: Given input must produce unique, specific output
- **Progressive I/O Approach**: 
  - Early chapters: Use `input()` function (no functions taught yet)
  - Later chapters: Test functions with `print(func(input(), input()))`
- **Sample I/O Provided**: Every exercise needs example input/output

## Student-Centered Design

### Put Yourself in Student Shoes
Ask constantly:
- Does this example help students learn or confuse them?
- Have I covered what students expect to learn in this topic?
- Will students understand WHY this algorithm is correct?
- Are there learning gaps that will frustrate students?
- What prerequisite knowledge am I assuming?

### Learning Facilitation
- **Anticipate Confusion**: Address common misconceptions proactively
- **Bridge Gaps**: Connect new concepts to familiar ones
- **Provide Context**: Show where concepts fit in the bigger picture
- **Validate Understanding**: Frequent check-ins through exercises

## Technical Writing Standards

### Markdown Best Practices
- **Structure Clearly**: Use consistent heading hierarchy
- **Visual Organization**: Bullet points for lists, tables for comparisons
- **Highlight Important**: Use colored callout boxes for important information
- **Code Formatting**: Proper syntax highlighting and formatting
- **Readability First**: Aesthetic presentation affects learning motivation

### Callout Types
Use these specific callout types consistently throughout content:
- **`note`**: General important information, explanations, and clarifications
- **`hint`**: Helpful tips, suggestions, and best practices
- **`warning`**: Cautions about potential pitfalls, errors, or important constraints
- **`danger`**: Critical warnings about serious mistakes or severe consequences

**Format**: ```[type] title="Descriptive Title"```
**Example**: ```note title="Key Concept"```

### Mathematical Content
- **Just-in-Time Math**: Introduce mathematical concepts when needed for algorithms
- **Multiple Representations**: Equations, examples, and intuitive explanations
- **Optional Depth**: Use "Deep Dive" boxes for advanced mathematical treatment

## Chapter-Specific Guidance

### Foundation Chapters (1-9)
- **Concept Sequencing Critical**: Students have minimal background
- **Motivation Essential**: Show why each new concept solves current limitations
- **No Assumptions**: Define everything, assume no prior programming knowledge

### Data Structure Chapters (10-18)
- **Application-Driven**: Show data structures solving specific algorithmic problems
- **Implementation Approach**: 
  - Ch 10-12: Functional approach (no classes)
  - Ch 13+: Object-oriented approach
- **Performance Focus**: Connect to complexity analysis from Ch 7

### Advanced Chapters (19-33)
- **Integration Heavy**: Build on multiple previous concepts
- **Real Applications**: Show practical uses in systems/competition
- **Theoretical Depth**: Include formal analysis and correctness arguments

## Success Metrics

### Student Mastery Indicators
Each chapter should enable students to:
- **Explain Motivation**: Why this concept/algorithm is needed
- **Implement Correctly**: Write working code using new concepts
- **Apply Appropriately**: Recognize when to use techniques in new problems
- **Analyze Performance**: Understand efficiency characteristics
- **Connect Concepts**: Relate to previous and future learning

### Quality Checkpoints
Before submitting your chapter, verify:
- ✅ No concept sequencing violations
- ✅ Clear motivation for every major concept
- ✅ Progressive complexity in examples
- ✅ Testable exercises with exact specifications
- ✅ Adequate practice opportunities
- ✅ Connection to curriculum flow

## Implementation Support

Review your specific chapter's "Implementation Guidance for Authors" section in the curriculum document for detailed, chapter-specific direction on content focus, critical pitfalls, and success metrics.

Remember: We're building a world-class textbook that seamlessly integrates Python programming with algorithmic thinking. Every chapter should advance both programming skills and algorithmic understanding in service of solving real computational problems.