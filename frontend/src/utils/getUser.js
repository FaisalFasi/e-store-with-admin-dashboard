import { useUserStore } from "../stores/useUserStore.js";

export const getUser = () => {
  const { user, checkAuth, checkingAuth } = useUserStore();
  return { user, checkAuth, checkingAuth };
};
