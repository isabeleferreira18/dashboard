// import { SideBar } from "./components/sideBar";
import './styles/theme.css';
import './styles/global.css';
// import { Users } from "./components/users";
// import { Dashboard } from "./components/dashboard";
import { Login } from "./components/login";

export function App() {
  return (
    <>
      {/* <SideBar /> */}
      <main className="pageContent">
        <Login />
        {/* <Dashboard/> */}
        {/* <Users/> */}
      </main>
    </>
  )
}

