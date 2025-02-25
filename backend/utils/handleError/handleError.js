export const handleError = (res, error, context) => {
  console.error(`Error in ${context}:`, error);

  // Ensure the error object has a message property
  const errorMessage = error.message || `Internal server error in ${context}`;

  res.status(500).json({
    success: false,
    message: errorMessage.includes("validation")
      ? `Validation error: ${errorMessage}`
      : errorMessage,
  });
};
