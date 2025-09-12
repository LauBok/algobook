'use client';

import React from 'react';
import { ListVisualizationProps } from '@/lib/types/algorithm-widget';

export default function ListVisualization({
  data,
  highlight = [],
  compare,
  swap,
  sorted = [],
  sortedBoundary,
  className = ''
}: ListVisualizationProps) {
  const getElementStyle = (index: number) => {
    const baseClasses = "min-w-[60px] h-12 flex items-center justify-center text-lg font-semibold border-2 rounded-lg transition-all duration-300";
    
    // For insertion sort, use sortedBoundary to determine sorted vs unsorted regions
    const isInSortedRegion = sortedBoundary !== undefined ? index < sortedBoundary : sorted.includes(index);
    
    // Determine the state of this element
    if (swap && (swap[0] === index || swap[1] === index)) {
      return `${baseClasses} bg-red-200 border-red-400 text-red-800 transform scale-110`;
    } else if (compare && (compare[0] === index || compare[1] === index)) {
      return `${baseClasses} bg-yellow-200 border-yellow-400 text-yellow-800 transform scale-105`;
    } else if (highlight.includes(index)) {
      return `${baseClasses} bg-blue-200 border-blue-400 text-blue-800 transform scale-105`;
    } else if (isInSortedRegion) {
      return `${baseClasses} bg-green-100 border-green-300 text-green-800`;
    } else {
      return `${baseClasses} bg-gray-100 border-gray-300 text-gray-800`;
    }
  };

  const getElementLabel = (index: number) => {
    const isInSortedRegion = sortedBoundary !== undefined ? index < sortedBoundary : sorted.includes(index);
    
    if (swap && (swap[0] === index || swap[1] === index)) {
      return "Swapping";
    } else if (compare && (compare[0] === index || compare[1] === index)) {
      return "Comparing";
    } else if (highlight.includes(index)) {
      return "Current";
    } else if (isInSortedRegion) {
      return "Sorted";
    } else {
      return "Unsorted";
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Array Visualization */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {data.map((value, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1">
              <div className={getElementStyle(index)}>
                {value}
              </div>
              <div className="text-xs text-gray-500 min-h-[16px]">
                {getElementLabel(index)}
              </div>
              <div className="text-xs text-gray-400 min-h-[16px]">
                [{index}]
              </div>
            </div>
            
            {/* Simple gap between sorted and unsorted regions */}
            {sortedBoundary !== undefined && index === sortedBoundary - 1 && sortedBoundary < data.length && (
              <div className="w-4"></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-gray-600">Default</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
          <span className="text-gray-600">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
          <span className="text-gray-600">Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
          <span className="text-gray-600">Swapping</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
          <span className="text-gray-600">Sorted</span>
        </div>
      </div>

      {/* Current Comparison Info */}
      {compare && (
        <div className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <span className="font-medium">Comparing:</span> {data[compare[0]]} and {data[compare[1]]}
          {data[compare[0]] > data[compare[1]] && sortedBoundary === undefined && (
            <span className="text-yellow-700 ml-2">→ Will swap</span>
          )}
        </div>
      )}

      {/* Current Swap Info */}
      {swap && (
        <div className="text-sm bg-red-50 border border-red-200 rounded-lg p-2">
          <span className="font-medium">Swapping:</span> positions {swap[0]} and {swap[1]} 
          <span className="text-red-700 ml-2">({data[swap[0]]} ↔ {data[swap[1]]})</span>
        </div>
      )}
    </div>
  );
}