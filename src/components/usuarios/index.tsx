import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../card";
import { Tabela } from "../tabelas";
import styles from "./styles.module.css";
import { Funnel, Search } from "lucide-react";

type Usuario = {
    id: number;
    name: string;
    cpf: string;
    email: string;
    role: string;
    active: boolean,
}

const statusUsuarios: Record<string, string> = {
    true: "Ativo",
    false: "Inativo"
};

const classesStatus: Record<string, string> = {
    true: styles.statusAtivo,
    false: styles.statusInativo
}

const perfilUsuario: Record<string, string> = {
    DIRECTOR: "Diretor",
    DEVELOPER: "Desenvolvedor"
}

const colunasUsuarios = [
    { titulo: "Nome", renderizar: (usuario: Usuario) => usuario.name },
    { titulo: "E-mail", renderizar: (usuario: Usuario) => usuario.email },
    { titulo: "CPF", renderizar: (usuario: Usuario) => usuario.cpf },
    {
        titulo: "Status", renderizar: (usuario: Usuario) => {
            const status = String(usuario.active);
            return (
                <span className={`${styles.status} ${classesStatus[status] ?? styles.statusDesconhecido}`}>
                    {statusUsuarios[status] ?? status}
                </span>
            )
        },
    },
    {
        titulo: "Perfil",
        renderizar: (usuario: Usuario) => (
            <span>
                {perfilUsuario[usuario.role]}
            </span>
        )
    },
];

type UsuariosResposta = {
    items: Usuario[];
};

export function Usuarios() {
    const [usuarios, setUsuarios] = useState<UsuariosResposta["items"]>([]);
    const [buscaNome, setBuscaNome] = useState("");

    async function getUsuarios(name?: string, role?: string, status?: string): Promise<UsuariosResposta> {
        const params = new URLSearchParams();
        if (name) params.set("search", name);
        if (role) params.set("role", role);
        if (status) params.set("active", status);
        const query = params.size > 0 ? `?${params.toString()}` : "";

        const token = localStorage.getItem("accessToken");
        const roleLogin = localStorage.getItem("role");

        if (!token) {
            throw new Error("Token de autenticação não encontrado. Faça login novamente.");
        }

        if (roleLogin !== "DEVELOPER") {
            throw new Error("Você não tem autorização para listar usuários.");
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/users${query}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`Falha ao buscar dados do dashboard (HTTP ${res.status})`);
        }

        const resultado = (await res.json()) as UsuariosResposta;
        return resultado;
    }

    useEffect(() => {
        getUsuarios()
            .then((resultado) => {
                setUsuarios(resultado.items);
            })
            .catch((error: unknown) => {
                console.error("Erro ao carregar os usuários:", error);
            });
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const role = formData.get("role")?.toString() ?? "";
        const status = formData.get("active")?.toString() ?? "";
        const resultado = await getUsuarios(buscaNome.trim(), role, status);
        setUsuarios(resultado.items);
    }

    async function handleLimparFiltros() {
        setBuscaNome("");
        try {
            const resultado = await getUsuarios();
            setUsuarios(resultado.items);
        } catch (error: unknown) {
            console.error("Erro ao carregar as vendas:", error);
        }
    }
    return (
        <div className={styles.usuariosPage}>
            <div className={styles.headerUsuarios}>
                <h1 className={styles.title}> Usuários </h1>
                <button className={styles.buttonUsuario}>
                    + Novo usuário
                </button>
            </div>
            <form className={styles.usuariosFiltros} onSubmit={handleSubmit} onReset={handleLimparFiltros}>
                <label className={styles.buscaUsuario}>
                    <Search size={16} aria-hidden="true" />
                    <input type="text" placeholder="Digite o nome do usuário"
                        value={buscaNome}
                        onChange={(event) => setBuscaNome(event.target.value)}
                    />
                </label>
                <label >
                    <span>Perfil</span>
                    <select name="role">
                        <option value="">Todos</option>
                        <option value="DEVELOPER">Desenvolvedor</option>
                        <option value="DIRECTOR">Diretor</option>
                    </select>
                </label>

                <label >
                    <span>Status</span>
                    <select name="active">
                        <option value="">Todos</option>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>
                </label>
                <button type="submit"
                    className={styles.buttonFiltrar}>
                    <Funnel size={14} fill="#fff" />
                    Filtrar
                </button>
                <button type="reset"
                    className={styles.buttonLimpar}>
                    Limpar
                </button>
            </form>

            <div className={styles.tabelaUsuario}>
                <Card>
                    <div className={styles.contentTable}>
                        <Tabela
                            dados={(usuarios)}
                            colunas={colunasUsuarios}
                            obterChave={(usuario) => usuario.id}
                        />
                    </div>
                </Card>
            </div>
        </div>
    )
}
