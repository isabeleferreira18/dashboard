import { useState } from "react";
import "./styles/global.css";
import { Login } from "./components/login";
import { SideBar } from "./components/sideBar";
import { Dashboard } from "./components/dashboard";
import { Vendas } from "./components/vendas";
import { useAuthContext } from "./contexts/useAuthContext";
import { Usuarios } from "./components/usuarios";

export type Pagina = "dashboard" | "vendas" | "usuarios";

export function App() {
  const auth = useAuthContext();
  const [pagina, setPagina] = useState<Pagina>("dashboard");

  if (auth.isLoading) {
    return (<p> Verificando sessão... </p>);
  }

  if (auth.user !== null) {
    return (
      <>
        <SideBar onNavigate={setPagina} paginaAtual={pagina} user={auth.user} />
        <main className="pageContentWithSidebar">
          {pagina === "dashboard" && <Dashboard />}
          {pagina === "vendas" && <Vendas />}
          {pagina === "usuarios" && <Usuarios />}
        </main>
      </>
    );
  }
  return (
    <main className="pageContent" >
      <Login />
    </main>)
}
