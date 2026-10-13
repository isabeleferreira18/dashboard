import { XAxis, YAxis, Area, AreaChart, ResponsiveContainer, CartesianGrid } from "recharts";

type SaleByDay = {
    date: string;
    amount: number;
}

type SalesByDayProps = {
    data: SaleByDay[];
};

function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00`);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date
        .toLocaleDateString("pt-BR", { month: "short" })
        .replace(".", "");

    return `${day} ${month}`;
}

export function SalesByDay({ data }: SalesByDayProps) {
    return (
        <ResponsiveContainer width="100%" height={200}>
        <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
            <Area 
            dataKey="amount" 
            fill="#23C59C" 
            stroke="#23C59C"
            />
            <CartesianGrid stroke="#e5e5e5" />
            <YAxis tick={{ fontSize: 13 }} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 13 }} />
        </AreaChart>
        </ResponsiveContainer>
    )
}

