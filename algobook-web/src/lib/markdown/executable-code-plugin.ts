import { visit } from 'unist-util-visit';
import type { Node } from 'unist';
import type { Element } from 'hast';

interface CodeNode extends Element {
  properties: {
    className?: string[];
  };
  children: Array<{
    type: 'text';
    value: string;
  }>;
}

// Remark plugin to mark executable code blocks
export function remarkExecutableCode() {
  return (tree: Node) => {
    visit(tree, 'code', (node: Node & { lang?: string; meta?: string; data?: Record<string, unknown> }) => {
      if (node.lang === 'python' && node.meta?.includes('executable')) {
        // Add metadata to mark this as executable
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        (node.data.hProperties as any).executable = true;
        (node.data.hProperties as any).hints = node.meta?.match(/hints="([^"]*)"/)?.[1];
        (node.data.hProperties as any).description = node.meta?.match(/description="([^"]*)"/)?.[1];
      }
    });
  };
}

// Rehype plugin to transform executable code blocks
export function rehypeExecutableCode() {
  return (tree: Node) => {
    visit(tree, 'element', (node: CodeNode, index, parent: Node & { children?: unknown[] }) => {
      if (
        node.tagName === 'code' &&
        node.properties?.className?.includes('language-python') &&
        (node.properties as any).executable
      ) {
        // Transform to executable code block
        const code = node.children[0]?.value || '';
        const hints = (node.properties as any).hints ? 
          (node.properties as any).hints.split(',').map((h: string) => h.trim()) : 
          [];
        
        const executableNode: Element = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['executable-code-wrapper'],
            'data-code': code,
            'data-hints': JSON.stringify(hints),
            'data-description': (node.properties as any).description || '',
          },
          children: []
        };

        // Replace the code block
        if (parent && parent.children && typeof index === 'number') {
          parent.children[index] = executableNode;
        }
      }
    });
  };
}