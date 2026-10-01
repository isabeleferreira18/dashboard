import { useState } from "react";
import styles from "./styles.module.css"
import { EyeIcon } from "lucide-react";
import { useAuthContext } from "../../contexts/useAuthContext";

export function Login() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const auth = useAuthContext();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const cpf = formData.get("cpf");
        const password = formData.get("password");

        if (typeof cpf !== "string" || typeof password !== "string") {
            return;
        }
        auth.loginAuth(cpf, password);
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContent}>
                <form onSubmit={handleSubmit} className={styles.formLogin}>
                    <h1 className={styles.title}> BEM VINDO </h1>
                    <p className={styles.title}> Acesse o Dashboard </p>
                    <label htmlFor="CPF"> CPF </label>
                    <input id="cpf" name="cpf" type="text"
                        inputMode="numeric"
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
                    <button type="submit" className={styles.buttonLogin}>Entrar</button>
                </form>
            </div>
        </div>
    )
}
