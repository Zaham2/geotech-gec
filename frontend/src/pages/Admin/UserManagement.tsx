import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { userService } from '@/services/userService';
import { User } from '@/types';
import { format } from 'date-fns';

const UserManagement: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pending, all] = await Promise.all([
        userService.getPendingUsers(),
        userService.getAllUsers(),
      ]);
      setPendingUsers(pending);
      setAllUsers(all);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await userService.approveUser(userId);
      await fetchData();
    } catch (err) {
      setError('Failed to approve user');
      console.error('Error approving user:', err);
    }
  };

  const handleDeauthorize = async (userId: string) => {
    try {
      await userService.deauthorizeUser(userId);
      await fetchData();
    } catch (err) {
      setError('Failed to deauthorize user');
      console.error('Error deauthorizing user:', err);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.deleteUser(selectedUser.id);
      await fetchData();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Pending Users" />
          <Tab label="All Users" />
        </Tabs>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(activeTab === 0 ? pendingUsers : allUsers).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Avatar>
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </Avatar>
                      </Grid>
                      <Grid item>
                        {user.firstName} {user.lastName}
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'ADMIN' ? 'error' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {activeTab === 0 ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(user.id)}
                      >
                        Approve
                      </Button>
                    ) : (
                      <Grid container spacing={1}>
                        {user.isActive && (
                          <Grid item>
                            <IconButton
                              color="warning"
                              onClick={() => handleDeauthorize(user.id)}
                              title="Deauthorize User"
                            >
                              <BlockIcon />
                            </IconButton>
                          </Grid>
                        )}
                        <Grid item>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(user)}
                            title="Delete User"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 