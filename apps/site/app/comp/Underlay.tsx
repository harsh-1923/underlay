"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react'

const Underlay = () => {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const topDivRef = useRef<HTMLDivElement>(null);
  const bottomDivRef = useRef<HTMLDivElement>(null);
  
  // Position as percentage of available height (0-100)
  const [handlePosition, setHandlePosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [topDimensions, setTopDimensions] = useState({ width: 0, height: 0 });
  const [bottomDimensions, setBottomDimensions] = useState({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (topDivRef.current && bottomDivRef.current) {
      const topRect = topDivRef.current.getBoundingClientRect();
      const bottomRect = bottomDivRef.current.getBoundingClientRect();
      
      setTopDimensions({
        width: Math.round(topRect.width),
        height: Math.round(topRect.height)
      });
      
      setBottomDimensions({
        width: Math.round(bottomRect.width),
        height: Math.round(bottomRect.height)
      });
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !dragHandleRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const handleHeight = dragHandleRef.current.getBoundingClientRect().height;
    
    // Calculate available height (container height minus handle height)
    const availableHeight = containerRect.height - handleHeight;
    
    // Calculate mouse position relative to container
    const mouseY = e.clientY - containerRect.top;
    
    // Calculate position as percentage of available height
    // Constrain the handle to stay within bounds
    const minY = 0;
    const maxY = availableHeight;
    const constrainedY = Math.max(minY, Math.min(maxY, mouseY - handleHeight / 2));
    
    const percentage = (constrainedY / availableHeight) * 100;
    setHandlePosition(percentage);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update dimensions when handle position changes or on mount
  useEffect(() => {
    updateDimensions();
  }, [handlePosition, updateDimensions]);

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  // Calculate heights for top and bottom divs
  // Use calc() to subtract handle height from the percentage-based heights
  const topHeight = `calc(${handlePosition}% - 20px)`;
  const bottomHeight = `calc(${100 - handlePosition}% - 20px)`;

  return (
    <div
      ref={containerRef}
      className="w-100 h-[calc(100vh-80px)] bg-black rounded-3xl overflow-hidden"
    >
      <div
        ref={topDivRef}
        className="w-100 bg-neutral-900 flex items-center justify-center text-lg font-mono overflow-clip rounded-b-3xl"
        style={{ height: topHeight }}
      >
        <div className="text-center">
          <div className="font-semibold text-white">Upper Layer</div>
          <div className="text-sm mt-2 bg-white/20 px-2 py-1 rounded">
            {topDimensions.width}px × {topDimensions.height}px
          </div>
        </div>
      </div>
      <div
        ref={dragHandleRef}
        className="w-100 h-10 bg-black/40 cursor-grab select-none flex items-center justify-center text-white font-semibold"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
      >
        ⋮⋮⋮ Drag Handle ⋮⋮⋮
      </div>
      <div
        ref={bottomDivRef}
        className="w-100 bg-neutral-900 flex items-center justify-center text-lg font-mono overflow-clip rounded-t-3xl"
        style={{ height: bottomHeight }}
      >
        <div className="text-center">
          <div className="font-semibold">Lower Layer</div>
          <div className="text-sm mt-2 bg-white/20 px-2 py-1 rounded">
            {bottomDimensions.width}px × {bottomDimensions.height}px
          </div>
        </div>
      </div>
    </div>
  );
}

export default Underlay