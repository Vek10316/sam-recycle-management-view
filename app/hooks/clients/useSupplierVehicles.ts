import type { SupplierVehicles } from "@/types/clientType";
import { useEffect, useState } from "react";
import {
    createSupplierVehicle,
    deleteSupplierVehicle,
    fetchSupplierVehiclesBySupplierID,
    updateSupplierVehicle,
} from "../../../services/clients/supplierService";

export default function useSupplierVehicles(supplier_id: string) {
  const [vehicles, setVehicles] = useState<SupplierVehicles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!supplier_id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchSupplierVehiclesBySupplierID(supplier_id);
      setVehicles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [supplier_id]);

  const addVehicle = async (data: SupplierVehicles) => {
    await createSupplierVehicle(data);
    await load();
  };

  const editVehicle = async (id: number, data: Partial<SupplierVehicles>) => {
    await updateSupplierVehicle(id as any, data);
    await load();
  };

  const removeVehicle = async (id: number) => {
    await deleteSupplierVehicle(id as any);
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