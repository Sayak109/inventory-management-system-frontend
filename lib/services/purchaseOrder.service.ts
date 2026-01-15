import { apiClient } from "../api";

export interface PurchaseOrderItem {
  variantId: string;
  orderedQty: number;
  receivedQty?: number;
  costPrice: number;
}

export interface PurchaseOrder {
  _id: string;
  businessId: string;
  supplierId: string;
  status: "DRAFT" | "SENT" | "CONFIRMED" | "RECEIVED";
  items: PurchaseOrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  items: PurchaseOrderItem[];
  notes?: string;
  status?: "DRAFT" | "SENT" | "CONFIRMED" | "RECEIVED";
}

export interface UpdatePOStatusData {
  poId: string;
  status: "DRAFT" | "SENT" | "CONFIRMED" | "RECEIVED";
}

export interface ReceivePOData {
  poId: string;
  receivedItems: Array<{
    variantId: string;
    receivedQty: number;
    costPrice: number;
  }>;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const purchaseOrderService = {
  getPurchaseOrders: async (query?: {
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
    return apiClient.get<PurchaseOrderListResponse>(`/purchase-order${queryString}`);
  },

  getPurchaseOrderById: async (id: string) => {
    return apiClient.get<PurchaseOrder>(`/purchase-order/${id}`);
  },

  createPurchaseOrder: async (data: CreatePurchaseOrderData) => {
    return apiClient.post<PurchaseOrder>("/purchase-order", data);
  },

  updatePOStatus: async (id: string, status: "SENT" | "CONFIRMED") => {
    return apiClient.patch<PurchaseOrder>(`/purchase-order/${id}/status`, {
      poId: id,
      status: status,
    });
  },

  receivePO: async (data: ReceivePOData) => {
    return apiClient.patch<PurchaseOrder>(`/purchase-order/${data.poId}/receive`, data);
  },
};
