import React, { useEffect } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ZoomImage = ({ src, alt, className }) => {
  return (
    <TransformWrapper
      initialScale={1}
      initialPositionX={0}
      initialPositionY={0}
      wheel={{
        step: 0.1, // Zoom step on mouse wheel scroll
      }}
      className="relative"
    >
      {({ zoomIn, zoomOut, resetTransform }) => {
        useEffect(() => {
          resetTransform();
        }, [src]); // Runs when `src` updates

        return (
          <div className="relative">
            {/* Fixed size wrapper */}
            {/* Image Section */}
            <TransformComponent>
              <img src={src} alt={alt} className={className} />
            </TransformComponent>
            {/* Zoom Control Buttons */}
            <div className="absolute flex items-center top-4 right-4 space-x-2 opacity-80">
              <button
                className="px-2 py-1 bg-emerald-400 text-white rounded-md"
                onClick={() => zoomIn()}
              >
                <ZoomIn />
              </button>
              <button
                onClick={() => zoomOut()}
                className="px-2 py-1 bg-emerald-400 text-white rounded-md"
              >
                <ZoomOut />
              </button>
              <button
                onClick={() => resetTransform()}
                className="px-2 py-1 bg-emerald-400 text-white rounded-md"
              >
                <RotateCcw />
              </button>
            </div>
          </div>
        );
      }}
    </TransformWrapper>
  );
};

export default ZoomImage;
