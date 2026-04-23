import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

type Item = { label: string; to?: string; disabled?: boolean };

const SECTIONS: { label: string; items: Item[] }[] = [
  {
    label: "Análises",
    items: [
      { label: "3 camadas", to: "/credit-cycle/3-camadas" },
      { label: "Juros vs Amortização", disabled: true },
      { label: "Concessões PF/PJ", disabled: true },
      { label: "Ciclos históricos", disabled: true },
    ],
  },
  {
    label: "Lab",
    items: [
      { label: "Explorador", disabled: true },
      { label: "Correlação & Lag", disabled: true },
      { label: "Comparador", disabled: true },
      { label: "Simulador", disabled: true },
    ],
  },
  {
    label: "Dados",
    items: [{ label: "Séries & export", disabled: true }],
  },
];

export default function Sidebar() {
  return (
    <aside className={styles.aside}>
      {SECTIONS.map((s) => (
        <div key={s.label} className={styles.section}>
          <div className={styles.sectionLabel}>{s.label}</div>
          {s.items.map((it) =>
            it.disabled || !it.to ? (
              <span key={it.label} className={`${styles.item} ${styles.disabled}`} title="Em breve">
                {it.label}
              </span>
            ) : (
              <NavLink
                key={it.label}
                to={it.to}
                className={({ isActive }) =>
                  isActive ? `${styles.item} ${styles.itemActive}` : styles.item
                }
              >
                {it.label}
              </NavLink>
            )
          )}
        </div>
      ))}
    </aside>
  );
}
