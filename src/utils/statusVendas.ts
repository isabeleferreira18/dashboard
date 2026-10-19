import statusStyles from "../styles/statusTag.module.css";


const statusLabel: Record<string, string> = {
    APPROVED: "Aprovada",
    CANCELLED: "Cancelada",
    PENDING: "Pendente",
    REFUNDED: "Reembolsada",
};

const classesPorStatus: Record<string, string> = {
    APPROVED: statusStyles.statusAprovada,
    CANCELLED: statusStyles.statusCancelada,
    PENDING: statusStyles.statusPendente,
    REFUNDED: statusStyles.statusReembolsada,
};

export function getStatusClass(status: string): string {
    const classeCor = classesPorStatus[status] ?? statusStyles.statusDesconhecido;
    return `${statusStyles.status} ${classeCor}`;
}

export function getStatusLabel(status: string): string {
    return statusLabel[status] ?? status;
}
