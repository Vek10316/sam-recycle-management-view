import type { Buyer, BuyerVehicles } from "@/types/clientType";

export async function fetchBuyers(): Promise<Buyer[]> {
  const res = await fetch("/buyers/");

  if (!res.ok) {
    throw new Error("Failed to fetch buyers");
  }

  return res.json();
}

export async function fetchBuyerVehicles(): Promise<BuyerVehicles[]> {
  const res = await fetch("/buyers/vehicles/");

  if (!res.ok) {
    throw new Error("Failed to fetch buyer vehicles");
  }

  return res.json();
}

export async function fetchBuyerById(buyer_id: string): Promise<Buyer> {
  const res = await fetch(`/buyers/`, {
    method: "GET",
    headers: {
      "Content-Type" : "application/json",
    },
    body: JSON.stringify({
      buyer_id: buyer_id
    })
  });

  if (!res.ok) {
    throw new Error("Failed to fetch buyer");
  }

  return res.json();
}

export async function fetchBuyerVehiclesByBuyerID(buyer_id: string): Promise<BuyerVehicles[]> {
  const res = await fetch(`/buyers/vehicles/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      buyer_id
    })
  });

  if (!res.ok) {
    throw new Error("Failed to fetch buyer");
  }

  return res.json();
}

export async function createBuyer(data: Buyer): Promise<Buyer> {
  const res = await fetch("/buyers/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create buyer");
  }

  return res.json();
}

export async function updateBuyer(
  id: string,
  data: Partial<Buyer>
): Promise<Buyer> {
  const res = await fetch(`/buyers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update buyer");
  }

  return res.json();
}

export async function deleteBuyer(buyer_id: string): Promise<boolean> {
  const res = await fetch(`/buyers/${buyer_id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete buyer");
  }

  return true;
}

export async function createBuyerVehicle(data: BuyerVehicles): Promise<BuyerVehicles> {
  const res = await fetch("/buyers/vehicles/", {
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
  vehicle_id: string,
  data: Partial<BuyerVehicles>
): Promise<BuyerVehicles> {
  const res = await fetch(`/buyers/vehicles/${vehicle_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update buyer");
  }

  return res.json();
}

export async function deleteBuyerVehicle(vehicle_id: string): Promise<boolean> {
  const res = await fetch(`/buyers/vehicles/${vehicle_id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete buyer");
  }

  return true;
}