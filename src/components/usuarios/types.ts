export type Usuario = {
    id: number;
    name: string;
    cpf: string;
    email: string;
    role: string;
    active: boolean,
}

export type UsuariosResposta = {
    items: Usuario[];
};
