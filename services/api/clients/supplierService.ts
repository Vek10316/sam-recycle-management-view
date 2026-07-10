import { ApiPaginatedResponse } from "@/types/apiResponseType";
import type { Supplier, SupplierVehicles } from "@/types/clientType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchSuppliers(pageNo: number, pageSize: number, searchQuery?: string): Promise<Supplier[]> {
	const url = new URL(`${API_URL}/suppliers/`);
	url.searchParams.append("pageNo", pageNo.toString());
	url.searchParams.append("pageSize", pageSize.toString());
	if (searchQuery) {
		url.searchParams.append("search", searchQuery);
	}
	const res = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	return await res.json();
}

export async function fetchSupplierVehicles(pageNo: number, pageSize: number, searchQuery?: string): Promise<SupplierVehicles[]> {
	const url = new URL(`${API_URL}/suppliers/vehicles/`);
	url.searchParams.append("pageNo", pageNo.toString());
	url.searchParams.append("pageSize", pageSize.toString());
	if (searchQuery) {
		url.searchParams.append("search", searchQuery);
	}
	const res = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	return await res.json();
}

export async function fetchSupplierById(supplier_id: string): Promise<Supplier> {
	const res = await fetch(`${API_URL}/suppliers/${supplier_id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	return await res.json();
}

export async function fetchSupplierVehiclesBySupplierID(supplier_id: string): Promise<SupplierVehicles[]> {
	const res = await fetch(`${API_URL}/suppliers/vehicles/${supplier_id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	return await res.json();
}

export async function createSupplier(supplier: Supplier, vehicles?: Omit<SupplierVehicles, "vehicle_id">[]): Promise<SupplierListResult> {
	const res = await fetch(`${API_URL}/suppliers/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			supplier,
			vehicles,
		}),
	});

	return await res.json();
}

export async function updateSupplier(
	id: string,
	supplier: Partial<Supplier>,
	vehicles: Omit<SupplierVehicles, "vehicle_id">[]
): Promise<{ supplier: Supplier, vehicles?: SupplierVehicles[] }> {
	const res = await fetch(`${API_URL}/suppliers/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ supplier, vehicles }),
	});

	return await res.json();
}

export async function deleteSupplier(supplier_id: string) {
	const res = await fetch(`${API_URL}suppliers/${supplier_id}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		throw new Error("Failed to delete supplier");
	}

	return true;
}

export async function createSupplierVehicle(data: SupplierVehicles) {
	const res = await fetch(`${API_URL}/suppliers/vehicles/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	return await res.json();
}

export async function updateSupplierVehicle(
	data: Partial<SupplierVehicles>
): Promise<SupplierVehicles> {
	const res = await fetch(`${API_URL}/suppliers/vehicles/`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	return await res.json();
}

export async function deleteSupplierVehicle(vehicle_id: string) {
	const res = await fetch(`${API_URL}/suppliers/vehicles/${vehicle_id}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		throw new Error("Failed to delete supplier vehicle");
	}

	return true;
};

type SupplierListResult = Supplier & {
	plate_no: string;
};

export async function listSuppliers(pageNo: number, pageSize: number, searchQuery?: string): Promise<ApiPaginatedResponse<SupplierListResult[]>> {
	const url = new URL(`${API_URL}/suppliers/list`);
	url.searchParams.append("pageNo", pageNo.toString());
	url.searchParams.append("pageSize", pageSize.toString());
	if (searchQuery !== undefined && searchQuery?.trim() !== "") {
		url.searchParams.append("search", searchQuery);
	}
	const res = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	});
	return await res.json();
}