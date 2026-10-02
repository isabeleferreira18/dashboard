import type { ReactNode } from "react";
import styles from "./styles.module.css";

type CardProps = {
    children: ReactNode;
    className?: string;
};

export function Card({ children, className }: CardProps) {
    return (
        <div className={`${styles.card} ${className ?? ""}`}>
            {children}
        </div>
    );
}

