import type { Buyer, BuyerVehicles } from "@/types/clientType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchBuyers(): Promise<Buyer[]> {
  const res = await fetch(`${API_URL}/buyers/`);

  if (!res.ok) {
    throw new Error("Failed to fetch buyers");
  }

  return res.json();
}

export async function fetchBuyerVehicles(): Promise<BuyerVehicles[]> {
  const res = await fetch(`${API_URL}/buyers/vehicles/`);

  if (!res.ok) {
    throw new Error("Failed to fetch buyer vehicles");
  }

  return res.json();
}

export async function fetchBuyerById(buyer_id: string): Promise<Buyer> {
  const res = await fetch(`${API_URL}/buyers/${buyer_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch buyer");
  }

  return res.json();
}

export async function fetchBuyerVehiclesByBuyerID(buyer_id: string): Promise<BuyerVehicles[]> {
  const res = await fetch(`${API_URL}/buyers/vehicles/${buyer_id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch buyer");
  }

  return res.json();
}

export async function createBuyer(buyer: Buyer, vehicles?: Omit<BuyerVehicles, "vehicle_id">[]) {
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

  if (!res.ok) {
    throw new Error("Failed to create buyer");
  }

  return res.json();
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

  if (!res.ok) {
    throw new Error("Failed to update buyer");
  }

  return res.json();
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

  if (!res.ok) {
    throw new Error("Failed to create buyer vehicle");
  }

  return res.json();
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

  if (!res.ok) {
    throw new Error("Failed to update buyer vehicle");
  }

  return res.json();
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