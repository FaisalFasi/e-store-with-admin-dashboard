import { useUserStore } from "../stores/useUserStore.js";

export const getUserData = () => {
  const { user, checkAuth, checkingAuth, logout } = useUserStore();
  return { user, checkAuth, checkingAuth, logout };
};
