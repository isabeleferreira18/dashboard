import { useEffect, useState } from "react";

export function Users() {

    type User = {
        id: number;
        name: string;
        cpf: string;
        email: string;
        role: string;
        active: boolean
    }
    const [users, setUsers] = useState<User[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);

    async function verificarStatus(): Promise<boolean> {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/health`);
            const dados: { status: string } = await res.json();

        console.log("HTTP do health:", res.status);
        console.log("JSON do health:", dados);

            return res.ok && dados.status === "ok";
        } catch (err) {
            console.error("Erro ao verificar o status da API:", err);
            return false;
        }

    }

    useEffect(() => {
        async function listarUsers() {

            try {
                const apiDisponivel = await verificarStatus();

                if (!apiDisponivel) {
                    console.error("A API não retornou status ok. Usuários não foram buscados");
                    return;
                }
                const res = await fetch(`${import.meta.env.VITE_API_URL}/users`);
                

                if (!res.ok) {
                    throw new Error(`Erro HTTP: ${res.status}`);
                }

                const data: User[] = await res.json();
                setUsers(data);
            } catch (err) {
                console.error("Erro ao buscar usuários:", err);
            } finally {
                setCarregando(false);
            }
        }

        void listarUsers();
    }, []);
    // return (
    //     <>{JSON.stringify({ carregando, users }, null, 2)}</>
    // )
}



