import type { ReactNode } from "react";
import styles from "./styles.module.css";

export type TableColumn<T> = {
  key: string; 
  title: string;
  render?: (value: any, row: T) => ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T | ((row: T) => string | number); 
  children?: ReactNode;
  className?: string;
};

export function Table<T>({
  columns,
  data,
  rowKey,
  children,
  className,
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === "function") return rowKey(row);
    return (row[rowKey] as string | number) ?? index;
  };

  return (
    <section className={`${styles.tableContainer} ${className ?? ""}`}>
      {children && <div className={styles.tableContent}>{children}</div>}
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={getRowKey(row, index)}>
              {columns.map((column) => {
                const value = (row as Record<string, any>)[column.key];
                return (
                  <td key={column.key}>
                    {column.render
                      ? column.render(value, row)
                      : String(value ?? "")}
                  </td>
                );
              })}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td className={styles.emptyState} colSpan={columns.length}>
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}