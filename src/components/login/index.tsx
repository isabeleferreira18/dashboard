import { useState } from "react";
import styles from "./styles.module.css"
import { EyeIcon } from "lucide-react";
import { useAuthContext } from "../../contexts/useAuthContext";

export function Login() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const auth = useAuthContext();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const cpf = formData.get("cpf");
        const password = formData.get("password");

        if (typeof cpf !== "string" || typeof password !== "string") {
            return;
        }
        setErro(null);
        setEnviando(true);
        try {
            await auth.loginAuth(cpf, password);
        } catch (error: unknown) {
            if (error instanceof TypeError) {
                setErro("Erro de conexão. Verifique sua internet e tente novamente.");
            } else if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Erro inesperado");
            }
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContent}>
                <form onSubmit={handleSubmit} className={styles.formLogin}>
                    <h1 className={styles.title}> Bem vindo </h1>
                    <p className={styles.title}> Acesse o Backoffice </p>
                    <label htmlFor="cpf"> CPF </label>
                    <input id="cpf" name="cpf" type="text"
                        maxLength={14}
                        pattern="[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}"
                        title="Digite o CPF no formato 000.000.000-00"
                        required className={styles.inputForm}
                        placeholder="000.000.000-00" />

                    <label htmlFor="password"> Senha </label>
                    <div className={styles.campoSenha}>
                        <input id="password" name="password"
                            type={mostrarSenha ? "text" : "password"} required
                            className={styles.inputForm}
                            placeholder=" digite sua senha"
                        />
                        <button
                            type="button"
                            className={styles.botaoOlho}
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                            aria-pressed={mostrarSenha}
                        >
                            <EyeIcon> </EyeIcon>
                        </button>
                    </div>
                    {erro && <p role="alert" className={styles.erro}>{erro}</p>}
                    <button type="submit" className={styles.buttonLogin} disabled={enviando}>
                        {enviando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    )
}
