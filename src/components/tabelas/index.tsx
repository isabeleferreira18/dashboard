import styles from "./styles.module.css";

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

type TabelaVendasProps = {
    vendas: Venda[];
};

export function TabelaVendas({ vendas }: TabelaVendasProps) {
    return (
        <div className={styles.tabelaVendas}>
            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th scope="col"> Código </th>
                        <th scope="col"> Ente Público </th>
                        <th scope="col"> Bandeira </th>
                        <th scope="col"> Status </th>
                        <th scope="col"> Valor </th>
                        <th scope="col"> Data </th>
                    </tr>
                </thead>
                <tbody>
                    {vendas.map((venda) => (
                        <tr key={venda.id}>
                            <td>#{venda.id}</td>
                            <td>{venda.publicEntity.name}</td>
                            <td>{venda.brand}</td>
                            <td>{venda.status}</td>
                            <td>{venda.amount}</td>
                            <td>{venda.createdAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
