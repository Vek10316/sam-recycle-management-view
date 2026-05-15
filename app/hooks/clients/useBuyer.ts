import { useEffect, useState } from "react";
import type {
    Buyer
} from "../../../services/clients/buyerService";
import {
    createBuyer,
    deleteBuyer,
    fetchBuyers,
    updateBuyer,
} from "../../../services/clients/buyerService";

export default function useBuyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchBuyers();
      setBuyers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 🔹 mutations
  const addBuyer = async (data: Buyer) => {
    await createBuyer(data);
    await load(); // simple but reliable
  };

  const editBuyer = async (id: string, data: Partial<Buyer>) => {
    await updateBuyer(id, data);
    await load();
  };

  const removeBuyer = async (id: string) => {
    await deleteBuyer(id);
    setBuyers((prev) => prev.filter(s => s.buyer_id !== id));
  };

  return {
    buyers,
    loading,
    error,
    refetch: load,
    addBuyer,
    editBuyer,
    removeBuyer,
  };
}