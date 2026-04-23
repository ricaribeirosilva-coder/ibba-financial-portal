import { Link } from "react-router-dom";
import styles from "./Home.module.css";

const COMING_SOON = [
  { name: "M&A Financials" },
  { name: "Consumer & Inflação" },
  { name: "Pagamentos & Fintech" },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.masthead}>
        <h1 className={styles.wordmark}>IBBA Financial Portal</h1>
        <p className={styles.tagline}>
          Análises e ferramentas sobre o setor financeiro brasileiro. Dados públicos tratados, interação direta.
        </p>
      </section>

      <article className={styles.productCard}>
        <div>
          <h2 className={styles.productTitle}>Ciclo de Crédito</h2>
          <p className={styles.productDesc}>
            Leading, coincident e lagging indicators do crédito bancário brasileiro. Divergências entre camadas destacadas no tempo.
          </p>
          <Link to="/credit-cycle/3-camadas" className={styles.cta}>
            Abrir produto →
          </Link>
        </div>
        <div className={styles.preview} aria-hidden>preview ao vivo (Plano 5)</div>
      </article>

      <section className={styles.tiles} aria-label="Produtos em breve">
        {COMING_SOON.map((p) => (
          <div key={p.name} className={styles.tile}>
            <div className={styles.tileLabel}>Em breve</div>
            <div className={styles.tileName}>{p.name}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
