import { apiClient } from "../api";

export interface ProductVariant {
  _id?: string;
  sku: string;
  attributes?: Record<string, string>;
  mrp: number;
  sellPrice?: number;
  costPrice?: number;
  lowStockThreshold?: number;
  status?: "ACTIVE" | "INACTIVE";
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  categories?: string[];
  images?: string[];
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  businessId: string;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

export interface CreateProductData {
  name: string;
  description?: string;
  categories?: string[];
  images?: string[];
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
  variants?: ProductVariant[];
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductListResponse {
  Products: Product[];
  Total: number;
}

export const productService = {
  getProducts: async (query?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }) => {
    const queryString = query
      ? `?${new URLSearchParams(
          Object.entries(query).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString()}`
      : "";
    return apiClient.get<ProductListResponse>(`/product${queryString}`);
  },

  getProductById: async (id: string) => {
    return apiClient.get<Product>(`/product/${id}`);
  },

  createProduct: async (data: CreateProductData) => {
    return apiClient.post<Product>("/product", data);
  },

  updateProduct: async (id: string, data: UpdateProductData) => {
    return apiClient.patch<Product>(`/product/${id}`, data);
  },

  updateProductStatus: async (id: string, status: "ACTIVE" | "INACTIVE" | "DRAFT") => {
    return apiClient.patch<Product>(`/product/${id}/status`, { status });
  },

  deleteProduct: async (id: string) => {
    return apiClient.delete(`/product/${id}`);
  },
};
