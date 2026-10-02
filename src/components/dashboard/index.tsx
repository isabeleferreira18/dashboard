import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import { Card } from "../card";
import styles from "./styles.module.css";

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
};

export function Dashboard() {
    const [dados, setDados] = useState<DashboardData | null>(null);

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

        return res.json() as Promise<DashboardData>;
    }

    useEffect(() => {
        getDashboard()
            .then(setDados)
            .catch((error: unknown) => {
                console.error("Erro ao carregar o dashboard:", error);
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

        try {
            const resultado = await getDashboard(startDate, endDate);
            setDados(resultado);
        } catch (error: unknown) {
            console.error("Erro ao buscar dados do dashboard:", error);
        }
    }

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.dashboardHeader}>
                <h1 className={styles.title}>Dashboard</h1>
                <div className={styles.dashboardFiltro}>
                    <CalendarDays className={styles.calendarIcon} aria-hidden="true" />
                    <form onSubmit={handleSubmit}>
                        <input name="startDate" aria-label="Data inicial" type="date" />
                        <span className={styles.dateSeparator} aria-hidden="true">–</span>
                        <input name="endDate" aria-label="Data final" type="date" />
                        <button type="submit">Aplicar</button>
                    </form>
                </div>
            </div>

            <div className="miniCards">
                <Card >
                    <h1>Receita Bruta</h1>
                    <h1>{dados?.cards.grossRevenue ?? "—"}</h1>
                </Card>
                <Card >
                    <h1>Receita Líquida</h1>
                    <h1>{dados?.cards.netRevenue ?? "—"}</h1>
                </Card>
                <Card>
                    <h1>Total de vendas</h1>
                    <h1>{dados?.cards.salesCount ?? "—"}</h1>
                </Card>
                <Card>
                    <h1>Total de vendas</h1>
                    <h1>{dados?.cards.averageTicket ?? "—"}</h1>
                </Card>
            </div>

            <div className="graficosCards">
                <Card><h1> GRÁFICO </h1></Card>
                <Card><h1> GRÁFICO </h1></Card>
                <Card><h1> GRÁFICO </h1></Card>
            </div>

            <div className="CardTabela">
                <Card>
                    <h1> TABELA </h1>
                </Card>
            </div>
        </div>
    );
}
