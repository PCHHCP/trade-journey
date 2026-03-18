import { useParams } from "react-router";

export function TradeDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Trade {id}</h1>
    </main>
  );
}
