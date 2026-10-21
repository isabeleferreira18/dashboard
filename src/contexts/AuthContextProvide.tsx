import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContext";
import { mensagensErros } from "../utils/mensagensErros";

type AuthContextProviderProps = {
    children: ReactNode
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        localStorage.getItem('role');
        if (!token) {
            setIsLoading(false);
            return;
        } async function auth() {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });
                if (res.status === 401) {
                    localStorage.removeItem("accessToken");
                    setUser(null);
                    return;
                } if (!res.ok) {
                    throw new Error(mensagensErros(res.status));
                }
                const dados = await res.json();
                setUser({ name: dados.name, role: dados.role });
            } catch (error: unknown) {
                const mensagem = error instanceof Error ? error.message : "Erro inesperado";
                alert(mensagem);
            }
            finally {
                setIsLoading(false);
            }
        } auth()
    }, []);

    function logout() {
        localStorage.removeItem('accessToken');
        setUser(null);
        localStorage.removeItem('role');
    }

    async function loginAuth(cpf: string, password: string) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf, password }),
        });
        if (res.status === 401) {
            throw new Error("CPF ou senha inválidos");
        }
        if (!res.ok) {
            throw new Error(mensagensErros(res.status));
        }
        const dados = await res.json();
        localStorage.setItem("accessToken", dados.accessToken);
        localStorage.setItem("role", dados.user.role);
        setUser({ name: dados.user.name, role: dados.user.role });
    }
    return (
        <AuthContext.Provider value={{ user, isLoading, loginAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}