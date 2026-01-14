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
  purchaseOrderService,
  PurchaseOrder,
  CreatePurchaseOrderData,
} from "@/lib/services/purchaseOrder.service";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [allOrders, setAllOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    supplierId: "",
    items: [],
    notes: "",
    status: "DRAFT",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );

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
          order.supplierId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setOrders(filtered);
    }
  }, [searchQuery, allOrders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getPurchaseOrders();
      if (response.success) {
        const ordersList = response.data.purchaseOrders || [];
        setAllOrders(ordersList);
        setOrders(ordersList);
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
      status: "DRAFT",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      setError("");
      await purchaseOrderService.createPurchaseOrder(formData);
      handleCloseDialog();
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to create purchase order");
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    order: PurchaseOrder
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (
    status: "DRAFT" | "SENT" | "CONFIRMED" | "RECEIVED"
  ) => {
    if (!selectedOrder) return;
    try {
      await purchaseOrderService.updatePOStatus({
        poId: selectedOrder._id,
        status,
      });
      handleMenuClose();
      loadOrders();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
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

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Purchase Orders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Purchase Order
        </Button>
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
              <TableCell>Supplier</TableCell>
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
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id.slice(-8)}</TableCell>
                  <TableCell>{order.supplierId}</TableCell>
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusUpdate("SENT")}>
          Mark as Sent
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate("CONFIRMED")}>
          Mark as Confirmed
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate("RECEIVED")}>
          Mark as Received
        </MenuItem>
      </Menu>

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
          />
          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Note: Items management will be added in a future update. For now,
            you can create orders with empty items array.
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
