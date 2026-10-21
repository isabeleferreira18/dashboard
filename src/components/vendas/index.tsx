import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, Funnel } from "lucide-react";
import styles from "./styles.module.css";
import { Tabela } from "../tabelas";
import { getStatusClass, getStatusLabel } from "../../utils/statusVendas";
import type { Venda, VendasResposta, EntePublico, FiltrosVendasResposta } from "./types";
import { buscar, getVendas } from "./api";

const colunasVendas = [
    { titulo: "Ente Público", renderizar: (venda: Venda) => venda.publicEntity.name },
    { titulo: "Código", renderizar: (venda: Venda) => `#${venda.id}` },
    { titulo: "Bandeira", renderizar: (venda: Venda) => venda.brand },
    {
        titulo: "Status",
        renderizar: (venda: Venda) => (
            <span className={getStatusClass(venda.status)}>
                {getStatusLabel(venda.status)}
            </span>
        ),
    },
    { titulo: "Valor", renderizar: (venda: Venda) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", }).format(venda.amount) },
    { titulo: "Data", renderizar: (venda: Venda) => new Date(venda.createdAt).toLocaleString("pt-BR") },
];

type EstadoConsulta = "carregando" | "sucesso" | "erro";

type FiltrosConsultaVendas = {
    startDate?: string;
    endDate?: string;
    publicEntityId?: number;
    brand?: string;
    status?: string;
};

const filtrosVazios: FiltrosConsultaVendas = {};

export function Vendas() {
    const [vendas, setVendas] = useState<VendasResposta["groups"]>([]);
    const [entesPublicos, setEntesPublicos] = useState<EntePublico[]>([]);
    const [buscaEnte, setBuscaEnte] = useState("");
    const [datasAbertas, setDatasAbertas] = useState<string[]>([]);
    const [estadoVendas, setEstadoVendas] = useState<EstadoConsulta>("carregando");
    const [erroVendas, setErroVendas] = useState<string | null>(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosConsultaVendas>(filtrosVazios);
    const [estadoFiltros, setEstadoFiltros] = useState<EstadoConsulta>("carregando");
    const [erroFiltros, setErroFiltros] = useState<string | null>(null);

    async function carregarVendas(filtros: FiltrosConsultaVendas = filtrosAplicados) {
        setEstadoVendas("carregando");
        setErroVendas(null);
        setFiltrosAplicados(filtros);

        try {
            const resultado = await getVendas(
                filtros.startDate,
                filtros.endDate,
                filtros.publicEntityId,
                filtros.brand,
                filtros.status
            );
            setVendas(resultado.groups);
            setEstadoVendas("sucesso");
        } catch (error: unknown) {
            setErroVendas(error instanceof Error ? error.message : "Não foi possível carregar as vendas.");
            setEstadoVendas("erro");
        }
    }

    async function carregarFiltros() {
        setEstadoFiltros("carregando");
        setErroFiltros(null);

        try {
            const dados = await buscar<FiltrosVendasResposta>("/sales/filters");
            setEntesPublicos(dados.publicEntities);
            setEstadoFiltros("sucesso");
        } catch (error: unknown) {
            setErroFiltros(error instanceof Error ? error.message : "Não foi possível carregar os filtros.");
            setEstadoFiltros("erro");
        }
    }

    useEffect(() => {
        void carregarVendas(filtrosVazios);
    }, []);

    useEffect(() => {
        void carregarFiltros();
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
        } if (typeof startDate !== "string" || typeof endDate !== "string") {
            return;
        } if (startDate && endDate && startDate > endDate) {
            alert("A data inicial deve ser anterior ou igual à data final.");
            return;
        } if (
            typeof startDate !== "string" ||
            typeof endDate !== "string" ||
            typeof brand !== "string" ||
            typeof status !== "string"
        ) {
            return;
        }

        await carregarVendas({
            startDate,
            endDate,
            publicEntityId: enteSelecionado?.id,
            brand,
            status,
        });
    }

    async function handleLimparFiltros() {
        setBuscaEnte("");
        await carregarVendas(filtrosVazios);
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
                            list="entes-publicos"
                            placeholder={estadoFiltros === "carregando" ? "Carregando opções..." : "Digite um ente público"}
                            disabled={estadoFiltros === "carregando"}
                            aria-busy={estadoFiltros === "carregando"} />
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
                            className="buttonPrimary">
                            <Funnel size={14} fill="#fff" />
                            Filtrar
                        </button>
                        <button type="reset"
                            className="buttonLimpar">
                            Limpar
                        </button>
                    </div>
                </form>
                {estadoFiltros === "erro" && (
                    <div role="alert">
                        <p>{erroFiltros}</p>
                        <button type="button" onClick={() => void carregarFiltros()}>
                            Tentar carregar opções novamente
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.gruposVendas}>
                {estadoVendas === "carregando" && (
                    <p role="status">Carregando vendas...</p>
                )}
                {estadoVendas === "erro" && (
                    <div role="alert">
                        <p>{erroVendas}</p>
                        <button type="button" onClick={() => void carregarVendas()}>
                            Tentar novamente
                        </button>
                    </div>
                )}
                {estadoVendas === "sucesso" && vendas.length === 0 && (
                    <p>Nenhuma venda encontrada.</p>
                )}
                {estadoVendas === "sucesso" && vendas.map((grupo) => {
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
                                    <span>Total do dia: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", }).format(valorTotal)}</span>
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
            </div>
        </div>

    )
}
