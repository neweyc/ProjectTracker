import { apiClient } from "./client";

export interface TeamMember {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface AddUserInput {
  email: string;
  displayName: string;
  password?: string;
}

export const usersApi = {
  getAll: () => apiClient.get<TeamMember[]>("/api/settings/users"),
  add: (data: AddUserInput) => apiClient.post<TeamMember>("/api/settings/users", data),
};
