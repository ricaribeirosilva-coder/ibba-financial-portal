import styles from "./Chip.module.css";

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.active : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
