'use client';

import React, { useState } from 'react';
import { TableBlock } from '@/lib/types/content';

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

  // Helper function to render inline formatting (code and bold)
  const renderInlineFormatting = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let keyCounter = 0;
    
    // Combined regex to match both inline code and bold text
    const formattingRegex = /(`([^`]+)`)|(\*\*([^*]+)\*\*)/g;
    let match;

    while ((match = formattingRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      if (match[1]) {
        // Inline code match (backticks)
        parts.push(
          <code key={`inline-${keyCounter++}`} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-blue-800">
            {match[2]}
          </code>
        );
      } else if (match[3]) {
        // Bold text match (double asterisks)
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-bold">
            {match[4]}
          </strong>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    // If no formatting was found, return original text
    // If formatting was found, return the parts array (React will render it)
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="mb-8">
      {table.title && (
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          📊 {table.title}
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
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    table.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{renderInlineFormatting(header)}</span>
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
                    {renderInlineFormatting(cell)}
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
          {table.caption}
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