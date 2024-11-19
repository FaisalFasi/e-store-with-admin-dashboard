export const cacheChecking = (
  get,
  forceRefetch = false,
  cacheDuration = 5 * 60 * 1000
) => {
  const { products, cacheTimestamp } = get();
  if (
    !forceRefetch &&
    products.length > 0 &&
    Date.now() - cacheTimestamp < cacheDuration
  ) {
    console.log("Using cached products");
    return true;
  }
  return false;
};
