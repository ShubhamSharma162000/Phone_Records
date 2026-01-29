'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneIcon from '@mui/icons-material/Phone';

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [token, setToken] = useState('');

  // Add record state
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View records state
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      router.push('/login');
    } else {
      setToken(savedToken);
    }
  }, [router]);

  useEffect(() => {
    if (tab === 1 && token) {
      fetchRecords(1);
    }
  }, [tab, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.duplicate) {
          setError('This phone number already exists!');
        } else {
          setError(data.error || 'Failed to add record');
        }
        return;
      }

      setSuccess('Record added successfully!');
      setFormData({ name: '', phone: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const fetchRecords = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/records?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setRecords(data.records);
        setPage(data.currentPage);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' }}>
        <Toolbar>
          <PhoneIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Phone Records Manager
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            centered
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 600 },
            }}
          >
            <Tab label="Add Record" />
            <Tab label="View Records" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {tab === 0 && (
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Add New Record
                </Typography>
                <Box component="form" onSubmit={handleAddRecord} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    sx={{ mb: 2 }}
                  />

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {success}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5568d3 30%, #653a8b 90%)',
                      },
                    }}
                  >
                    Add Record
                  </Button>
                </Box>
              </Box>
            )}

            {tab === 1 && (
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Records List
                </Typography>

                {loading ? (
                  <Typography sx={{ py: 4, textAlign: 'center' }}>Loading...</Typography>
                ) : (
                  <>
                    <TableContainer sx={{ mt: 3 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phone Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date Added</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {records.map((record) => (
                            <TableRow
                              key={record._id}
                              sx={{ '&:hover': { bgcolor: 'grey.50' } }}
                            >
                              <TableCell>{record.name}</TableCell>
                              <TableCell>{record.phone}</TableCell>
                              <TableCell>
                                {new Date(record.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={(e, value) => fetchRecords(value)}
                          color="primary"
                          size="large"
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}