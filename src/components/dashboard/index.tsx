import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Banknote, CalendarDays, ChartNoAxesColumn, DollarSign } from "lucide-react";
import { Card } from "../card";
import { SalesByDay } from "../graficos/salesByDay";
import { SalesByStatus } from "../graficos/salesByStatus";
import { SalesByBrand } from "../graficos/salesByBrand";
import { Tabela } from "../tabelas";
import styles from "./styles.module.css";
import { getStatusClass, getStatusLabel } from "../../utils/statusVendas";
import { useAuthContext } from "../../contexts/useAuthContext";
import { mensagensErros } from "../../utils/mensagensErros";

type DashboardData = {
    cards: {
        averageTicket: number;
        grossRevenue: number;
        netRevenue: number;
        salesCount: number;
    };
    salesByBrand: {
        amount: number;
        brand: string;
        percentage: number;
        quantity: number;
    }[];
    salesByDay: {
        amount: number;
        date: string;
        quantity: number;
    }[];
    salesByStatus: {
        quantity: number;
        status: string;
    }[];
};

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

const colunasVendas = [
    { titulo: "Código", renderizar: (venda: Venda) => `#${venda.id}` },
    { titulo: "Ente Público", renderizar: (venda: Venda) => venda.publicEntity.name },
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

const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valor);

export function Dashboard() {
    const auth = useAuthContext();
    const [dados, setDados] = useState<DashboardData | null>(null);
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    async function buscar<T>(rota: string, startDate?: string, endDate?: string): Promise<T> {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        const query = params.size > 0 ? `?${params.toString()}` : "";
        const token = localStorage.getItem("accessToken");

        const res = await fetch(`${import.meta.env.VITE_API_URL}${rota}${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
        });
        if (res.status === 401) {
            auth.logout();
            throw new Error("Sessão expirada. Faça login novamente.");
        }
        if (!res.ok) {
            throw new Error(mensagensErros(res.status));
        }
        return (await res.json()) as T;
    }
    
    async function carregar(startDate?: string, endDate?: string) {
        setCarregando(true);
        setErro(null);
        try {
            const [dashboard, vendasResposta] = await Promise.all([
                buscar<DashboardData>("/dashboard", startDate, endDate),
                buscar<VendasResposta>("/sales", startDate, endDate),
            ]);
            setDados(dashboard);
            setVendas(vendasResposta.groups.flatMap((grupo) => grupo.sales));
        } catch (error: unknown) {
            setErro(error instanceof Error ? error.message : "Erro inesperado");
        } finally {
            setCarregando(false);
        }
    }
    useEffect(() => {
        carregar();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const startDate = formData.get("startDate");
        const endDate = formData.get("endDate");

        if (typeof startDate !== "string" || typeof endDate !== "string" || !startDate || !endDate) {
            return;
        } if (startDate > endDate) {
            alert("A data inicial deve ser anterior ou igual à data final.");
            return;
        }
        carregar(startDate, endDate);
    }

    return (
        <div>
            <div className={styles.dashboardHeader}>
                <h1 className="pageTitle">Dashboard</h1>
                <div className={styles.dashboardFiltro}>
                    <CalendarDays className={styles.calendarIcon} aria-hidden="true" />
                    <form onSubmit={handleSubmit}>
                        <input name="startDate" aria-label="Data inicial" type="date" required />
                        <span className={styles.dateSeparator} aria-hidden="true">–</span>
                        <input name="endDate" aria-label="Data final" type="date" required />
                        <button type="submit">Aplicar</button>
                    </form>
                </div>
                {erro && (
                    <div role="alert">
                        <p>{erro}</p>
                        <button type="button" onClick={() => carregar()}>Tentar novamente</button>
                    </div>
                )}
                {carregando && <p>Carregando...</p>}
            </div>

            <div className={styles.miniCards}>
                <Card className={styles.miniCard}>
                    <span className={`${styles.miniCardIcon} ${styles.grossIcon}`}><DollarSign /></span>
                    <div className={styles.miniCardContent}>
                        <span>Receita Bruta</span>
                        <strong>{dados ? formatarMoeda(dados.cards.grossRevenue) : "—"}</strong>
                    </div>
                </Card>
                <Card className={styles.miniCard}>
                    <span className={`${styles.miniCardIcon} ${styles.netIcon}`}><DollarSign /></span>
                    <div className={styles.miniCardContent}>
                        <span>Receita Líquida</span>
                        <strong>{dados ? formatarMoeda(dados.cards.netRevenue) : "—"}</strong>
                    </div>
                </Card>
                <Card className={styles.miniCard}>
                    <span className={`${styles.miniCardIcon} ${styles.salesIcon}`}><ChartNoAxesColumn /></span>
                    <div className={styles.miniCardContent}>
                        <span>Total de Vendas</span>
                        <strong>{dados?.cards.salesCount ?? "—"}</strong>
                    </div>
                </Card>
                <Card className={styles.miniCard}>
                    <span className={`${styles.miniCardIcon} ${styles.ticketIcon}`}><Banknote /></span>
                    <div className={styles.miniCardContent}>
                        <span>Ticket Médio</span>
                        <strong>{dados ? formatarMoeda(dados.cards.averageTicket) : "—"}</strong>
                    </div>
                </Card>
            </div>

            <div className={styles.graficosCards}>
                <Card>
                    <h2> Vendas por Dia </h2>
                    {dados && dados.salesByDay.length > 0
                        ? <SalesByDay data={dados.salesByDay} />
                        : <p className={styles.semDados}>Sem dados no período</p>}
                </Card>

                <Card>
                    <h2> Vendas por Bandeira </h2>
                    {dados && dados.salesByBrand.length > 0
                        ? <SalesByBrand data={dados.salesByBrand} />
                        : <p className={styles.semDados}>Sem dados no período</p>}
                </Card>
                <Card>
                    <h2> Vendas por Status </h2>
                    {dados && dados.salesByStatus.length > 0
                        ? <SalesByStatus data={dados.salesByStatus} />
                        : <p className={styles.semDados}>Sem dados no período</p>}
                </Card>
            </div>

            <div className={styles.CardTabela}>
                <Card>
                    <h1> Últimas vendas </h1>
                    <div className={styles.contentTable}>
                        {vendas.length > 0 ? (
                            <Tabela
                                dados={(vendas)}
                                colunas={colunasVendas}
                                obterChave={(venda) => venda.id}
                                maxHeight={280}
                            />
                        ) : (
                            <p className={styles.semDados}>Nenhuma venda no período</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
