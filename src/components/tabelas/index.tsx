import styles from "./styles.module.css";

type Coluna<T> = {
    titulo: string;
    renderizar: (item: T) => React.ReactNode;
}

type TabelaProps<T> = {
    dados: T[];
    colunas: Coluna<T>[];
    obterChave: (item: T) => string | number;
}

export function Tabela<T>({ dados, colunas, obterChave }: TabelaProps<T>) {
    return (
        <div className={styles.tabelaVendas}>
            <table className={styles.tabela}>
                <thead>
                    <tr>
                        {colunas.map((coluna) => (
                            <th key={coluna.titulo} scope="col">
                                {coluna.titulo}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dados.map((item) => (
                        <tr key={obterChave(item)}>
                            {colunas.map((coluna) => (
                                <td key={coluna.titulo}>
                                    {coluna.renderizar(item)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
