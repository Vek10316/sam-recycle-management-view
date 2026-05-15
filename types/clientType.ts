//@/app/types/clientType.ts
export interface Buyer {
    buyer_id: string;
    buyer_id_type: "NRIC" | "BRN" | "PASSPORT";
    buyer_name: string;
    buyer_address?: string;
    buyer_phone?: string;
    buyer_email?: string;
    buyer_tin?: string;
};

export interface BuyerVehicles {
    vehicle_id: number;
    buyer_id: string;
    plate_no: string;
}

export interface Supplier {
    supplier_id: string;
    supplier_id_type: "NRIC" | "BRN" | "PASSPORT";
    supplier_name: string;
    supplier_address?: string;
    supplier_phone?: string;
    supplier_email?: string;
    supplier_tin?: string;
};

export interface SupplierVehicles {
    vehicle_id?: number;
    supplier_id: string;
    plate_no: string;
}