import { useState, useEffect } from "react";
import "./styles/theme.css";
import "./styles/global.css";
import { Login } from "./components/login";
import { SideBar } from "./components/sideBar";
// import { Users } from "./components/users";
import { Dashboard } from "./components/dashboard";

export function App() {
  const [loginSucesso, setLoginSucesso] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  type User = {
    role: string,
  };
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    } async function auth() {
      const config: RequestInit = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }; try{
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, config);
      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        return;
      } else {
        const dados = await res.json();
        setUser({ role: dados.role });
        setLoginSucesso(true);
      }
    } catch (error: unknown) {
            alert("Falha de conexão no login:" + error);
    }
        finally{
         setIsLoading(false);
      }
    }auth()
  }, []);

  return (
    <>
      {loginSucesso && <SideBar />}
      <main className={`pageContent ${loginSucesso ? "pageContentWithSidebar" : ""}`}>
        {loginSucesso ? (
          <Dashboard />
        ) : (
          <Login onLoginSuccess={() => setLoginSucesso(true)} />
        )}
      </main>
    </>
  );
}
