import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_SLUG
    ? `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_API_SLUG}`
    : "http://192.168.1.101:5001";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "An error occurred";
    throw new Error(message);
  }

  throw new Error("An unexpected error occurred");
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await axiosClient.get<ApiResponse<T>>(endpoint);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },



  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await axiosClient.post<ApiResponse<T>>(endpoint, body);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await axiosClient.patch<ApiResponse<T>>(endpoint, body);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await axiosClient.delete<ApiResponse<T>>(endpoint);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
