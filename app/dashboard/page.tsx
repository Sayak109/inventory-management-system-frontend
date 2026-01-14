"use client";

import { Typography, Box, Paper, Grid } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <InventoryIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h6">Products</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your inventory
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <ShoppingCartIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h6">Purchase Orders</Typography>
            <Typography variant="body2" color="text.secondary">
              Track incoming orders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <ReceiptIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h6">Sales Orders</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage sales
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
