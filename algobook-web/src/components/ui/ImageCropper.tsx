'use client';

import React, { useState, useRef, useCallback } from 'react';

interface ImageCropperProps {
  onCropComplete: (croppedImageDataUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ onCropComplete, onCancel }: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      const { clientWidth, clientHeight } = imageRef.current;
      
      setImageSize({ width: clientWidth, height: clientHeight });
      
      // Center the crop area
      const cropSize = Math.min(clientWidth, clientHeight) * 0.6;
      setCrop({
        x: (clientWidth - cropSize) / 2,
        y: (clientHeight - cropSize) / 2,
        size: cropSize
      });
    }
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: event.clientX - crop.x,
      y: event.clientY - crop.y
    });
  }, [crop]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !cropperRef.current) return;

    const rect = cropperRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(event.clientX - dragStart.x, imageSize.width - crop.size));
    const newY = Math.max(0, Math.min(event.clientY - dragStart.y, imageSize.height - crop.size));

    setCrop(prev => ({ ...prev, x: newX, y: newY }));
  }, [isDragging, dragStart, imageSize, crop.size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSizeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value);
    const maxSize = Math.min(imageSize.width, imageSize.height);
    const actualSize = Math.min(newSize, maxSize);
    
    setCrop(prev => ({
      ...prev,
      size: actualSize,
      x: Math.max(0, Math.min(prev.x, imageSize.width - actualSize)),
      y: Math.max(0, Math.min(prev.y, imageSize.height - actualSize))
    }));
  }, [imageSize]);

  const cropImage = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imageRef.current;
    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = image;
    
    // Calculate scale factors
    const scaleX = naturalWidth / clientWidth;
    const scaleY = naturalHeight / clientHeight;
    
    // Set canvas size to desired output size
    const outputSize = 128;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate source crop coordinates in natural image size
    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceSize = crop.size * Math.min(scaleX, scaleY);

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw the cropped image
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, outputSize, outputSize
    );
    
    ctx.restore();

    // Get the cropped image as data URL
    const croppedImageDataUrl = canvas.toDataURL('image/png', 0.9);
    onCropComplete(croppedImageDataUrl);
  }, [crop, onCropComplete]);

  if (!imageSrc) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Custom Avatar</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="text-4xl mb-2">📸</div>
                <div className="text-sm font-medium text-gray-900">Choose Image</div>
                <div className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</div>
              </label>
            </div>
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Crop Your Avatar</h2>
        
        <div className="space-y-4">
          {/* Image Cropper */}
          <div 
            ref={cropperRef}
            className="relative inline-block border border-gray-300 rounded-lg overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Upload preview"
              className="max-w-full max-h-96 block"
              onLoad={handleImageLoad}
              draggable={false}
            />
            
            {/* Crop overlay */}
            {imageSize.width > 0 && (
              <>
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-none" />
                
                {/* Crop circle */}
                <div
                  className="absolute border-2 border-white rounded-full cursor-move shadow-lg"
                  style={{
                    left: crop.x,
                    top: crop.y,
                    width: crop.size,
                    height: crop.size,
                    background: 'transparent',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="w-full h-full rounded-full border-2 border-dashed border-white opacity-75" />
                </div>
              </>
            )}
          </div>

          {/* Size control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Size: {crop.size}px
            </label>
            <input
              type="range"
              min="50"
              max={Math.min(imageSize.width, imageSize.height)}
              value={crop.size}
              onChange={handleSizeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
              <div 
                className="w-16 h-16 rounded-full border-2 border-gray-300 overflow-hidden"
                style={{
                  backgroundImage: `url(${imageSrc})`,
                  backgroundSize: `${(imageSize.width / crop.size) * 64}px ${(imageSize.height / crop.size) * 64}px`,
                  backgroundPosition: `-${(crop.x / crop.size) * 64}px -${(crop.y / crop.size) * 64}px`
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={cropImage}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Use This Avatar
            </button>
            <button
              onClick={() => setImageSrc('')}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Choose Different Image
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}