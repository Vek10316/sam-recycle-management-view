//app/hooks/clients/buyer/useBuyerDetails.ts
import * as service from "@/services/api/clients/buyerService";
import type { Buyer, BuyerVehicles } from "@/types/clientType";
import { useEffect, useState } from "react";

export default function useBuyerDetails(id: number) {
    const [buyer, setBuyer] = useState<Buyer | null>(null);

    const [vehicles, setVehicles] = useState<BuyerVehicles[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const buyerData =
                    await service.fetchBuyerById(id);

                const vehicleData =
                    await service.fetchBuyerVehiclesByBuyerID(
                        id
                    );

                setBuyer(buyerData);
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
        buyer,
        vehicles,
        loading,
        error,
    };
}