import { Outlet } from "react-router-dom";
import Sidebar from "../../components/shell/Sidebar";
import styles from "./CreditCycleLayout.module.css";

export default function CreditCycleLayout() {
  return (
    <div className={styles.wrap}>
      <Sidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
