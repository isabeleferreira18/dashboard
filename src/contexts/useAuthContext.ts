import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuthContext() {
    const auth = useContext(AuthContext);
    if (!auth) {
    throw new Error("ERRO! useAuthContext deve ser usado dentro de AuthContextProvider");
  } return auth;
}
