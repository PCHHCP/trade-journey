import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ROUTES } from "@/config/routes";
import { Dashboard } from "@/routes/Dashboard";
import { TradeList } from "@/routes/TradeList";
import { TradeDetail } from "@/routes/TradeDetail";
import { Import } from "@/routes/Import";
import { Analytics } from "@/routes/Analytics";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.TRADES} element={<TradeList />} />
          <Route path={ROUTES.TRADE_DETAIL} element={<TradeDetail />} />
          <Route path={ROUTES.IMPORT} element={<Import />} />
          <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
