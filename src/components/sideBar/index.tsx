import { useAuthContext } from "../../contexts/useAuthContext";
import styles from "./styles.module.css"
import { ChartLine, House, LogOut, UserRound } from 'lucide-react';

type Pagina = "dashboard" | "vendas";

type SideBarProps = {
    onNavigate: (pagina: Pagina) => void;
    paginaAtual: Pagina;
};

export function SideBar({ onNavigate, paginaAtual }: SideBarProps) {
    const auth = useAuthContext();
    return (
        <div className={styles.sideBar}>

            <div className={styles.users}>

                <UserRound className={styles.imgUser} />
                <div className={styles.infoUser}>
                    <h1> {auth.user.name} </h1>
                    <p> {auth.user.role} </p>
                </div>
            </div>

            <div className={styles.menu}>
                <button
                    className={`${styles.menuItem} ${paginaAtual === "dashboard" ? styles.menuItemAtivo : ""}`}
                    type="button"
                    aria-current={paginaAtual === "dashboard" ? "page" : undefined}
                    onClick={() => onNavigate("dashboard")}
                >
                    <House />
                    <span>Dashboard</span>
                </button>

                <button
                    className={`${styles.menuItem} ${paginaAtual === "vendas" ? styles.menuItemAtivo : ""}`}
                    type="button"
                    aria-current={paginaAtual === "vendas" ? "page" : undefined}
                    onClick={() => onNavigate("vendas")}
                >
                    <ChartLine />
                    <span>Vendas</span>
                </button>
                {auth.user?.role === "DEVELOPER" && (
                    <a className={styles.menuItem} href="#">
                        <UserRound className={styles.imgUser} />
                        <span>Usuários</span>
                    </a>
                )}

            </div>

            <div className={styles.footerSidebar}>
                <button className={styles.buttonTheme} type="button">
                    <LogOut size={18} />
                    Modo claro
                </button>

                <button className={styles.logOut} onClick={auth.logout}>
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </div>
    )
}
