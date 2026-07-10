import { ApiPaginatedResponse } from "@/types/apiResponseType";
import type { Buyer, BuyerVehicles } from "@/types/clientType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchBuyers(pageNo: number, pageSize: number, searchQuery?: string): Promise<Buyer[]> {
	const url = new URL(`${API_URL}/buyers/`);
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

export async function fetchBuyerVehicles(pageNo: number, pageSize: number, searchQuery?: string): Promise<BuyerVehicles[]> {
	const url = new URL(`${API_URL}/buyers/vehicles/`);
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

export async function fetchBuyerById(buyer_id: string): Promise<Buyer> {
	const res = await fetch(`${API_URL}/buyers/${buyer_id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	return await res.json();
}

export async function fetchBuyerVehiclesByBuyerID(buyer_id: string): Promise<BuyerVehicles[]> {
	const res = await fetch(`${API_URL}/buyers/vehicles/${buyer_id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	return await res.json();
}

export async function createBuyer(buyer: Buyer, vehicles?: Omit<BuyerVehicles, "vehicle_id">[]): Promise<BuyerListResult> {
	const res = await fetch(`${API_URL}/buyers/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			buyer,
			vehicles,
		}),
	});

	return await res.json();
}

export async function updateBuyer(
	id: string,
	buyer: Partial<Buyer>,
	vehicles: Omit<BuyerVehicles, "vehicle_id">[]
): Promise<{ buyer: Buyer, vehicles?: BuyerVehicles[] }> {
	const res = await fetch(`${API_URL}/buyers/${id}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ buyer, vehicles }),
	});

	return await res.json();
}

export async function deleteBuyer(buyer_id: string) {
	const res = await fetch(`${API_URL}buyers/${buyer_id}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		throw new Error("Failed to delete buyer");
	}

	return true;
}

export async function createBuyerVehicle(data: BuyerVehicles) {
	const res = await fetch(`${API_URL}/buyers/vehicles/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	return await res.json();
}

export async function updateBuyerVehicle(
	data: Partial<BuyerVehicles>
): Promise<BuyerVehicles> {
	const res = await fetch(`${API_URL}/buyers/vehicles/`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	return await res.json();
}

export async function deleteBuyerVehicle(vehicle_id: string) {
	const res = await fetch(`${API_URL}/buyers/vehicles/${vehicle_id}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		throw new Error("Failed to delete buyer vehicle");
	}

	return true;
};

type BuyerListResult = Buyer & {
	plate_no: string;
};

export async function listBuyers(pageNo: number, pageSize: number, searchQuery?: string): Promise<ApiPaginatedResponse<BuyerListResult[]>> {
	const url = new URL(`${API_URL}/buyers/list`);
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