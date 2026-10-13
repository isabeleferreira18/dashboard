import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer } from "recharts";

type SaleByStatus = {
    quantity: number;
    status: string;
}

type SalesByStatusProps = {
    data: SaleByStatus[];
};

export function SalesByStatus({ data }: SalesByStatusProps) {
    return (
        <ResponsiveContainer width="100%" height={200}>
        <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
            <Bar dataKey="quantity" />
            <YAxis />
            <XAxis dataKey="status" />
        </BarChart>
        </ResponsiveContainer>
    )
}

