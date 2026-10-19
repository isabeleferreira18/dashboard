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
    {titulo: "Código", renderizar: (venda: Venda) => `#${venda.id}`},
    {titulo: "Ente Público", renderizar: (venda: Venda) => venda.publicEntity.name},
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


export function Dashboard() {
    const [dados, setDados] = useState<DashboardData | null>(null);
    const [vendas, setVendas] = useState<Venda[]>([]);

    async function getDashboard(startDate?: string, endDate?: string): Promise<DashboardData> {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        const query = params.size > 0 ? `?${params.toString()}` : "";
        const token = localStorage.getItem("accessToken");

        if (!token) {
            throw new Error("Token de autenticação não encontrado. Faça login novamente.");
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/dashboard${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`Falha ao buscar dados do dashboard (HTTP ${res.status})`);
        }

        const resultado = (await res.json()) as DashboardData;

        return resultado;
    }
    async function getVendas(startDate?: string, endDate?: string): Promise<VendasResposta> {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

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
        getDashboard()
            .then(setDados)
            .catch((error: unknown) => {
                console.error("Erro ao carregar o dashboard:", error);
            });
        getVendas()
            .then((resultado) => {
                setVendas(resultado.groups.flatMap((grupo) => grupo.sales));
            })
            .catch((error: unknown) => {
                console.error("Erro ao carregar as Vendas:", error);
            });
    }, []);


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const startDate = formData.get("startDate");
        const endDate = formData.get("endDate");

        if (typeof startDate !== "string" || typeof endDate !== "string" || !startDate || !endDate) {
            return;
        }

        if (startDate > endDate) {
            alert("A data inicial deve ser anterior ou igual à data final.");
            return;
        }

        try {
            const resultado = await getDashboard(startDate, endDate);
            setDados(resultado);
            const resultadoVendas = await getVendas(startDate, endDate);
            setVendas(resultadoVendas.groups.flatMap((grupo) => grupo.sales));
        } catch (error: unknown) {
            console.error("Erro ao buscar dados do dashboard:", error);
        }
    }

    return (
        <div className="dashboardPage">
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
            </div>

            <div className={styles.miniCards}>
                <Card className={styles.miniCard}>
                    <span className={`${styles.miniCardIcon} ${styles.grossIcon}`}><DollarSign /></span>
                    <div className={styles.miniCardContent}>
                        <span>Receita Bruta</span>
                        <strong>{dados?.cards.grossRevenue ?? "—"}</strong>
                    </div>
                </Card>
                <Card className={styles.miniCard}>
                    <span className={`${styles.miniCardIcon} ${styles.netIcon}`}><DollarSign /></span>
                    <div className={styles.miniCardContent}>
                        <span>Receita Líquida</span>
                        <strong>{dados?.cards.netRevenue ?? "—"}</strong>
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
                        <strong>{dados?.cards.averageTicket ?? "—"}</strong>
                    </div>
                </Card>
            </div>

            <div className={styles.graficosCards}>
                <Card>
                    <h1> Vendas por Dia </h1>
                    <SalesByDay data={dados?.salesByDay ?? []} />
                </Card>

                <Card><h1> Vendas por Bandeira </h1>
                    <SalesByBrand data={dados?.salesByBrand ?? []} />
                </Card>
                <Card><h1> Vendas por Status </h1>
                    <SalesByStatus data={dados?.salesByStatus ?? []} />
                </Card>
            </div>

            <div className={styles.CardTabela}>
                <Card>
                    <h1> Últimas vendas </h1>
                    <div className={styles.contentTable}>
                        <Tabela
                            dados={(vendas)}
                            colunas={colunasVendas}
                            obterChave={(venda) => venda.id}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
