'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PlotBlock } from '@/lib/types/content';
import 'katex/dist/katex.min.css';

// Function to load MathJax if not available (Plotly-compatible version)
const loadMathJax = () => {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).MathJax && (window as any).MathJax.Hub) {
      resolve();
      return;
    }
    
    // Configure MathJax before loading
    (window as any).MathJax = {
      AuthorInit: function() {
        console.log('MathJax AuthorInit called - ready for Plotly');
        resolve();
      },
      tex2jax: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
      },
      TeX: {
        extensions: ['AMSmath.js', 'AMSsymbols.js']
      }
    };
    
    const script = document.createElement('script');
    // Use MathJax v2 with the config Plotly expects
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;
    script.onerror = reject;
    document.head.appendChild(script);
    
    // Fallback timeout in case AuthorInit doesn't fire
    setTimeout(() => {
      if ((window as any).MathJax && (window as any).MathJax.Hub) {
        console.log('MathJax v2 ready via timeout fallback');
        resolve();
      }
    }, 3000);
  });
};

interface PlotRendererProps {
  plot: PlotBlock;
}

export default function PlotRenderer({ plot }: PlotRendererProps) {
  const plotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [plotHeight, setPlotHeight] = useState(plot.options?.height || 400);
  const [isResizing, setIsResizing] = useState(false);
  const [plotlyInstance, setPlotlyInstance] = useState<any>(null);

  // Helper function to render content with LaTeX support
  const renderPlotContent = (text: string, inline: boolean = false) => {
    const Component = inline ? 'span' : 'div';
    return (
      <Component>
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            // Inline elements should not add extra spacing
            p: ({ children }) => <>{children}</>,
            // Style code blocks consistently
            code: ({ children, className }) => {
              return className ? (
                <code className={`${className} bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-800`}>
                  {children}
                </code>
              ) : (
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-800">
                  {children}
                </code>
              );
            },
            // Ensure other elements don't add unwanted spacing
            em: ({ children }) => <em>{children}</em>,
            strong: ({ children }) => <strong className="font-bold">{children}</strong>
          }}
        >
          {text}
        </ReactMarkdown>
      </Component>
    );
  };

  useEffect(() => {
    const createPlot = async () => {
      if (!plotRef.current) return;
      
      try {
        // Skip MathJax loading - we want plain text only
        
        // Load Plotly without MathJax support
        const Plotly = await import('plotly.js-dist-min');

      // Convert our plot data to Plotly format
      const traces: any[] = plot.data.map((series) => {
        return {
          x: series.x,
          y: series.y,
          name: series.name,
          type: getPlotlyType(plot.type),
          mode: series.mode || getDefaultMode(plot.type),
          marker: series.marker || getDefaultMarker(plot.type),
        };
      });

      const layout: any = {
        title: processLatexForPlotly(plot.title || ''),
        xaxis: {
          title: processLatexForPlotly(plot.options?.xLabel || 'X')
        },
        yaxis: {
          title: processLatexForPlotly(plot.options?.yLabel || 'Y')
        },
        showlegend: plot.options?.showLegend !== false,
        width: plot.options?.width || undefined, // Let it be responsive
        height: plotHeight,
        autosize: true,
        margin: {
          l: 60,
          r: 120, // Increased right margin for legend
          t: plot.title ? 80 : 50,
          b: 60
        },
        legend: {
          x: 1,
          xanchor: 'left',
          y: 1,
          yanchor: 'top',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          bordercolor: 'rgba(0, 0, 0, 0.1)',
          borderwidth: 1,
          font: {
            size: 12
          }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
          family: 'system-ui, -apple-system, sans-serif',
          size: 12,
          color: '#374151'
        },
        // Enable LaTeX/MathJax for the entire plot
        annotations: [],
        modebar: {
          orientation: 'h',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          color: '#374151',
          activecolor: '#1f2937'
        }
      };

      const config: any = {
        displayModeBar: plot.options?.interactive !== false,
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'],
        modeBarButtonsToAdd: [],
        // Disable MathJax to show raw text
        mathjax: false,
        toImageButtonOptions: {
          format: 'png',
          filename: plot.title?.toLowerCase().replace(/\s+/g, '_') || 'plot',
          height: plotHeight,
          width: layout.width,
          scale: 1
        },
      };

        // Create the plot first
        await Plotly.newPlot(plotRef.current, traces, layout, config);

        // Since we're using plain text for legends, no additional processing needed
        setPlotlyInstance(Plotly);
      } catch (error) {
        console.error('Error loading Plotly:', error);
        if (plotRef.current) {
          plotRef.current.innerHTML = `
            <div class="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
              <div class="text-center">
                <p class="text-red-600 font-medium">Error loading plot</p>
                <p class="text-red-500 text-sm mt-1">Please check the plot configuration</p>
              </div>
            </div>
          `;
        }
      }
    };

    createPlot();

    // Cleanup function
    return () => {
      const plotElement = plotRef.current;
      if (plotElement) {
        import('plotly.js-dist-min').then((Plotly) => {
          Plotly.purge(plotElement);
        }).catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, [plot, plotHeight]);

  // Update plot when height changes
  useEffect(() => {
    if (plotlyInstance && plotRef.current) {
      plotlyInstance.relayout(plotRef.current, { height: plotHeight });
    }
  }, [plotHeight, plotlyInstance]);

  // Handle mouse events for resizing
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Resize handle clicked', e.target); // Debug log
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startHeight = plotHeight;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(200, Math.min(800, startHeight + deltaY));
      console.log('Resizing to:', newHeight); // Debug log
      setPlotHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      console.log('Resize ended'); // Debug log
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [plotHeight]);

  return (
    <div className="mb-8 w-full">
      {plot.title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          📊 {renderPlotContent(plot.title, true)}
        </h4>
      )}
      <div 
        ref={containerRef}
        className={`bg-white border border-gray-200 rounded-lg shadow-sm w-full relative ${
          isResizing ? 'select-none' : ''
        }`}
        style={{ width: '100%', maxWidth: '100%' }}
      >
        <div 
          ref={plotRef}
          className="w-full"
          style={{ height: `${plotHeight}px`, width: '100%', padding: '16px' }}
        />
        
        {/* Resize handle */}
        <div
          className={`w-full h-6 cursor-ns-resize flex items-center justify-center border-t border-gray-200 ${
            isResizing 
              ? 'bg-blue-100 border-blue-300' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => console.log('Mouse enter resize handle')}
          onMouseLeave={() => console.log('Mouse leave resize handle')}
          title="Click and drag to resize chart height"
          style={{ 
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          <div className={`text-xs font-bold ${
            isResizing ? 'text-blue-600' : 'text-gray-500'
          }`}>
            ⋯⋯⋯
          </div>
        </div>
        
        {/* Height indicator when resizing */}
        {isResizing && (
          <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-90 text-white px-3 py-1 rounded-md text-sm font-mono z-10">
            {plotHeight}px
          </div>
        )}
      </div>
    </div>
  );
}


// Helper function to process LaTeX for Plotly MathJax
function processLatexForPlotly(text: string): string {
  if (!text) return text;
  
  // Plotly expects LaTeX to be wrapped in $...$ delimiters for MathJax
  // If text already contains LaTeX, keep it as is
  if (text.includes('$')) {
    return text;
  }
  
  // For non-LaTeX text, return as-is
  return text;
}

// Helper functions to convert our plot types to Plotly types
function getPlotlyType(type: string): string {
  switch (type) {
    case 'line':
      return 'scatter';
    case 'bar':
      return 'bar';
    case 'scatter':
      return 'scatter';
    case 'histogram':
      return 'histogram';
    case 'pie':
      return 'pie';
    case 'heatmap':
      return 'heatmap';
    default:
      return 'scatter';
  }
}

function getDefaultMode(type: string): string {
  switch (type) {
    case 'line':
      return 'lines+markers';
    case 'scatter':
      return 'markers';
    default:
      return undefined as any;
  }
}

function getDefaultMarker(type: string): any {
  switch (type) {
    case 'line':
      return { size: 6 };
    case 'scatter':
      return { size: 8 };
    case 'bar':
      return { 
        color: 'rgba(55, 128, 191, 0.8)',
        line: { color: 'rgba(55, 128, 191, 1.0)', width: 1 }
      };
    default:
      return undefined;
  }
}