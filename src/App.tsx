import { SideBar } from "./components/sideBar";
import './styles/theme.css';
import './styles/global.css';
import { Login } from "./components/login";

export function App() {
  return (
    <>
      <SideBar />
      <main className="pageContent">
        <Login />
      </main>
    </>
  )
}

