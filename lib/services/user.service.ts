import { apiClient } from "../api";
import { User } from "./auth.service";

export interface CreateUserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  profile?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  isActive?: boolean;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export const userService = {
  getUsers: async (query?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) => {
    const queryString = query
      ? `?${new URLSearchParams(
          Object.entries(query).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString()}`
      : "";
    return apiClient.get<UserListResponse>(`/user${queryString}`);
  },

  getUserById: async (id: string) => {
    return apiClient.get<User>(`/user/${id}`);
  },

  createUser: async (data: CreateUserData) => {
    return apiClient.post<User>("/user", data);
  },

  updateUser: async (id: string, data: UpdateUserData) => {
    return apiClient.patch<User>(`/user/${id}`, data);
  },

  deleteUser: async (id: string) => {
    return apiClient.delete(`/user/${id}`);
  },
};
