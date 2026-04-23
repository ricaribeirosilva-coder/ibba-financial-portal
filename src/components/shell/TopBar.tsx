import { Link, useLocation } from "react-router-dom";
import styles from "./TopBar.module.css";

function productNameFor(pathname: string): string | null {
  if (pathname.startsWith("/credit-cycle")) return "Ciclo de Crédito";
  return null;
}

export default function TopBar() {
  const { pathname } = useLocation();
  const product = productNameFor(pathname);
  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.brand}>IBBA Financial Portal</Link>
      {product && (
        <>
          <span className={styles.divider} aria-hidden />
          <span className={styles.product}>{product}</span>
        </>
      )}
      <div className={styles.spacer} />
    </header>
  );
}
