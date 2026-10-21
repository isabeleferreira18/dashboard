export type Venda = {
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

export type VendasResposta = {
    groups: {
        date: string;
        sales: Venda[];
    }[];
};

export type EntePublico = {
    id: number;
    name: string;
};

export type FiltrosVendasResposta = {
    publicEntities: EntePublico[];
    brands: Venda["brand"][];
    statuses: Venda["status"][];
}