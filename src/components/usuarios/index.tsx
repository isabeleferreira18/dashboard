import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Card } from "../card";
import { Tabela } from "../tabelas";
import styles from "./styles.module.css";
import { EyeIcon, Funnel, Pencil, Search, Trash2 } from "lucide-react";
import type { Usuario, UsuariosResposta } from "./types";
import { getUsuarios, criarUsuarios, desativarUsuario, editarUsuario, alterarSenhaUsuario } from "./crud";

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

export function Usuarios() {
    const [usuarios, setUsuarios] = useState<UsuariosResposta["items"]>([]);
    const [buscaNome, setBuscaNome] = useState("");
    const [mostrarForms, setMostrarForms] = useState<boolean>(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
    const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);
    const [erroUsuarios, setErroUsuarios] = useState<string | null>(null);
    const [filtrosAplicados, setFiltrosAplicados] = useState({ nome: "", perfil: "", status: "" });

    const carregarUsuarios = useCallback(async (nome = "", perfil = "", status = "") => {
        setCarregandoUsuarios(true);
        setErroUsuarios(null);
        try {
            const resultado = await getUsuarios(nome, perfil, status);
            setUsuarios(resultado.items);
            return true;
        } catch (error: unknown) {
            setErroUsuarios(error instanceof Error ? error.message : "Não foi possível carregar os usuários.");
            return false;
        } finally {
            setCarregandoUsuarios(false);
        }
    }, []);

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
                        onClick={() => handleDesativarUsuario(usuario)}
                        aria-label={`Desativar usuário ${usuario.name}`}
                    >
                        <Trash2 size={14} aria-hidden="true" />
                        Desativar
                    </button>
                </div>
            ),
        },
    ];

    useEffect(() => {
        void carregarUsuarios();
    }, [carregarUsuarios]);
    
    function handleEditarUsuario(usuario: Usuario) {
        setUsuarioSelecionado(usuario);
        setMostrarForms(true);
    }
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const role = formData.get("role")?.toString() ?? "";
        const status = formData.get("active")?.toString() ?? "";

        const filtros = { nome: buscaNome.trim(), perfil: role, status };
        setFiltrosAplicados(filtros);
        await carregarUsuarios(filtros.nome, filtros.perfil, filtros.status);
    }

    async function handleLimparFiltros() {
        setBuscaNome("");
        setFiltrosAplicados({ nome: "", perfil: "", status: "" });
        await carregarUsuarios();
    }

    async function handleDesativarUsuario(usuario: Usuario) {
        if (!window.confirm(`Deseja realmente desativar o usuário ${usuario.name}?`)) {
            return;
        }
        try {
            await desativarUsuario(usuario.id);
            setUsuarios((atuais) => atuais.map((item) =>
                item.id === usuario.id ? { ...item, active: false } : item
            ));
            alert("Usuário desativado com sucesso.");
        } catch (error: unknown) {
            console.error("Erro ao desativar usuário:", error);
            alert(error instanceof Error ? error.message : "Não foi possível desativar o usuário.");
        }
    }

    async function handleAlterarUsuario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!usuarioSelecionado) {
            alert("Selecione um usuário para editar.");
            return;
        }
        const formData = new FormData(event.currentTarget);
        const name = formData.get("name");
        const cpf = formData.get("cpf");
        const email = formData.get("email");
        const password = formData.get("password");
        const role = formData.get("role")?.toString() ?? "";

        if (
            typeof name !== "string" ||
            typeof cpf !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            alert("Não foi possível ler os campos. Confira os dados e tente novamente.");
            return;
        } 
        if (!name.trim() || !cpf.trim() || !email.trim()) {
            alert("Preencha nome, CPF e e-mail.");
            return;
        } 
        if (password && password.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        } 
        if (role !== "DIRECTOR" && role !== "DEVELOPER") {
            alert("Selecione um perfil válido.");
            return;
        }

        const usuarioAtualizado: Usuario = {
            ...usuarioSelecionado,
            name,
            cpf,
            email,
            role,
        };

        let dadosAtualizados = false;

        try {
            await editarUsuario(usuarioSelecionado.id, name, cpf, email, role);
            dadosAtualizados = true;

            if (password) {
                await alterarSenhaUsuario(usuarioSelecionado.id, password);
            }

            setUsuarios((atuais) => atuais.map((usuario) =>
                usuario.id === usuarioSelecionado.id ? usuarioAtualizado : usuario
            ));
            setMostrarForms(false);
            setUsuarioSelecionado(null);
            setMostrarSenha(false);
            alert("Usuário atualizado com sucesso.");
        } catch (error: unknown) {
            console.error("Erro ao atualizar usuário:", error);
            if (dadosAtualizados) {
                setUsuarios((atuais) => atuais.map((usuario) =>
                    usuario.id === usuarioSelecionado.id ? usuarioAtualizado : usuario
                ));
            }

            const detalheErro = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
            const mensagem = dadosAtualizados && password
                ? `Os dados do usuário foram atualizados, mas a senha não: ${detalheErro}`
                : detalheErro;
            alert(mensagem);
        }
    }

    async function handleCriarUsuario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formulario = event.currentTarget;
        const formData = new FormData(formulario);
        const name = formData.get("name");
        const cpf = formData.get("cpf");
        const email = formData.get("email");
        const password = formData.get("password");
        const role = formData.get("role")?.toString() ?? "";

        if (typeof name !== "string" ||
            typeof cpf !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            alert("Não foi possível ler os campos. Confira os dados e tente novamente.");
            return;
        } if (!name.trim() || !cpf.trim() || !email.trim() || !password) {
            alert("Preencha nome, CPF, e-mail e senha.");
            return;
        } if (password.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return;
        } if (role !== "DIRECTOR" && role !== "DEVELOPER") {
            alert("Selecione um perfil válido.");
            return;
        } try {
            await criarUsuarios(name, cpf, email, password, role);
        } catch (error: unknown) {
            console.error("Erro ao criar usuário:", error);
            alert(error instanceof Error ? error.message : "Não foi possível criar o usuário.");
            return;
        }

        formulario.reset();
        setMostrarSenha(false);
        alert("Usuário criado com sucesso.");

        const listaAtualizada = await carregarUsuarios();
        if (!listaAtualizada) {
            alert("Usuário criado, mas não foi possível atualizar a lista. Atualize a página para vê-lo.");
        }
    }

    return (
        <div>
            <div className={styles.headerUsuarios}>
                <h1 className="pageTitle"> Usuários </h1>
                <button type="button" className="buttonPrimary" onClick={() => {
                    const formularioDeCriacaoJaAberto = mostrarForms && usuarioSelecionado === null;
                    setUsuarioSelecionado(null);
                    setMostrarSenha(false);
                    setMostrarForms(!formularioDeCriacaoJaAberto);
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
                        {carregandoUsuarios ? (
                            <p className={styles.estadoConsulta} role="status">Carregando usuários...</p>
                        ) : erroUsuarios ? (
                            <div className={styles.estadoConsulta}>
                                <p className={styles.erroConsulta} role="alert">{erroUsuarios}</p>
                                <button
                                    type="button"
                                    className="buttonPrimary"
                                    onClick={() => void carregarUsuarios(
                                        filtrosAplicados.nome,
                                        filtrosAplicados.perfil,
                                        filtrosAplicados.status
                                    )}
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        ) : usuarios.length === 0 ? (
                            <p className={styles.estadoConsulta} role="status">Nenhum usuário encontrado.</p>
                        ) : (
                            <Tabela
                                dados={usuarios}
                                colunas={colunasUsuarios}
                                obterChave={(usuario) => usuario.id}
                            />
                        )}
                    </div>
                </Card>

                {mostrarForms && (
                    <Card className={styles.cardFormulario}>
                        <form
                            className={styles.formCriarUsuario}
                            onSubmit={usuarioSelecionado ? handleAlterarUsuario : handleCriarUsuario}
                            key={usuarioSelecionado?.id ?? "novo"}
                        >
                            <h2>{usuarioSelecionado ? `Editar usuário: ${usuarioSelecionado.name}` : "Criar novo usuário"}</h2>
                            <div className={styles.camposFormulario}>
                                <label className={`${styles.campoFormulario} ${styles.campoNome}`} htmlFor="name">
                                    <span>Nome</span>
                                    <input id="name" name="name" type="text" required defaultValue={usuarioSelecionado?.name ?? ""} placeholder="Digite o nome do usuário" />
                                </label>

                                <label className={`${styles.campoFormulario} ${styles.campoCpf}`} htmlFor="cpf">
                                    <span>CPF</span>
                                    <input id="cpf" name="cpf" type="text"
                                        required
                                        inputMode="numeric"
                                        maxLength={14}
                                        pattern="[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}"
                                        title="Digite o CPF no formato 000.000.000-00"
                                        defaultValue={usuarioSelecionado?.cpf ?? ""}
                                        placeholder="000.000.000-00" />
                                </label>

                                <label className={`${styles.campoFormulario} ${styles.campoEmail}`} htmlFor="email">
                                    <span>E-mail</span>
                                    <input id="email" name="email" type="email" required defaultValue={usuarioSelecionado?.email ?? ""} placeholder="Digite o e-mail do usuário" />
                                </label>

                                <label className={`${styles.campoFormulario} ${styles.campoPassword}`} htmlFor="password">
                                    <span>{usuarioSelecionado ? "Nova senha (opcional)" : "Senha"}</span>
                                    <span className={styles.campoSenha}>
                                        <input id="password" name="password"
                                            type={mostrarSenha ? "text" : "password"} required={!usuarioSelecionado}
                                            minLength={6}
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
                                    <select id="role" name="role" required defaultValue={usuarioSelecionado?.role ?? ""}>
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
