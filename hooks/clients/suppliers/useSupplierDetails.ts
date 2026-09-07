//app/hooks/clients/supplier/useSupplierDetails.ts
import * as service from "@/services/api/clients/supplierService";
import type { Supplier, SupplierVehicles } from "@/types/clientType";
import { useEffect, useState } from "react";

export default function useSupplierDetails(id: number) {
    const [supplier, setSupplier] = useState<Supplier | null>(null);

    const [vehicles, setVehicles] = useState<SupplierVehicles[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const supplierData =
                    await service.fetchSupplierById(id);

                const vehicleData =
                    await service.fetchSupplierVehiclesBySupplierID(
                        id
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
    }, [id]);

    return {
        supplier,
        vehicles,
        loading,
        error,
    };
}