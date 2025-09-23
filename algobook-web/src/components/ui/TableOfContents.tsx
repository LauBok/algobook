'use client';

import React, { useState, useEffect } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  // No props needed - we extract from DOM
}

export default function TableOfContents({}: TableOfContentsProps = {}) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  // Extract headings from the main content area only
  useEffect(() => {
    const extractHeadingsFromDOM = () => {
      // Search for headings across all prose blocks, not just one container
      const allProseBlocks = document.querySelectorAll('.prose');

      let headingElements: NodeListOf<Element>;

      if (allProseBlocks.length > 0) {
        // Collect headings from all prose blocks
        const allHeadings: Element[] = [];
        allProseBlocks.forEach((block) => {
          const blockHeadings = block.querySelectorAll('h2, h3, h4');
          blockHeadings.forEach(heading => allHeadings.push(heading));
        });
        headingElements = allHeadings as any;
      } else {
        // Fallback: search in the entire page
        headingElements = document.querySelectorAll('h2, h3, h4');
      }

      const items: TocItem[] = [];

      headingElements.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent || '';

        // Skip empty headings
        if (!text.trim()) {
          return;
        }

        // Create a simple ID from the text or use existing ID
        const id = heading.id || text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Set ID on element if it doesn't have one
        if (!heading.id) {
          heading.id = id;
        }

        items.push({
          id,
          text,
          level
        });
      });

      setTocItems(items);
    };

    // Wait a bit for content to render
    const timeout = setTimeout(extractHeadingsFromDOM, 500);

    // Also re-extract when DOM changes (for dynamic content)
    const observer = new MutationObserver(extractHeadingsFromDOM);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  // Track which heading is currently in view
  useEffect(() => {
    const handleScroll = () => {
      // Search across all prose blocks for headings
      const allProseBlocks = document.querySelectorAll('.prose');
      let headings: Element[] = [];

      if (allProseBlocks.length > 0) {
        allProseBlocks.forEach(block => {
          const blockHeadings = block.querySelectorAll('h2, h3, h4');
          blockHeadings.forEach(heading => headings.push(heading));
        });
      } else {
        headings = Array.from(document.querySelectorAll('h2, h3, h4'));
      }
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;

      let currentHeading = '';

      headings.forEach((heading) => {
        const text = heading.textContent || '';

        // Skip empty headings
        if (!text.trim()) {
          return;
        }

        const rect = heading.getBoundingClientRect();
        const top = rect.top + scrollTop;

        // Consider a heading active if it's near the top of the viewport
        if (top <= scrollTop + windowHeight * 0.3) {
          currentHeading = heading.id || heading.textContent?.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '') || '';
        }
      });

      setActiveId(currentHeading);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll the active item into view within the navigator
  useEffect(() => {
    if (activeId) {
      const activeButton = document.querySelector(`button[data-heading-id="${activeId}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [activeId]);

  // Scroll to heading when clicked
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id) ||
      Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .find(h => h.textContent?.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, '') === id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <div className={`w-full z-40 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-30'
    }`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-[48rem] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Section Navigator</h3>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={isVisible ? 'Minimize' : 'Expand'}
          >
            {isVisible ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        {isVisible && (
          <div className="py-2 max-h-[44rem] overflow-y-auto">
            {tocItems.map((item, index) => (
              <button
                key={index}
                data-heading-id={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  activeId === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' : 'text-gray-600'
                }`}
                style={{
                  paddingLeft: `${0.5 + (item.level - 1) * 0.5}rem`,
                  fontSize: item.level === 1 ? '0.875rem' :
                           item.level === 2 ? '0.8125rem' : '0.75rem'
                }}
              >
                <div className="truncate" title={item.text}>
                  {item.text}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}