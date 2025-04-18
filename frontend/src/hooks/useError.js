import { useErrorStore } from "@/stores/useErrorStore";

// 2. Create convenience hook (hooks/useError.js)
export const useError = () => useErrorStore((state) => state.handleError);
