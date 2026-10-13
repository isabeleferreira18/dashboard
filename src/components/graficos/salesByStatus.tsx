import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer, Rectangle } from "recharts";
import type { BarShapeProps } from "recharts";

type SaleByStatus = {
    quantity: number;
    status: string;
}

type SalesByStatusProps = {
    data: SaleByStatus[];
};

const statusColors: Record<string, string> = {
  APPROVED: "#23c59c",
  CANCELLED: "#e84c68",
  PENDING: "#ffca16",
  REFUNDED: "#e5e5e5",
};

const statusOrder: Record<string, number> = {
  APPROVED: 0,
  CANCELLED: 1,
  PENDING: 2,
  REFUNDED: 3,
};

const statusLabels: Record<string, string> = {
  APPROVED: "Aprovada",
  CANCELLED: "Cancelada",
  PENDING: "Pendente",
  REFUNDED: "Reembolsada",
};

function translateStatus(status: string) {
  return statusLabels[status] ?? status;
}

function StatusBar(props: BarShapeProps) {
  const status = props.payload?.status;

  return (
    <Rectangle
      {...props}
      fill={statusColors[status] ?? "#999"}
    radius={[6, 6, 0, 0]}
    />
  );
}

export function SalesByStatus({ data }: SalesByStatusProps) {
    const orderedData = [...data].sort(
        (a, b) =>
            (statusOrder[a.status] ?? Infinity) -
            (statusOrder[b.status] ?? Infinity)
    );

    return (
        <ResponsiveContainer width="100%" height={200}>
        <BarChart
            data={orderedData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
            <Bar dataKey="quantity" shape={StatusBar}  barSize={26}/>
            <YAxis tick={{ fontSize: 13 }} />
            <XAxis
                dataKey="status"
                tick={{ fontSize: 13 }}
                interval={0}
                tickFormatter={translateStatus}
            />
        </BarChart>
        </ResponsiveContainer>
    )
}

