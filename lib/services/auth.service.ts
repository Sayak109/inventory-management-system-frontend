import { apiClient } from "../api";

export interface RegisterData {
  businessName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  logo?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: string;
  bankDetails?: any;
  profile?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: "OWNER" | "MANAGER" | "STAFF";
  businessId: string;
  isActive: boolean;
}

export const authService = {
  register: async (data: RegisterData) => {
    return apiClient.post<User>("/auth/register", data);
  },

  login: async (data: LoginData) => {
    return apiClient.post<User>("/auth/login", data);
  },

  logout: async () => {
    return apiClient.post("/auth/logout");
  },

  getMe: async () => {
    return apiClient.get<User>("/auth/me");
  },
};
