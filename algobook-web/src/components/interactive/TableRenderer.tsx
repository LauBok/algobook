'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { TableBlock } from '@/lib/types/content';
import 'katex/dist/katex.min.css';

interface TableRendererProps {
  table: TableBlock;
}

export default function TableRenderer({ table }: TableRendererProps) {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter rows based on search term
  const filteredRows = table.searchable && searchTerm
    ? table.rows.filter(row =>
        row.some(cell => 
          cell.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : table.rows;

  // Sort rows if needed
  const sortedRows = table.sortable && sortColumn !== null
    ? [...filteredRows].sort((a, b) => {
        const aVal = a[sortColumn] || '';
        const bVal = b[sortColumn] || '';
        
        // Try to parse as numbers first
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Fall back to string comparison
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      })
    : filteredRows;

  const handleSort = (columnIndex: number) => {
    if (!table.sortable) return;
    
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  // Helper function to render content with LaTeX, formatting (code and bold)
  const renderTableContent = (text: string, inline: boolean = false) => {
    const Component = inline ? 'span' : 'div';
    return (
      <Component style={{ textTransform: 'none' }}>
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            // Inline elements should not add extra spacing
            p: ({ children }) => <>{children}</>,
            // Style code blocks to match table design
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

  return (
    <div className="mb-8">
      {table.title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          📊 {renderTableContent(table.title, true)}
        </h4>
      )}
      
      {table.searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
      
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {table.headers.map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(index)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider ${
                    table.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ textTransform: 'uppercase' }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{renderTableContent(header)}</span>
                    {table.sortable && (
                      <span className="text-gray-400">
                        {sortColumn === index ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderTableContent(cell)}
                  </td>
                ))}
              </tr>
            ))}
            {sortedRows.length === 0 && table.searchable && searchTerm && (
              <tr>
                <td colSpan={table.headers.length} className="px-6 py-4 text-center text-sm text-gray-500">
                  No results found for &ldquo;{searchTerm}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {table.caption && (
        <p className="mt-2 text-sm text-gray-600 italic">
          {renderTableContent(table.caption)}
        </p>
      )}
      
      {table.searchable && searchTerm && (
        <p className="mt-2 text-xs text-gray-500">
          Showing {sortedRows.length} of {table.rows.length} rows
        </p>
      )}
    </div>
  );
}