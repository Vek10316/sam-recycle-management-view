//app/hooks/clients/supplier/useSupplierDetails.ts
import * as service from "@/services/clients/supplierService";
import type { Supplier, SupplierVehicles } from "@/types/clientType";
import { useEffect, useState } from "react";

export default function useSupplierDetails(supplier_id: string) {
    const [supplier, setSupplier] = useState<Supplier | null>(null);

    const [vehicles, setVehicles] = useState<SupplierVehicles[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const supplierData =
                    await service.fetchSupplierById(supplier_id);

                const vehicleData =
                    await service.fetchSupplierVehiclesBySupplierID(
                        supplier_id
                    );

                setSupplier(supplierData);
                setVehicles(vehicleData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [supplier_id]);

    return {
        supplier,
        vehicles,
        loading,
        error,
    };
}