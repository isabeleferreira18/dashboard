import { useAuthContext } from "../../contexts/useAuthContext";
import styles from "./styles.module.css"
import { ChartLine, House, LogOut, UserRound } from 'lucide-react';

export function SideBar() {
    const auth = useAuthContext();
    return (
        <div className={styles.sideBar}>

            <div className={styles.users}>

                <UserRound className={styles.imgUser} />
                <div className={styles.infoUser}>
                    <h1> Isabele Ferreira </h1>
                    <p> Desenvolvedor(a) </p>
                </div>
            </div>

            <div className={styles.menu}>
                <a className={styles.menuItem} href="#">
                    <House />
                    <span>Dashboard</span>
                </a>

                <a className={styles.menuItem} href="#">
                    <ChartLine />
                    <span>Vendas</span>
                </a>
                {auth.user?.role === "DEVELOPER" && (
                    <a className={styles.menuItem} href="#">
                        <UserRound />
                        <span>Usuários</span>
                    </a>
                )}

            </div>

            <div className={styles.footerSidebar}>
                <button className={styles.buttonTheme} type="button">
                    <LogOut size={18} />
                    <span>Modo claro</span>
                </button>

                <a className={styles.logOut} href="#" >
                    <LogOut size={18} />
                    <button onClick={auth.logout}>Sair</button>
                </a>
            </div>

        </div>
    )
}