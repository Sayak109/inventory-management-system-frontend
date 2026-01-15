"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  InputAdornment,
  Tooltip,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import {
  purchaseOrderService,
  PurchaseOrder,
  CreatePurchaseOrderData,
  PurchaseOrderItem,
} from "@/lib/services/purchaseOrder.service";
import { productService, Product } from "@/lib/services/product.service";
import { useAuth } from "@/contexts/AuthContext";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    supplierId: "",
    items: [],
    notes: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<PurchaseOrder | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState<"SENT" | "CONFIRMED" | "RECEIVED" | null>(null);
  const { user } = useAuth();

  const canEdit = user?.role === "OWNER" || user?.role === "MANAGER";

  useEffect(() => {
    loadOrders();
    if (canEdit) {
      loadProducts();
    }
  }, [pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadOrders();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 });
      if (response.success) {
        setProducts(response.data.Products || []);
      }
    } catch (err: any) {
      console.error("Failed to load products:", err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getPurchaseOrders({
        page: pagination.page,
        limit: pagination.limit,
        status: searchQuery ? undefined : undefined,
      });
      if (response.success) {
        let ordersList = response.data.data || [];
        // Client-side search filtering
        if (searchQuery) {
          ordersList = ordersList.filter(
            (order) =>
              order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              order.supplierId.toLowerCase().includes(searchQuery.toLowerCase()) ||
              order.status.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setOrders(ordersList);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination?.total || 0,
        }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      supplierId: "",
      items: [],
      notes: "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          variantId: "",
          orderedQty: 1,
          costPrice: 0,
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: any
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async () => {
    if (!formData.supplierId) {
      setError("Supplier ID is required");
      return;
    }
    if (formData.items.length === 0) {
      setError("At least one item is required");
      return;
    }
    if (formData.items.some((item) => !item.variantId || item.orderedQty <= 0 || item.costPrice <= 0)) {
      setError("All items must have a valid variant, quantity > 0, and cost price > 0");
      return;
    }

    try {
      setError("");
      await purchaseOrderService.createPurchaseOrder(formData);
      handleCloseDialog();
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to create purchase order");
    }
  };

  const handleStatusUpdateClick = (order: PurchaseOrder, status: "SENT" | "CONFIRMED" | "RECEIVED") => {
    setOrderToUpdate(order);
    setStatusToUpdate(status);
    setStatusUpdateDialogOpen(true);
  };

  const handleStatusUpdateConfirm = async () => {
    if (!orderToUpdate || !statusToUpdate) return;
    try {
      if (statusToUpdate === "RECEIVED") {
        // For RECEIVED status, use the updatePOStatus which now handles automatic receiving
        await purchaseOrderService.updatePOStatus(orderToUpdate._id, statusToUpdate);
      } else {
        await purchaseOrderService.updatePOStatus(orderToUpdate._id, statusToUpdate);
      }
      setStatusUpdateDialogOpen(false);
      setOrderToUpdate(null);
      setStatusToUpdate(null);
      loadOrders();
      // Reload products to update stock
      if (statusToUpdate === "RECEIVED") {
        loadProducts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
      setStatusUpdateDialogOpen(false);
      setOrderToUpdate(null);
      setStatusToUpdate(null);
    }
  };

  const handleStatusUpdateCancel = () => {
    setStatusUpdateDialogOpen(false);
    setOrderToUpdate(null);
    setStatusToUpdate(null);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "SENT":
        return "info";
      case "CONFIRMED":
        return "warning";
      case "RECEIVED":
        return "success";
      default:
        return "default";
    }
  };

  const getAllVariants = () => {
    const allVariants: Array<{ id: string; label: string; productName: string }> = [];
    products.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          const attrs = Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(", ");
          allVariants.push({
            id: variant._id || "",
            label: `${product.name} - ${variant.sku}${attrs ? ` (${attrs})` : ""}`,
            productName: product.name,
          });
        });
      }
    });
    return allVariants;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Purchase Orders</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Create Purchase Order
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search purchase orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {orders.length} of {pagination.total} purchase orders
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Order Quantity</TableCell>
              <TableCell>Received Quantity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              {canEdit && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} align="center">
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const totalOrderedQty = order.items.reduce((sum, item) => sum + item.orderedQty, 0);
                const totalReceivedQty = order.items.reduce((sum, item) => sum + (item.receivedQty || 0), 0);
                return (
                <TableRow key={order._id}>
                  <TableCell>{order._id.slice(-8)}</TableCell>
                  <TableCell>{order.supplierId}</TableCell>
                  <TableCell>{totalOrderedQty}</TableCell>
                  <TableCell>{totalReceivedQty}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        {order.status === "DRAFT" && (
                          <Tooltip title="Mark as Sent">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusUpdateClick(order, "SENT")}
                              color="primary"
                            >
                              <LocalShippingIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {order.status === "SENT" && (
                          <Tooltip title="Mark as Confirmed">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleStatusUpdateClick(order, "CONFIRMED")
                              }
                              color="secondary"
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(order.status === "CONFIRMED" || order.status === "SENT") && (
                          <Tooltip title="Mark as Received (Add to Stock)">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleStatusUpdateClick(order, "RECEIVED")
                              }
                              color="success"
                            >
                              <AssignmentTurnedInIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{ display: "flex", justifyContent: "flex-end", mt: 2, mb: 4 }}
      >
        <Pagination
          count={Math.ceil(pagination.total / pagination.limit)}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
          disabled={loading}
        />
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Purchase Order</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Supplier ID"
            value={formData.supplierId}
            onChange={(e) =>
              setFormData({ ...formData, supplierId: e.target.value })
            }
            margin="normal"
            required
            helperText="Enter the supplier ID"
          />

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
          >
            <Typography variant="h6">Items</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </Box>

          {formData.items.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Click "Add Item" to add items to this purchase order
            </Alert>
          )}

          {formData.items.map((item, index) => (
            <Paper
              key={index}
              sx={{ p: 2, mb: 2, position: "relative" }}
              variant="outlined"
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2">Item {index + 1}</Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveItem(index)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Product Variant</InputLabel>
                    <Select
                      value={item.variantId || ""}
                      onChange={(e) =>
                        handleItemChange(index, "variantId", e.target.value)
                      }
                      label="Product Variant"
                      required
                    >
                      {getAllVariants().map((variant) => (
                        <MenuItem key={variant.id} value={variant.id}>
                          {variant.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ordered Quantity"
                    type="number"
                    value={item.orderedQty}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "orderedQty",
                        parseInt(e.target.value) || 1
                      )
                    }
                    required
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cost Price"
                    type="number"
                    value={item.costPrice}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "costPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    required
                    size="small"
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Confirmation Dialog */}
      <Dialog
        open={statusUpdateDialogOpen}
        onClose={handleStatusUpdateCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Status Update</DialogTitle>
        <DialogContent>
          <Typography>
            {statusToUpdate === "RECEIVED" ? (
              <>
                Are you sure you want to mark this purchase order as{" "}
                <strong>RECEIVED</strong>? This will automatically:
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>Mark all items as received (receivedQty = orderedQty)</li>
                  <li>Add all items to inventory stock</li>
                  <li>Update the purchase order status to RECEIVED</li>
                </ul>
                This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to mark this purchase order as{" "}
                <strong>{statusToUpdate}</strong>? This action cannot be undone.
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusUpdateCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdateConfirm}
            color="primary"
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
