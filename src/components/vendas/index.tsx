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

const entesPublicos: EntePublico[] = [
    { id: 4, name: "Câmara Municipal" },
    { id: 5, name: "Município de São Paulo" },
    { id: 6, name: "Prefeitura Municipal" },
];

export function Vendas() {
    const [buscaEnte, setBuscaEnte] = useState("");
    const [publicEntityId, setPublicEntityId] = useState<number | null>(null);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
    const [vendas, setVendas] = useState<VendasResposta["groups"]>([]);

    const entesFiltrados = entesPublicos.filter((ente) =>
        ente.name.toLocaleLowerCase("pt-BR").includes(buscaEnte.trim().toLocaleLowerCase("pt-BR"))
    );

    function limparFiltroEnte() {
        setBuscaEnte("");
        setPublicEntityId(null);
        setMostrarSugestoes(false);
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
        getVendas()
            .then((resultado) => {
                setVendas(resultado.groups);
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

        try {
            const resultadoVendas = await getVendas(startDate, endDate);
            setVendas(resultadoVendas.groups);
        } catch (error: unknown) {
            console.error("Erro ao buscar dados do dashboard:", error);
        }
    }
    return (
        <div className={styles.vendasPage}>
            <h1 className={styles.title}>Vendas</h1>
            <div className="vendasFiltro">
                <form className={styles.vendasFiltros} onSubmit={handleSubmit}>
                    <label className={styles.periodo}>
                        <span>Período</span>
                        <div className={styles.datasPeriodo}>
                            <input name="startDate" type="date" aria-label="Data inicial" />
                            <input name="endDate" type="date" aria-label="Data final" />
                        </div>
                    </label>

                    <label className={styles.entePublico}>
                        <span>Ente Público</span>
                        <input type="text"/> 
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
                            onClick={limparFiltroEnte}
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
