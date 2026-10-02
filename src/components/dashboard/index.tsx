import { CalendarDays } from "lucide-react"
import styles from "./styles.module.css"

export function Dashboard() {

    async function getDashboard(startDate: string, endDate: string) {
        const params = new URLSearchParams({ startDate, endDate });
        const token = localStorage.getItem("accessToken");

        if (!token) {
            throw new Error("Token de autenticação não encontrado. Faça login novamente.");
        }

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/dashboard?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );

        if (!res.ok) {
            throw new Error(`Falha ao buscar dados do dashboard (HTTP ${res.status})`);
        }

        return res.json();
    }
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const startDate = formData.get("startDate");
        const endDate = formData.get("endDate");

        if (typeof startDate !== "string" || typeof endDate !== "string") {
            return;
        }

        try {
            const dados = await getDashboard(startDate, endDate);
            console.log(dados);
        } catch (error) {
            console.error("Erro ao buscar dados do dashboard:", error);
        }
    };

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.dashboardHeader}>
                <h1 className={styles.title}>Dashboard</h1>
                <div className={styles.dashboardFiltro}>
                    <CalendarDays className={styles.calendarIcon} aria-hidden="true" />

                    <form onSubmit={handleSubmit} >
                        <input name="startDate" aria-label="Data Inicial" type="date" placeholder="data inicial" />
                        <span className={styles.dateSeparator} aria-hidden="true">–</span>
                        <input name="endDate" aria-label="Data Final" type="date" placeholder="data final" />
                        <button type="submit"> Aplicar </button>
                    </form>

                </div>
            </div>
        </div>
    )
}
