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
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { userService, User, CreateUserData } from "@/lib/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "STAFF",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user: currentUser } = useAuth();

  const canManage = currentUser?.role === "OWNER" || currentUser?.role === "MANAGER";

  useEffect(() => {
    if (canManage) {
      loadUsers();
    }
  }, [canManage]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setUsers(allUsers);
    } else {
      const filtered = allUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.firstName &&
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.lastName &&
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (user.phone && user.phone.includes(searchQuery)) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      if (response.success) {
        const usersList = response.data.users || [];
        setAllUsers(usersList);
        setUsers(usersList);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "STAFF",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      setError("");
      if (editingUser) {
        const updateData: any = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.updateUser(editingUser._id, updateData);
      } else {
        await userService.createUser(formData);
      }
      handleCloseDialog();
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.deleteUser(id);
      loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "error";
      case "MANAGER":
        return "warning";
      case "STAFF":
        return "info";
      default:
        return "default";
    }
  };

  if (!canManage) {
    return (
      <Box>
        <Alert severity="error">You don't have permission to access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Users</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search users..."
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
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : "-"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Active" : "Inactive"}
                      color={user.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, user)}
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
        <MenuItem
          onClick={() => {
            if (selectedUser) handleOpenDialog(selectedUser);
            handleMenuClose();
          }}
        >
          Edit
        </MenuItem>
        {currentUser?.role === "OWNER" && (
          <MenuItem
            onClick={() => {
              if (selectedUser) handleDelete(selectedUser._id);
              handleMenuClose();
            }}
          >
            Delete
          </MenuItem>
        )}
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
            disabled={!!editingUser}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            required={!editingUser}
            helperText={editingUser ? "Leave empty to keep current password" : ""}
          />
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "OWNER" | "MANAGER" | "STAFF",
                })
              }
              label="Role"
            >
              <MenuItem value="STAFF">STAFF</MenuItem>
              <MenuItem value="MANAGER">MANAGER</MenuItem>
              {currentUser?.role === "OWNER" && (
                <MenuItem value="OWNER">OWNER</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
