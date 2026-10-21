import { mensagensErros } from "../../utils/mensagensErros";
import type { VendasResposta } from "./types";

export async function buscar<T>(rota: string): Promise<T> {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            throw new Error("Token de autenticação não encontrado. Faça login novamente.");
        }
        const res = await fetch(`${import.meta.env.VITE_API_URL}${rota}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
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
        return (await res.json()) as T;
    }

export async function getVendas(startDate?: string, endDate?: string, publicEntityId?: number, brands?: string, statuses?: string): Promise<VendasResposta> {
        const params = new URLSearchParams();

        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (publicEntityId !== undefined) params.set("publicEntityId", String(publicEntityId));
        if (brands) params.set("brand", brands);
        if (statuses) params.set("status", statuses);

        const query = params.size > 0 ? `?${params.toString()}` : "";
        return buscar<VendasResposta>(`/sales${query}`);
    }