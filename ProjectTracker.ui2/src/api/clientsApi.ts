import { apiClient } from "./client";
import type { Client } from "../types";

export const clientsApi = {
  getAll: () => apiClient.get<Client[]>("/api/clients"),
  getById: (id: number) => apiClient.get<Client>(`/api/clients/${id}`),
  create: (data: { name: string; email?: string | null; address?: string | null }) =>
    apiClient.post<Client>("/api/clients", data),
  update: (id: number, data: { name: string; email?: string | null; address?: string | null }) =>
    apiClient.put<Client>(`/api/clients/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/clients/${id}`),
};
