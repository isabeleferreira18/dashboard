import { mensagensErros } from "../../utils/mensagensErros";
import type { UsuariosResposta } from "./types";

async function requisicaoUsuarios(rota: string, opcoes: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        throw new Error("Token de autenticação não encontrado. Faça login novamente.");
    }

    const headers = new Headers(opcoes.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}${rota}`, {
        ...opcoes,
        headers,
    });

    if (!res.ok) {
        let mensagem = mensagensErros(res.status);

        try {
            const dados = await res.json() as { error?: { message?: string } };
            if (dados.error?.message) {
                mensagem = dados.error.message;
            }
        } catch {
        }

        throw new Error(mensagem);
    }

    return res;
}

export async function getUsuarios(name?: string, role?: string, status?: string): Promise<UsuariosResposta> {
    const params = new URLSearchParams();
    if (name) params.set("search", name);
    if (role) params.set("role", role);
    if (status) params.set("active", status);
    const query = params.size > 0 ? `?${params.toString()}` : "";

    const roleLogin = localStorage.getItem("role");

    if (roleLogin !== "DEVELOPER") {
        throw new Error("Você não tem autorização para listar usuários.");
    }

    const res = await requisicaoUsuarios(`/users${query}`);
    return (await res.json()) as UsuariosResposta;
}

export async function criarUsuarios(name: string, cpf: string, email: string, password: string, role: string) {
    await requisicaoUsuarios("/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            cpf,
            email,
            password,
            role,
        })
    });
}

export async function desativarUsuario(id: number) {
    await requisicaoUsuarios(`/users/${id}`, {
        method: "DELETE",
    });
}

export async function editarUsuario(id: number, name?: string, cpf?: string, email?: string, role?: string) {
    await requisicaoUsuarios(`/users/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            cpf,
            email,
            role,
        })

    });
}

export async function alterarSenhaUsuario(id: number, password: string) {
    await requisicaoUsuarios(`/users/${id}/password`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
    });
}
