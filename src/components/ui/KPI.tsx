import styles from "./KPI.module.css";

export interface KPIProps {
  layer: "Leading" | "Coincident" | "Lagging";
  label: string;
  value: number | null;
  unit: string;
  deltaPct6m?: number | null;
}

function formatDelta(d: number): string {
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(2)}pp vs 6m`;
}

export function KPI({ layer, label, value, unit, deltaPct6m }: KPIProps) {
  const deltaClass = deltaPct6m == null ? "" : deltaPct6m > 0 ? styles.deltaUp : styles.deltaDown;
  return (
    <div className={styles.card}>
      <span className={styles.layer}>{layer}</span>
      <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{label}</span>
      <span className={styles.value}>
        {value == null ? "—" : `${value.toFixed(2)} ${unit}`}
      </span>
      {deltaPct6m != null && (
        <span className={`${styles.delta} ${deltaClass}`}>{formatDelta(deltaPct6m)}</span>
      )}
    </div>
  );
}
