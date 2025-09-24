'use client';

import React, { useState } from 'react';

interface ASCIIEncoderProps {
  id?: string;
}

export default function ASCIIEncoder({ id = 'ascii-encoder' }: ASCIIEncoderProps) {
  const [inputText, setInputText] = useState('Hello');
  const [mode, setMode] = useState<'text-to-ascii' | 'ascii-to-text'>('text-to-ascii');

  // ASCII character mappings for common characters
  const commonASCII = [
    { char: ' ', code: 32, binary: '00100000', hex: '20', category: 'Space' },
    { char: '!', code: 33, binary: '00100001', hex: '21', category: 'Punctuation' },
    { char: '"', code: 34, binary: '00100010', hex: '22', category: 'Punctuation' },
    { char: '0', code: 48, binary: '00110000', hex: '30', category: 'Digit' },
    { char: '1', code: 49, binary: '00110001', hex: '31', category: 'Digit' },
    { char: '9', code: 57, binary: '00111001', hex: '39', category: 'Digit' },
    { char: 'A', code: 65, binary: '01000001', hex: '41', category: 'Uppercase' },
    { char: 'B', code: 66, binary: '01000010', hex: '42', category: 'Uppercase' },
    { char: 'Z', code: 90, binary: '01011010', hex: '5A', category: 'Uppercase' },
    { char: 'a', code: 97, binary: '01100001', hex: '61', category: 'Lowercase' },
    { char: 'b', code: 98, binary: '01100010', hex: '62', category: 'Lowercase' },
    { char: 'z', code: 122, binary: '01111010', hex: '7A', category: 'Lowercase' },
  ];

  // Convert text to ASCII codes
  const textToASCII = (text: string) => {
    return text.split('').map(char => ({
      char,
      code: char.charCodeAt(0),
      binary: char.charCodeAt(0).toString(2).padStart(8, '0'),
      hex: char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'),
      isVisible: char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126
    }));
  };

  // Convert ASCII codes to text
  const asciiToText = (ascii: string) => {
    try {
      // Handle space-separated decimal codes
      const codes = ascii.split(/[\s,]+/).filter(code => code.trim());
      return codes.map(code => {
        const num = parseInt(code.trim());
        if (num >= 0 && num <= 127) {
          return String.fromCharCode(num);
        }
        return '?';
      }).join('');
    } catch {
      return '';
    }
  };

  const encodedData = mode === 'text-to-ascii' ? textToASCII(inputText) : [];
  const decodedText = mode === 'ascii-to-text' ? asciiToText(inputText) : '';

  const CharacterCard = ({
    char,
    code,
    binary,
    hex,
    isVisible,
    index
  }: {
    char: string,
    code: number,
    binary: string,
    hex: string,
    isVisible: boolean,
    index: number
  }) => (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="text-center mb-3">
        <div className={`text-2xl font-bold h-8 flex items-center justify-center ${
          isVisible ? 'text-gray-800' : 'text-gray-400'
        }`}>
          {isVisible ? char : '⌈' + code + '⌉'}
        </div>
        <div className="text-xs text-gray-500">
          Position {index + 1}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Decimal:</span>
          <span className="font-mono font-bold">{code}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Binary:</span>
          <span className="font-mono text-green-600">{binary}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Hex:</span>
          <span className="font-mono text-purple-600">0x{hex}</span>
        </div>
      </div>
    </div>
  );

  const ASCIITable = () => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-sm text-gray-700 mb-3">Common ASCII Characters</h4>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 text-xs">
        {commonASCII.map((item) => (
          <div
            key={item.code}
            className="bg-white p-2 rounded border text-center cursor-pointer hover:bg-blue-50"
            onClick={() => {
              if (mode === 'text-to-ascii') {
                setInputText(prev => prev + item.char);
              } else {
                setInputText(prev => prev + (prev ? ' ' : '') + item.code);
              }
            }}
            title={`Click to add ${item.char}`}
          >
            <div className="font-bold text-lg">{item.char === ' ' ? '⎵' : item.char}</div>
            <div className="text-gray-500">{item.code}</div>
            <div className="text-xs text-gray-400">{item.category}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">ASCII Character Encoder</h3>
        <p className="text-sm text-gray-600">
          Explore how text characters are encoded as binary patterns
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setMode('text-to-ascii')}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              mode === 'text-to-ascii'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Text → ASCII
          </button>
          <button
            onClick={() => setMode('ascii-to-text')}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              mode === 'ascii-to-text'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ASCII → Text
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {mode === 'text-to-ascii' ? 'Enter Text:' : 'Enter ASCII Codes (space or comma separated):'}
        </label>
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-mono resize-none"
            rows={3}
            placeholder={
              mode === 'text-to-ascii'
                ? 'Type your text here...'
                : 'Enter ASCII codes like: 72 101 108 108 111'
            }
            maxLength={mode === 'text-to-ascii' ? 50 : 200}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {inputText.length}/{mode === 'text-to-ascii' ? 50 : 200}
          </div>
        </div>
      </div>

      {/* Results */}
      {mode === 'text-to-ascii' && encodedData.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">Character Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {encodedData.slice(0, 12).map((item, index) => (
              <CharacterCard key={index} {...item} index={index} />
            ))}
          </div>

          {encodedData.length > 12 && (
            <div className="text-center text-sm text-gray-500">
              ... and {encodedData.length - 12} more characters
            </div>
          )}

          {/* Summary Information */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-semibold text-sm text-blue-800 mb-2">Encoding Summary</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-600 font-semibold">Characters</div>
                <div className="text-blue-800">{encodedData.length}</div>
              </div>
              <div>
                <div className="text-blue-600 font-semibold">Bytes</div>
                <div className="text-blue-800">{encodedData.length} (1 per char)</div>
              </div>
              <div>
                <div className="text-blue-600 font-semibold">Bits</div>
                <div className="text-blue-800">{encodedData.length * 8}</div>
              </div>
              <div>
                <div className="text-blue-600 font-semibold">Printable</div>
                <div className="text-blue-800">{encodedData.filter(item => item.isVisible).length}</div>
              </div>
            </div>
          </div>

          {/* Raw Output */}
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm font-medium text-gray-700 mb-1">Decimal ASCII:</div>
              <div className="font-mono text-sm break-all">
                {encodedData.map(item => item.code).join(' ')}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm font-medium text-gray-700 mb-1">Binary:</div>
              <div className="font-mono text-sm break-all">
                {encodedData.map(item => item.binary).join(' ')}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm font-medium text-gray-700 mb-1">Hexadecimal:</div>
              <div className="font-mono text-sm break-all">
                {encodedData.map(item => item.hex).join(' ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'ascii-to-text' && inputText && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">Decoded Text</h4>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-lg font-mono">{decodedText || '(No valid ASCII codes)'}</div>
          </div>
        </div>
      )}

      {/* ASCII Reference Table */}
      <ASCIITable />

      {/* Educational Notes */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h5 className="font-semibold text-sm text-yellow-800 mb-2">📚 ASCII Facts</h5>
          <p className="text-sm text-yellow-700">
            ASCII uses 7 bits (values 0-127) for 128 characters including letters, digits,
            punctuation, and control characters. It forms the foundation for text encoding.
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h5 className="font-semibold text-sm text-green-800 mb-2">🌍 Beyond ASCII</h5>
          <p className="text-sm text-green-700">
            Modern systems use UTF-8, which includes ASCII as a subset but can represent
            over a million characters from all world languages and symbols.
          </p>
        </div>
      </div>
    </div>
  );
}