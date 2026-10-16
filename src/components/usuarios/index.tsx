import styles from "./styles.module.css";

export function Usuarios() {
    return (
        <div className={styles.usuariosPage}>
            <h1 className={styles.title}> Usuários </h1>
            <div className={styles.usuarios}>
                <button>
                    + Novo usuário
                </button>
                <form className={styles.usuariosFiltros}>
                    <label>
                        <input type="text" placeholder="Digite o nome do usuário" />
                    </label>
                    <label >
                        <span>Perfil</span>
                        <select name="brand">
                            <option value="">Todos</option>
                            <option value="DEVELOPER">Desenvolvedor</option>
                            <option value="DIRECTOR">Diretor</option>
                        </select>
                    </label>

                     <label >
                        <span>Status</span>
                        <select name="brand">
                            <option value="">Todos</option>
                            <option value="true">Ativo</option>
                            <option value="false">Inativo</option>
                        </select>
                    </label>
                </form>
            </div>
        </div>
    )
}