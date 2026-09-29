import { useState } from "react";
import styles from "./styles.module.css"
import { EyeIcon } from "lucide-react";

type LoginProps = {
    onLoginSuccess: () => void;
};

export function Login({ onLoginSuccess }: LoginProps) {
    const [mostrarSenha, setMostrarSenha] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cpf: formData.get("cpf"),
                password: formData.get("password"),
            })
        });
        if (!res.ok) {
            console.error("Falha no login:", res.status);
            return;
        } else {
            const dados = await res.json();
            console.log(dados);
            console.log("login feito");
            onLoginSuccess();
        }
    }
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