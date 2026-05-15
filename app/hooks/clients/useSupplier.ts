//@/app/hooks/clients/useSupplier.ts
import * as service from "@/services/clients/supplierService";
import type { Supplier } from "@/types/clientType";
import { useCallback, useEffect, useState } from "react";

export default function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await service.fetchSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 🔹 mutations (consistent: always reload)

  const addSupplier = async (data: Supplier) => {
    try {
      await service.createSupplier(data);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const editSupplier = async (id: string, data: Partial<Supplier>) => {
    try {
      await service.updateSupplier(id, data);
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to update supplier");
    }
  };

  const removeSupplier = async (id: string) => {
    try {
      await service.deleteSupplier(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const fetchSupplierById = async (id: string) => {
    try {
      const res = await service.fetchSupplierById(id);
      return res;
    } catch (err: any) {
      setError(err.toString());
    }
  }

  return {
    suppliers,
    loading,
    error,
    refetch: load,
    addSupplier,
    editSupplier,
    removeSupplier,
    fetchSupplierById,
  };
}