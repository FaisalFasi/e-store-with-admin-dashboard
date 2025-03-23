import { useUserStore } from "../stores/useUserStore.js";

export const getUserData = () => {
  const {
    user,
    login,
    signUp,
    loading,
    checkAuth,
    checkingAuth,
    logout,
    loginAsGuest,
  } = useUserStore();
  return {
    user,
    login,
    signUp,
    loading,
    checkAuth,
    checkingAuth,
    logout,
    loginAsGuest,
  };
};
