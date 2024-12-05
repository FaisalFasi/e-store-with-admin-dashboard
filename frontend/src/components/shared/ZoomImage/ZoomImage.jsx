import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ZoomImage = ({ src, alt }) => {
  return (
    <TransformWrapper
      initialScale={1}
      initialPositionX={0}
      initialPositionY={0}
      wheel={{
        step: 0.1, // Zoom step on mouse wheel scroll
      }}
    >
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="relative">
          {/* Zoom Control Buttons */}
          <div className="absolute top-4 right-4 space-x-2">
            <button
              onClick={() => zoomIn()}
              className="px-4 py-2 bg-emerald-400 text-white rounded-md"
            >
              Zoom In
            </button>
            <button
              onClick={() => zoomOut()}
              className="px-4 py-2 bg-emerald-400 text-white rounded-md"
            >
              Zoom Out
            </button>
            <button
              onClick={() => resetTransform()}
              className="px-4 py-2 bg-emerald-400 text-white rounded-md"
            >
              Reset
            </button>
          </div>

          {/* Image Section */}
          <TransformComponent>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
  );
};

export default ZoomImage;
