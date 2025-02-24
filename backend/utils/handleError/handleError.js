// Utility function for error handling
export const handleError = (res, error, context) => {
  console.error(`Error in ${context}:`, error);
  res.status(500).json({
    success: false,
    message: error.message.includes("validation")
      ? `Validation error: ${error.message}`
      : `Internal server error in ${context}`,
  });
};
