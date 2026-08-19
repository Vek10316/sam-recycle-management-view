//app/hooks/clients/buyer/useBuyerDetails.ts
import * as service from "@/services/api/clients/buyerService";
import type { Buyer, BuyerVehicles } from "@/types/clientType";
import { useEffect, useState } from "react";

export default function useBuyerDetails(buyer_id: string) {
    const [buyer, setBuyer] = useState<Buyer | null>(null);

    const [vehicles, setVehicles] = useState<BuyerVehicles[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const buyerData =
                    await service.fetchBuyerById(buyer_id);

                const vehicleData =
                    await service.fetchBuyerVehiclesByBuyerID(
                        buyer_id
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
    }, [buyer_id]);

    return {
        buyer,
        vehicles,
        loading,
        error,
    };
}