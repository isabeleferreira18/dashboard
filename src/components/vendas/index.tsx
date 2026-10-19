import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Funnel } from "lucide-react";
import styles from "./styles.module.css";
import { Tabela } from "../tabelas";
import { getStatusClass, getStatusLabel } from "../../utils/statusVendas";

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

const colunasVendas = [
    {titulo: "Ente Público", renderizar: (venda: Venda) => venda.publicEntity.name },
    {titulo: "Código", renderizar: (venda: Venda) => `#${venda.id}` },
    {titulo: "Bandeira", renderizar: (venda: Venda) => venda.brand },
    {
        titulo: "Status",
        renderizar: (venda: Venda) => (
            <span className={getStatusClass(venda.status)}>
                {getStatusLabel(venda.status)}
            </span>
        ),
    },
    {titulo: "Valor", renderizar: (venda: Venda) => new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL",}).format(venda.amount)},
    {titulo: "Data", renderizar: (venda: Venda) => new Date(venda.createdAt).toLocaleString("pt-BR")},
];

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
    brands: Venda["brand"][];
    statuses: Venda["status"][];
}

export function Vendas() {
    const [vendas, setVendas] = useState<VendasResposta["groups"]>([]);
    const [entesPublicos, setEntesPublicos] = useState<EntePublico[]>([]);
    const [buscaEnte, setBuscaEnte] = useState("");
    const [datasAbertas, setDatasAbertas] = useState<string[]>([]);

    async function getVendas(startDate?: string, endDate?: string, publicEntityId?: number, brands?: string, statuses?: string): Promise<VendasResposta> {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (publicEntityId !== undefined) params.set("publicEntityId", String(publicEntityId));
        if (brands) params.set("brand", brands);
        if (statuses) params.set("status", statuses);

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
        const brand = formData.get("brand");
        const status = formData.get("status");

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
        if (
            typeof startDate !== "string" ||
            typeof endDate !== "string" ||
            typeof brand !== "string" ||
            typeof status !== "string"
        ) {
            return;
        }

        try {
            const resultadoVendas = await getVendas(startDate, endDate, enteSelecionado?.id, brand, status);
            setVendas(resultadoVendas.groups);
        } catch (error: unknown) {
            console.error("Erro ao buscar dados do dashboard:", error);
        }
    }

    async function handleLimparFiltros() {
        setBuscaEnte("");

        try {
            const resultado = await getVendas();
            setVendas(resultado.groups);
        } catch (error: unknown) {
            console.error("Erro ao carregar as vendas:", error);
        }
    }
    return (
        <div>
            <h1 className="pageTitle">Vendas</h1>
            <div className="vendasFiltro">
                <form className={styles.vendasFiltros} onSubmit={handleSubmit} onReset={handleLimparFiltros}>
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
                            className="buttonFiltrar">
                            <Funnel size={14} fill="#fff" />
                            Filtrar
                        </button>
                        <button type="reset"
                            className="buttonLimpar">
                            Limpar
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.gruposVendas}>
                {vendas.map((grupo) => {
                    const aberta = datasAbertas.includes(grupo.date);
                    const valorTotal = grupo.sales.reduce(
                        (soma, venda) => soma + venda.amount, 0
                    );
                    const qtdVendas = grupo.sales.length;

                    return (
                        <section className={styles.grupoVendas} key={grupo.date}>
                            <button
                                type="button"
                                className={styles.headerTabela}
                                aria-expanded={aberta}
                                aria-label={`${aberta ? "Recolher" : "Expandir"} vendas de ${new Date(`${grupo.date}T00:00:00`).toLocaleDateString("pt-BR")}`}
                                onClick={() => {
                                    setDatasAbertas((datasAtuais) =>
                                        datasAtuais.includes(grupo.date)
                                            ? datasAtuais.filter((data) => data !== grupo.date)
                                            : [...datasAtuais, grupo.date]
                                    );
                                }}
                            >
                                <span className={styles.dataGrupo}>
                                    <ChevronDown
                                        size={18}
                                        className={aberta ? styles.setaAberta : styles.setaFechada}
                                    />
                                    {new Date(`${grupo.date}T00:00:00`).toLocaleDateString("pt-BR")}
                                </span>
                                <span className={styles.resumoGrupo}>
                                    <span>Total do dia: R$ {valorTotal}</span>
                                    <span>{qtdVendas} vendas</span>
                                </span>
                            </button>
                            {aberta && (
                                <Tabela
                                    dados={grupo.sales}
                                    colunas={colunasVendas}
                                    obterChave={(venda) => venda.id}
                                />
                            )}
                        </section>
                    );
                })}
                {vendas.length === 0 && <p> Nenhuma venda encontrada. </p>}
            </div>
        </div>

    )
}
