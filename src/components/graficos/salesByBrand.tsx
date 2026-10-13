import { PieChart, Pie, Legend, ResponsiveContainer} from "recharts";

type SaleByBrand = {
    percentage: number;
    brand: string;
}

type SalesByBrandProps = {
    data: SaleByBrand[];
};

export function SalesByBrand({ data }: SalesByBrandProps) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart >
                <Pie
                    data={data}
                    dataKey="percentage"
                    nameKey="brand"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                />
               <Legend 
               position="right" 
               layout="vertical"/>
            </PieChart>
        </ResponsiveContainer>
    )
}