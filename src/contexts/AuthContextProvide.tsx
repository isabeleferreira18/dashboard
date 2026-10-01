import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type User } from "./AuthContext";

type AuthContextProviderProps = {
    children: ReactNode
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        } async function auth() {
            const config: RequestInit = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            }; try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, config);
                if (res.status === 401) {
                    localStorage.removeItem("accessToken");
                    setUser(null);
                    return;
                }

                if (!res.ok) {
                    throw new Error(`Falha ao validar a sessão (HTTP ${res.status})`);
                }

                const dados = await res.json();
                setUser({ role: dados.role });
            } catch (error: unknown) {
                alert("Falha na validação da sessão:" + error);
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
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {

                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cpf,
                    password,
                })
            });
            if (res.status === 401) {
                alert("CPF ou senha inválidos");
                return;
            }

            if (!res.ok) {
                alert(`Não foi possível fazer login (HTTP ${res.status})`);
                return;
            }

            const dados = await res.json();
            localStorage.setItem("accessToken", dados.accessToken);
            setUser({ role: dados.user.role });
        } catch (error: unknown) {
            alert("Falha de conexão no login:" + error);
        }

    } return (
        <AuthContext.Provider value={{ user, isLoading, loginAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}