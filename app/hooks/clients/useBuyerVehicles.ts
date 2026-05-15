import { useEffect, useState } from "react";
import type { BuyerVehicles } from "../../../services/clients/buyerService";
import {
    createBuyerVehicle,
    deleteBuyerVehicle,
    fetchBuyerVehiclesByBuyerID,
    updateBuyerVehicle,
} from "../../../services/clients/buyerService";

export default function useBuyerVehicles(buyer_id: string) {
  const [vehicles, setVehicles] = useState<BuyerVehicles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!buyer_id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchBuyerVehiclesByBuyerID(buyer_id);
      setVehicles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [buyer_id]);

  const addVehicle = async (data: BuyerVehicles) => {
    await createBuyerVehicle(data);
    await load();
  };

  const editVehicle = async (id: number, data: Partial<BuyerVehicles>) => {
    await updateBuyerVehicle(id as any, data);
    await load();
  };

  const removeVehicle = async (id: number) => {
    await deleteBuyerVehicle(id as any);
    setVehicles((prev) => prev.filter(v => v.vehicle_id !== id));
  };

  return {
    vehicles,
    loading,
    error,
    refetch: load,
    addVehicle,
    editVehicle,
    removeVehicle,
  };
}