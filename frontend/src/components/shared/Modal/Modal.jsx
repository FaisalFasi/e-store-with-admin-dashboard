import React from "react";
import ReactDOM from "react-dom";
import Button from "../Button/Button";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleCloseButtonClick = () => {
    onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="fixed px-4 md:px-0 inset-0 w-full z-50 bg-black bg-opacity-70 flex items-center justify-center"
      onClick={handleBackgroundClick}
    >
      <div
        className="relative top-4 md:top-8 bg-gray-800 rounded-xl shadow-lg w-full max-w-xl overflow-y-auto max-h-screen h-fit-content"
        onClick={handleContentClick}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-500 p-4">
          <h2 className=" text-xl md:text-4xl font-bold text-emerald-400">
            {title || "Modal Title"}
          </h2>
          <Button
            onClick={handleCloseButtonClick}
            className="text-gray-400"
            isBG={true}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {/* Modal Content */}
        <div className="py-6 md:px-4 text-gray-700">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
