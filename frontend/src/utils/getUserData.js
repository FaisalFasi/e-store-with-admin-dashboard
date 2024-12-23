import { useUserStore } from "../stores/useUserStore.js";

export const getUserData = () => {
  const {
    login,
    user,
    loading,
    checkAuth,
    checkingAuth,
    logout,
    loginAsGuest,
  } = useUserStore();
  return {
    login,
    user,
    loading,
    checkAuth,
    checkingAuth,
    logout,
    loginAsGuest,
  };
};
