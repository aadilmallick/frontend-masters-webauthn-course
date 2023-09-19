import { useContext } from "react";
import { AuthContext } from "./authContext";

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext has to be used within <AuthContext.Provider>"
    );
  }
  return context;
};
