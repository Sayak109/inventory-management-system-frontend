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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Menu,
  MenuItem,
  InputAdornment,
  Grid,
  IconButton as MuiIconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {
  productService,
  Product,
  CreateProductData,
  ProductVariant,
} from "@/lib/services/product.service";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoriesInput, setCategoriesInput] = useState("");
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    description: "",
    categories: [],
    status: "ACTIVE",
    variants: [],
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { user } = useAuth();

  const canEdit = user?.role === "OWNER" || user?.role === "MANAGER";

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        search: searchQuery || undefined,
      });
      if (response.success) {
        setProducts(response.data.Products || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        categories: product.categories || [],
        status: product.status,
        variants: product.variants || [],
      });
      setCategoriesInput((product.categories || []).join(", "));
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        categories: [],
        status: "ACTIVE",
        variants: [],
      });
      setCategoriesInput("");
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setCategoriesInput("");
  };

  const handleSubmit = async () => {
    try {
      setError("");
      // Parse categories from input
      const categories = categoriesInput
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const submitData = {
        ...formData,
        categories,
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, submitData);
      } else {
        await productService.createProduct(submitData);
      }
      handleCloseDialog();
      loadProducts();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.deleteProduct(id);
      loadProducts();
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    product: Product
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...(formData.variants || []),
        {
          sku: "",
          mrp: 0,
          sellPrice: 0,
          costPrice: 0,
          lowStockThreshold: 5,
          status: "ACTIVE",
        },
      ],
    });
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "error";
      case "DRAFT":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
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
                <MuiIconButton
                  size="small"
                  onClick={() => setSearchQuery("")}
                >
                  <CloseIcon />
                </MuiIconButton>
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
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Variants</TableCell>
              <TableCell>Status</TableCell>
              {canEdit && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 6 : 5} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description || "-"}</TableCell>
                  <TableCell>
                    {product.categories && product.categories.length > 0
                      ? product.categories.join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {product.variants && product.variants.length > 0
                      ? `${product.variants.length} variant(s)`
                      : "No variants"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.status}
                      color={getStatusColor(product.status) as any}
                      size="small"
                    />
                  </TableCell>
                  {canEdit && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, product)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  )}
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
        <MenuItem
          onClick={() => {
            if (selectedProduct) handleOpenDialog(selectedProduct);
            handleMenuClose();
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedProduct) handleDelete(selectedProduct._id);
            handleMenuClose();
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Add Product"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Categories (comma separated)"
            value={categoriesInput}
            onChange={(e) => setCategoriesInput(e.target.value)}
            margin="normal"
            helperText="Separate multiple categories with commas. You can include spaces in category names."
            placeholder="e.g., mens wear, top wear, shirt"
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "ACTIVE" | "INACTIVE" | "DRAFT",
              })
            }
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="DRAFT">DRAFT</option>
          </TextField>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Variants</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddVariant}
            >
              Add Variant
            </Button>
          </Box>

          {formData.variants && formData.variants.length > 0 && (
            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
              {formData.variants.map((variant, index) => (
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
                    <Typography variant="subtitle2">
                      Variant {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SKU"
                        value={variant.sku}
                        onChange={(e) =>
                          handleVariantChange(index, "sku", e.target.value)
                        }
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="MRP"
                        type="number"
                        value={variant.mrp}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "mrp",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Sell Price"
                        type="number"
                        value={variant.sellPrice || ""}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "sellPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Cost Price"
                        type="number"
                        value={variant.costPrice || ""}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "costPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Low Stock Threshold"
                        type="number"
                        value={variant.lowStockThreshold || 5}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "lowStockThreshold",
                            parseInt(e.target.value) || 5
                          )
                        }
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
