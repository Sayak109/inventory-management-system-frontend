import { apiClient } from "../api";

export interface SalesOrderItem {
  variantId: string;
  qty: number;
  sellPrice: number;
}

export interface SalesOrder {
  _id: string;
  businessId: string;
  status: "PLACED" | "CONFIRMED" | "CANCELLED";
  items: SalesOrderItem[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesOrderData {
  items: SalesOrderItem[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface SalesOrderListResponse {
  data: SalesOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const salesOrderService = {
  getSalesOrders: async (query?: {
    page?: number;
    limit?: number;
    status?: string;
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
    return apiClient.get<SalesOrderListResponse>(`/sales-order${queryString}`);
  },

  getSalesOrderById: async (id: string) => {
    return apiClient.get<SalesOrder>(`/sales-order/${id}`);
  },

  createSalesOrder: async (data: CreateSalesOrderData) => {
    return apiClient.post<SalesOrder>("/sales-order", data);
  },

  confirmSalesOrder: async (id: string) => {
    return apiClient.post<SalesOrder>(`/sales-order/${id}/confirm`);
  },

  cancelSalesOrder: async (id: string) => {
    return apiClient.post<SalesOrder>(`/sales-order/${id}/cancel`);
  },
};
