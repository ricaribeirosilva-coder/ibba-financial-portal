import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./routes/Home";
import NotFound from "./routes/NotFound";
import CreditCycleLayout from "./routes/CreditCycle/CreditCycleLayout";
import ThreeLayers from "./routes/CreditCycle/curated/ThreeLayers";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/credit-cycle" element={<CreditCycleLayout />}>
          <Route index element={<Navigate to="3-camadas" replace />} />
          <Route path="3-camadas" element={<ThreeLayers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
