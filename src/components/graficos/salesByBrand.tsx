import { PieChart, Pie, ResponsiveContainer, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts";
import styles from "./styles.module.css";

type SaleByBrand = {
    percentage: number;
    brand: string;
}

type SalesByBrandProps = {
    data: SaleByBrand[];
};

const brandColors: Record<string, string> = {
    VISA: "#e84c68",
    MASTERCARD: "#8162db",
    ELO: "#23c59c",
    AMEX: "#1d3c64",
};

function BrandSector(props: PieSectorShapeProps) {
    const brand = props.payload?.brand;
    return <Sector {...props} fill={brandColors[brand] ?? "#999"} />;

}

export function SalesByBrand({ data }: SalesByBrandProps) {
    return (
        <div className={styles.brandChartLayout}>
            <div className={styles.brandChart}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="percentage"
                            nameKey="brand"
                            cx="50%"
                            cy="50%"
                            outerRadius={72}
                            innerRadius={42}
                            shape={BrandSector}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className={styles.brandLegend}>
                {data.map(({ brand }) => (
                    <div className={styles.brandLegendItem} key={brand}>
                        <span
                            className={styles.brandLegendColor}
                            style={{ backgroundColor: brandColors[brand] ?? "#999" }}
                        />
                        <span>{brand}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
