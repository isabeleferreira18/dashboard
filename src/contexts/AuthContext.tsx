import { createContext } from "react";

export type User = {
    role: string;
}

type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
    logout: ()=> void;
    loginAuth: (cpf:string, password: string) => Promise<void>;
}

export const AuthContext  = createContext <AuthContextValue| null>(null)

