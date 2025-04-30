export const handleError = (res, error, context, status = 500) => {
  console.error(`🚨 [${context}] Error:`, {
    message: error?.message || error,
    stack: error?.stack || "",
    status,
    timestamp: new Date().toISOString(),
  });

  const response = {
    success: false,
    message: error?.message || error || `Error in ${context}`,
  };

  if (process.env.NODE_ENV === "development") {
    response.debug = {
      stack: error.stack || "",
      message: error.message || "",
      context,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    };
  }
  return res?.status(status).json(response);
};
