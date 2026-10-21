export function mensagensErros(status: number) {
    if (status === 403) return "Você não tem permissão para acessar este recurso";
    if (status === 404) return "Registro não encontrado";
    if (status === 400) return "Dados inválidos. Confira e tente novamente";
    return "Erro no servidor. Tente novamente";
}