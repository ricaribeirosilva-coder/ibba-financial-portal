import { Outlet } from "react-router-dom";
export default function CreditCycleLayout() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Credit Cycle</h1>
      <Outlet />
    </main>
  );
}
