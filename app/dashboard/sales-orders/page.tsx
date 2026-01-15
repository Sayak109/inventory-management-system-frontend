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
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  salesOrderService,
  SalesOrder,
  CreateSalesOrderData,
  SalesOrderItem,
} from "@/lib/services/salesOrder.service";
import { productService, Product } from "@/lib/services/product.service";
import { useAuth } from "@/contexts/AuthContext";

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CreateSalesOrderData>({
    items: [],
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<SalesOrder | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<SalesOrder | null>(null);
  const { user } = useAuth();

  const canConfirm = user?.role === "OWNER" || user?.role === "MANAGER";

  useEffect(() => {
    loadOrders();
    loadProducts();
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
      const response = await salesOrderService.getSalesOrders({
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
              (order.customerName &&
                order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (order.customerPhone &&
                order.customerPhone.includes(searchQuery)) ||
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
      setError(err.message || "Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      items: [],
      customerName: "",
      customerPhone: "",
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
          qty: 1,
          sellPrice: 0,
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
    field: keyof SalesOrderItem,
    value: any
  ) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async () => {
    if (formData.items.length === 0) {
      setError("At least one item is required");
      return;
    }
    if (
      formData.items.some(
        (item) => !item.variantId || item.qty <= 0 || item.sellPrice <= 0
      )
    ) {
      setError(
        "All items must have a valid variant, quantity > 0, and sell price > 0"
      );
      return;
    }

    try {
      setError("");
      await salesOrderService.createSalesOrder(formData);
      handleCloseDialog();
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to create sales order");
    }
  };

  const handleConfirmClick = (order: SalesOrder) => {
    setOrderToConfirm(order);
    setConfirmDialogOpen(true);
  };

  const handleConfirmConfirm = async () => {
    if (!orderToConfirm) return;
    try {
      await salesOrderService.confirmSalesOrder(orderToConfirm._id);
      setConfirmDialogOpen(false);
      setOrderToConfirm(null);
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to confirm order");
      setConfirmDialogOpen(false);
      setOrderToConfirm(null);
    }
  };

  const handleConfirmCancel = () => {
    setConfirmDialogOpen(false);
    setOrderToConfirm(null);
  };

  const handleCancelClick = (order: SalesOrder) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    try {
      await salesOrderService.cancelSalesOrder(orderToCancel._id);
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to cancel order");
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  const handleCancelCancel = () => {
    setCancelDialogOpen(false);
    setOrderToCancel(null);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLACED":
        return "info";
      case "CONFIRMED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getAllVariants = () => {
    const allVariants: Array<{
      id: string;
      label: string;
      productName: string;
      sellPrice?: number;
    }> = [];
    products.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          const attrs = Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(", ");
          allVariants.push({
            id: variant._id || "",
            label: `${product.name} - ${variant.sku}${attrs ? ` (${attrs})` : ""}`,
            productName: product.name,
            sellPrice: variant.sellPrice,
          });
        });
      }
    });
    return allVariants;
  };

  const handleVariantSelect = (index: number, variantId: string) => {
    const variant = getAllVariants().find((v) => v.id === variantId);
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      variantId: variantId,
      sellPrice: variant?.sellPrice || newItems[index].sellPrice || 0,
    };
    setFormData({ ...formData, items: newItems });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Sales Orders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Sales Order
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search sales orders..."
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
          Showing {orders.length} of {pagination.total} sales orders
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              {canConfirm && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canConfirm ? 6 : 5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canConfirm ? 6 : 5} align="center">
                  No sales orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id.slice(-8)}</TableCell>
                  <TableCell>
                    {order.customerName || "-"}
                    {order.customerPhone && ` (${order.customerPhone})`}
                  </TableCell>
                  <TableCell>{order.items.length} items</TableCell>
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
                  {canConfirm && (
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        {order.status === "PLACED" && (
                          <Tooltip title="Confirm Order">
                            <IconButton
                              size="small"
                              onClick={() => handleConfirmClick(order)}
                              color="success"
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {order.status !== "CANCELLED" && (
                          <Tooltip title="Cancel Order">
                            <IconButton
                              size="small"
                              onClick={() => handleCancelClick(order)}
                              color="error"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
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
        <DialogTitle>Create Sales Order</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Customer Name"
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Customer Phone"
            value={formData.customerPhone}
            onChange={(e) =>
              setFormData({ ...formData, customerPhone: e.target.value })
            }
            margin="normal"
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
              Click "Add Item" to add items to this sales order
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
                        handleVariantSelect(index, e.target.value)
                      }
                      label="Product Variant"
                      required
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                          },
                        },
                      }}
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
                    label="Quantity"
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "qty",
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
                    label="Sell Price"
                    type="number"
                    value={item.sellPrice}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "sellPrice",
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

      {/* Confirm Order Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to confirm this sales order? This will deduct
            stock from inventory and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmConfirm}
            color="success"
            variant="contained"
            autoFocus
          >
            Confirm Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this sales order? This action cannot
            be undone. If the order was confirmed, stock will be returned to
            inventory.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCancel} color="primary">
            No, Keep Order
          </Button>
          <Button
            onClick={handleCancelConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
