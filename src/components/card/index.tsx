import type { ReactNode } from "react";
import styles from "./styles.module.css";

type CardProps = {
    title: string;
    children: ReactNode;
    className?: string;
};

export function Card({ title, children, className }: CardProps) {
    return (
        <section className={`${styles.card} ${className ?? ""}`}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.content}>{children}</div>
        </section>
    );
}
