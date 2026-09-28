import styles from "./styles.module.css"

export function Login() {
    function handleSubmit() {
        function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
            event.preventDefault();
        }
    }
    return (
        <>
            <h1 className={styles.title}> LOGIN </h1>
            <form onSubmit={handleSubmit} className={styles.formLogin}>
                
                <label htmlFor="CPF"> CPF </label>
                <input id="cpf" name="cpf" type="text"
                    inputMode="numeric"
                    maxLength={14} required />

                <label htmlFor="password"> Senha </label>
                <input id="password" name="password" type="password" required />

                <button type="submit" className={styles.buttonLogin}>Entrar</button>
            </form>
        </>
    )
}