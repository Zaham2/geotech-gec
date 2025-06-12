import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Engineering,
  Calculate,
  Description,
  TrendingUp,
  Add,
  Work,
  Chat,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/userService';
import { projectService } from '@/services/projectService';
import { calculationService } from '@/services/calculationService';
import { UserStats, Project, Calculation } from '@/types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentCalculations, setRecentCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [userStats, projects, calculations] = await Promise.all([
          userService.getStats(),
          projectService.getProjects(),
          calculationService.getCalculations(),
        ]);
        
        setStats(userStats);
        setRecentProjects(projects.slice(0, 5)); // Show last 5 projects
        setRecentCalculations(calculations.slice(0, 5)); // Show last 5 calculations
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const statsData = [
    { title: 'Active Projects', value: stats?.projects || 0, icon: <Engineering />, color: '#1976d2' },
    { title: 'Calculations Done', value: stats?.calculations || 0, icon: <Calculate />, color: '#2e7d32' },
    { title: 'Reports Generated', value: recentProjects.reduce((acc, p) => acc + (p.reports?.length || 0), 0), icon: <Description />, color: '#ed6c02' },
    { title: 'AI Chat Sessions', value: stats?.chatSessions || 0, icon: <TrendingUp />, color: '#9c27b0' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'primary';
      case 'ON_HOLD': return 'warning';
      case 'CANCELLED': return 'error';
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'info';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Geotechnical Engineering Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered analysis and project management for geotechnical engineering
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: stat.color,
                      color: 'white',
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent Projects */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Projects
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/projects')}
              >
                View All
              </Button>
            </Box>
            {recentProjects.length > 0 ? (
              <List>
                {recentProjects.map((project) => (
                  <ListItem key={project.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Work />
                    </ListItemIcon>
                    <ListItemText
                      primary={project.name}
                      secondary={project.description || project.location}
                    />
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No projects yet. <Button onClick={() => navigate('/projects')}>Create your first project</Button>
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Calculations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Calculations
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/calculations')}
              >
                View All
              </Button>
            </Box>
            {recentCalculations.length > 0 ? (
              <List>
                {recentCalculations.map((calculation) => (
                  <ListItem key={calculation.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Calculate />
                    </ListItemIcon>
                    <ListItemText
                      primary={calculation.type.replace('_', ' ')}
                      secondary={new Date(calculation.createdAt).toLocaleDateString()}
                    />
                    <Chip
                      label={calculation.status}
                      color={getStatusColor(calculation.status) as any}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No calculations yet. <Button onClick={() => navigate('/calculations')}>Run your first calculation</Button>
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => navigate('/projects')}
                >
                  New Project
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Calculate />}
                  onClick={() => navigate('/calculations')}
                >
                  Run Calculation
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Chat />}
                  onClick={() => navigate('/chat')}
                >
                  AI Chat
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Description />}
                  onClick={() => navigate('/reports')}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 