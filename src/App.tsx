import "./styles/theme.css";
import "./styles/global.css";
import { Login } from "./components/login";
import { SideBar } from "./components/sideBar";
import { Dashboard } from "./components/dashboard";
import { useAuthContext } from "./contexts/useAuthContext";

export function App() {
  const auth = useAuthContext();

  if (auth.isLoading) {
    return ( <p> Verificando sessão... </p>);
  }

  if (auth.user !== null) {
    return (
      <>
        <SideBar />
        <Dashboard />
      </>
    );
  } return <Login />;
}
