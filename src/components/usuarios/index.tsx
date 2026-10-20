import { useEffect, useState, type FormEvent } from "react";
import { Card } from "../card";
import { Tabela } from "../tabelas";
import styles from "./styles.module.css";
import { EyeIcon, Funnel, Pencil, Search, Trash2 } from "lucide-react";

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

type UsuariosResposta = {
    items: Usuario[];
};

export function Usuarios() {
    const [usuarios, setUsuarios] = useState<UsuariosResposta["items"]>([]);
    const [buscaNome, setBuscaNome] = useState("");
    const [mostrarForms, setMostrarForms] = useState<boolean>(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);

    function handleEditarUsuario(usuario: Usuario) {
        setUsuarioSelecionado(usuario);
        setMostrarForms(true);
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
            renderizar: (usuario: Usuario) => <span>{perfilUsuario[usuario.role]}</span>,
        },
        {
            titulo: "Ações",
            renderizar: (usuario: Usuario) => (
                <div className={styles.acoesTabela}>
                    <button
                        type="button"
                        className={styles.botaoEditar}
                        onClick={() => handleEditarUsuario(usuario)}
                        aria-label={`Editar usuário ${usuario.name}`}
                    >
                        <Pencil size={14} aria-hidden="true" />
                        Editar
                    </button>
                    <button
                        type="button"
                        className={styles.botaoExcluir}
                        aria-label={`Excluir usuário ${usuario.name}`}
                    >
                        <Trash2 size={14} aria-hidden="true" />
                        Excluir
                    </button>
                </div>
            ),
        },
    ];

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
            console.error("Erro ao carregar os usuários:", error);
        }
    }

    async function handleCriarUsuario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (usuarioSelecionado) {
            alert("O formulário de edição está preenchido. A atualização pela API ainda não foi conectada.");
            return;
        }
        const formData = new FormData(event.currentTarget);
        const name = formData.get("name");
        const cpf = formData.get("cpf");
        const email = formData.get("email");
        const password = formData.get("password");
        const role = formData.get("role")?.toString() ?? "";
    }

    return (
        <div>
            <div className={styles.headerUsuarios}>
                <h1 className="pageTitle"> Usuários </h1>
                <button type="button" className="buttonPrimary" onClick={() => {
                    setUsuarioSelecionado(null);
                    setMostrarForms(!mostrarForms);
                }}>
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
                    className="buttonPrimary">
                    <Funnel size={14} fill="#fff" />
                    Filtrar
                </button>
                <button type="reset"
                    className="buttonLimpar">
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

                {mostrarForms && (
                    <Card className={styles.cardFormulario}>
                        <form className={styles.formCriarUsuario} onSubmit={handleCriarUsuario} key={usuarioSelecionado?.id ?? "novo"}>
                            <h2>{usuarioSelecionado ? `Editar usuário: ${usuarioSelecionado.name}` : "Criar novo usuário"}</h2>
                            <div className={styles.camposFormulario}>
                                <label className={`${styles.campoFormulario} ${styles.campoNome}`} htmlFor="name">
                                    <span>Nome</span>
                                    <input id="name" name="name" type="text" defaultValue={usuarioSelecionado?.name ?? ""} placeholder="Digite o nome do usuário" />
                                </label>

                                <label className={`${styles.campoFormulario} ${styles.campoCpf}`} htmlFor="cpf">
                                    <span>CPF</span>
                                    <input id="cpf" name="cpf" type="text"
                                        inputMode="numeric"
                                        maxLength={14}
                                        pattern="[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}"
                                        title="Digite o CPF no formato 000.000.000-00"
                                        defaultValue={usuarioSelecionado?.cpf ?? ""}
                                        placeholder="000.000.000-00" />
                                </label>

                                <label className={`${styles.campoFormulario} ${styles.campoEmail}`} htmlFor="email">
                                    <span>E-mail</span>
                                    <input id="email" name="email" type="text" defaultValue={usuarioSelecionado?.email ?? ""} placeholder="Digite o e-mail do usuário" />
                                </label>

                                <label className={`${styles.campoFormulario} ${styles.campoPassword}`} htmlFor="password">
                                    <span>{usuarioSelecionado ? "Nova senha (opcional)" : "Senha"}</span>
                                    <span className={styles.campoSenha}>
                                        <input id="password" name="password"
                                            type={mostrarSenha ? "text" : "password"} required={!usuarioSelecionado}
                                            className={styles.inputForm}
                                            placeholder={usuarioSelecionado ? "Deixe em branco para manter a senha" : "Digite a senha"}
                                        />
                                        <button
                                            type="button"
                                            className={styles.botaoOlho}
                                            onClick={() => setMostrarSenha(!mostrarSenha)}
                                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                            aria-pressed={mostrarSenha}
                                        >
                                            <EyeIcon aria-hidden="true" />
                                        </button>
                                    </span>
                                </label>

                                <label className={`${styles.campoFormulario} ${styles.campoRole}`} htmlFor="role">
                                    <span>Perfil</span>
                                    <select id="role" name="role" defaultValue={usuarioSelecionado?.role ?? ""}>
                                        <option value="">Selecione o perfil</option>
                                        <option value="DEVELOPER">Desenvolvedor</option>
                                        <option value="DIRECTOR">Diretor</option>
                                    </select>
                                </label>
                                <div className={`${styles.acoesFormulario} ${styles.acoesCriacao}`}>
                                    <button type="button" className="buttonLimpar" onClick={() => {
                                        setMostrarForms(false);
                                        setUsuarioSelecionado(null);
                                    }}>Cancelar</button>
                                    <button type="submit" className="buttonPrimary">{usuarioSelecionado ? "Salvar alterações" : "Criar usuário"}</button>
                                </div>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    )
}
