import { useState } from "react";
import "./styles/theme.css";
import "./styles/global.css";
import { Dashboard } from "./components/dashboard";
import { Login } from "./components/login";
import { SideBar } from "./components/sideBar";

export function App() {
  const [loginSucesso, setLoginSucesso] = useState(false);

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
