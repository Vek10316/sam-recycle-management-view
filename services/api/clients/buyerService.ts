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

export async function fetchBuyerById(id: number): Promise<Buyer> {
	const res = await fetch(`${API_URL}/buyers/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	return await res.json();
}

export async function fetchBuyerVehiclesByBuyerID(id: number): Promise<BuyerVehicles[]> {
	const res = await fetch(`${API_URL}/buyers/vehicles/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	return await res.json();
}

export async function createBuyer(buyer: Omit<Buyer, "id">, vehicles?: Pick<BuyerVehicles, "plate_no">[]): Promise<ListBuyerResult> {
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
	id: number,
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

type ListBuyerResult = Buyer & {
	plate_no: string[];
};

export async function listBuyers(pageNo: number, pageSize: number, searchQuery?: string): Promise<ApiPaginatedResponse<ListBuyerResult[]>> {
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