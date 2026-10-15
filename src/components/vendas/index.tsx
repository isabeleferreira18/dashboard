import { useEffect, useState, type FormEvent } from "react";
import { Funnel } from "lucide-react";
import styles from "./styles.module.css";
import { TabelaVendas } from "../tabelas";

type Venda = {
    id: number;
    amount: number;
    brand: string;
    publicEntity: {
        id: number;
        name: string
    };
    status: string;
    createdAt: string;
}

type VendasResposta = {
    groups: {
        date: string;
        sales: Venda[];
    }[];
};

type EntePublico = {
    id: number;
    name: string;
};

type FiltrosVendasResposta = {
    publicEntities: EntePublico[];
};


export function Vendas() {
    const [vendas, setVendas] = useState<VendasResposta["groups"]>([]);
    const [entesPublicos, setEntesPublicos] = useState<EntePublico[]>([]);
    const [buscaEnte, setBuscaEnte] = useState("");

    async function getVendas(startDate?: string, endDate?: string, publicEntityId?: number): Promise<VendasResposta> {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (publicEntityId !== undefined) {
            params.set("publicEntityId", String(publicEntityId));
        }

        const query = params.size > 0 ? `?${params.toString()}` : "";
        const token = localStorage.getItem("accessToken");

        if (!token) {
            throw new Error("Token de autenticação não encontrado. Faça login novamente.");
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/sales${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`Falha ao buscar dados do dashboard (HTTP ${res.status})`);
        }

        const resultado = (await res.json()) as VendasResposta;
        return resultado;
    }

    useEffect(() => {
        getVendas()
            .then((resultado) => {
                setVendas(resultado.groups);
            })
            .catch((error: unknown) => {
                console.error("Erro ao carregar as Vendas:", error);
            });
    }, []);

    useEffect(() => {
        async function getFiltros() {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/sales/filters`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!res.ok) {
                throw new Error(`Falha ao buscar filtros (HTTP ${res.status})`);
            }

            const dados = (await res.json()) as FiltrosVendasResposta;
            setEntesPublicos(dados.publicEntities);
        }

        getFiltros().catch((error: unknown) => {
            console.error("Erro ao carregar os filtros:", error);
        });
    }, []);


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const startDate = formData.get("startDate");
        const endDate = formData.get("endDate");
        const nomeEnte = buscaEnte.trim();
        const enteSelecionado = entesPublicos.find(
            (ente) => ente.name === nomeEnte
        );

        if (nomeEnte && !enteSelecionado) {
            alert("Selecione um ente público válido.");
            return;
        }

        if (typeof startDate !== "string" || typeof endDate !== "string") {
            return;
        }

        if (startDate && endDate && startDate > endDate) {
            alert("A data inicial deve ser anterior ou igual à data final.");
            return;
        }

        try {
            const resultadoVendas = await getVendas(startDate, endDate, enteSelecionado?.id);
            setVendas(resultadoVendas.groups);
        } catch (error: unknown) {
            console.error("Erro ao buscar dados do dashboard:", error);
        }
    }
    return (
        <div className={styles.vendasPage}>
            <h1 className={styles.title}>Vendas</h1>
            <div className="vendasFiltro">
                <form className={styles.vendasFiltros} onSubmit={handleSubmit} onReset={() => setBuscaEnte("")}>
                    <label className={styles.periodo}>
                        <span>Período</span>
                        <div className={styles.datasPeriodo}>
                            <input name="startDate" type="date" aria-label="Data inicial" />
                            <input name="endDate" type="date" aria-label="Data final" />
                        </div>
                    </label>

                    <label className={styles.entePublico}>
                        <span>Ente Público</span>
                        <input type="text"
                            value={buscaEnte}
                            onChange={(event) => setBuscaEnte(event.target.value)}
                            list="entes-publicos" />
                        <datalist id="entes-publicos">
                            {entesPublicos.map((ente) => (
                                <option key={ente.id} value={ente.name} />
                            ))}
                        </datalist>
                    </label>

                    <label className={styles.bandeira} >
                        <span>Bandeira</span>
                        <select name="brand">
                            <option value="">Todos</option>
                            <option value="VISA">VISA</option>
                            <option value="MASTERCARD">MASTERCARD</option>
                            <option value="ELO">ELO</option>
                            <option value="AMEX">AMEX</option>
                        </select>
                    </label>

                    <label className={styles.status}>
                        <span>Status</span>
                        <select name="status">
                            <option value="">Todos</option>
                            <option value="APPROVED">Aprovada</option>
                            <option value="CANCELLED">Cancelada</option>
                            <option value="PENDING">Pendente</option>
                            <option value="REFUNDED">Reembolsada</option>
                        </select>
                    </label>
                    <div className={styles.botoes}>
                        <button type="submit"
                            className={styles.buttonFiltrar}>
                            <Funnel size={14} fill="#fff" />
                            Filtrar
                        </button>
                        <button type="reset"
                            className={styles.buttonLimpar}>
                            Limpar
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.gruposVendas}>
                {vendas.map((grupo) => (
                    <section className={styles.grupoVendas} key={grupo.date}>
                        <h2 className={styles.dataGrupo}>
                            {new Date(`${grupo.date}T00:00:00`).toLocaleDateString("pt-BR")}
                        </h2>
                        <TabelaVendas vendas={grupo.sales} />
                    </section>
                ))}
                {vendas.length === 0 && <p>Nenhuma venda encontrada.</p>}
            </div>
        </div>

    )
}
