import type { Supplier, SupplierVehicles } from "@/types/clientType";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchSuppliers() {
  const res = await fetch(`${API_URL}/suppliers/`);

  if (!res.ok) {
    throw new Error("Failed to fetch suppliers");
  }

  return res.json();
}

export async function fetchSupplierVehicles() {
  const res = await fetch(`${API_URL}/suppliers/vehicles/`);

  if (!res.ok) {
    throw new Error("Failed to fetch supplier vehicles");
  }

  return res.json();
}

export async function fetchSupplierById(supplier_id: string): Promise<Supplier> {
  const res = await fetch(`${API_URL}/suppliers/`, {
    method: "GET",
    headers: {
      "Content-Type" : "application/json",
    },
    body: JSON.stringify({
      supplier_id: supplier_id
    })
  });

  if (!res.ok) {
    throw new Error("Failed to fetch supplier");
  }

  return res.json();
}

export async function fetchSupplierVehiclesBySupplierID(supplier_id: string) {
  const res = await fetch(`${API_URL}/suppliers/vehicles/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      supplier_id
    })
  });

  if (!res.ok) {
    throw new Error("Failed to fetch supplier");
  }

  return res.json();
}

export async function createSupplier(data: Supplier) {
  const res = await fetch(`${API_URL}/suppliers/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create supplier");
  }

  return res.json();
}

export async function updateSupplier(
  id: string,
  data: Partial<Supplier>
): Promise<Supplier> {
  const res = await fetch(`${API_URL}/suppliers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update supplier");
  }

  return res.json();
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

  if (!res.ok) {
    throw new Error("Failed to create supplier vehicle");
  }

  return res.json();
}

export async function updateSupplierVehicle(
  vehicle_id: string,
  data: Partial<SupplierVehicles>
): Promise<SupplierVehicles> {
  const res = await fetch(`${API_URL}/suppliers/vehicles/${vehicle_id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update supplier vehicle");
  }

  return res.json();
}

export async function deleteSupplierVehicle(vehicle_id: string) {
  const res = await fetch(`${API_URL}/suppliers/vehicles/${vehicle_id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete supplier vehicle");
  }

  return true;
}