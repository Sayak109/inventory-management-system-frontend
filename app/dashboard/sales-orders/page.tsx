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
  Menu,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {
  salesOrderService,
  SalesOrder,
  CreateSalesOrderData,
} from "@/lib/services/salesOrder.service";
import { useAuth } from "@/contexts/AuthContext";

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [allOrders, setAllOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CreateSalesOrderData>({
    items: [],
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const { user } = useAuth();

  const canConfirm = user?.role === "OWNER" || user?.role === "MANAGER";

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setOrders(allOrders);
    } else {
      const filtered = allOrders.filter(
        (order) =>
          order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.customerName &&
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (order.customerPhone &&
            order.customerPhone.includes(searchQuery)) ||
          order.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setOrders(filtered);
    }
  }, [searchQuery, allOrders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await salesOrderService.getSalesOrders();
      if (response.success) {
        const ordersList = response.data.salesOrders || [];
        setAllOrders(ordersList);
        setOrders(ordersList);
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

  const handleSubmit = async () => {
    try {
      setError("");
      await salesOrderService.createSalesOrder(formData);
      handleCloseDialog();
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to create sales order");
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: SalesOrder) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleConfirm = async () => {
    if (!selectedOrder) return;
    try {
      await salesOrderService.confirmSalesOrder(selectedOrder._id);
      handleMenuClose();
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to confirm order");
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    try {
      await salesOrderService.cancelSalesOrder(selectedOrder._id);
      handleMenuClose();
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to cancel order");
    }
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
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery("")}
                >
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
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
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, order)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {canConfirm && selectedOrder?.status === "PLACED" && (
          <MenuItem onClick={handleConfirm}>Confirm Order</MenuItem>
        )}
        {canConfirm && selectedOrder?.status !== "CANCELLED" && (
          <MenuItem onClick={handleCancel}>Cancel Order</MenuItem>
        )}
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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
          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Note: Items management will be added in a future update. For now, you
            can create orders with empty items array.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
