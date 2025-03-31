export const handleError = (res, error, context, status = 500) => {
  console.log("Error handler  ---", error.message);
  // Ensure the error object has a message property
  const errorMessage = error?.message || `Internal server error in ${context}`;
  console.log("Error message  ---", errorMessage);
  res.status(status).json({
    success: false,
    message: errorMessage,
  });
};
