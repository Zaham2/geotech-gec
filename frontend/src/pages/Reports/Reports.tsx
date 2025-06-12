import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Description,
  Delete,
  Visibility,
  Download,
  Refresh,
  Public,
  Lock,
} from '@mui/icons-material';
import { reportService } from '@/services/reportService';
import { projectService } from '@/services/projectService';
import { Report, CreateReportRequest, Project } from '@/types';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState<CreateReportRequest>({
    title: '',
    type: 'SOIL_INVESTIGATION',
    projectId: '',
    isPublic: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsData, projectsData] = await Promise.all([
        reportService.getReports(),
        projectService.getProjects(),
      ]);
      setReports(reportsData);
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setFormData({
      title: '',
      type: 'SOIL_INVESTIGATION',
      projectId: '',
      isPublic: false,
    });
    setDialogOpen(true);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await reportService.deleteReport(id);
        await fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete report');
      }
    }
  };

  const handleRegenerateReport = async (id: string) => {
    try {
      await reportService.regenerateReport(id);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to regenerate report');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await reportService.createReport(formData);
      setDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateReportRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    if (field === 'isPublic') {
      setFormData({
        ...formData,
        [field]: event.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'SOIL_INVESTIGATION': return 'primary';
      case 'FOUNDATION_DESIGN': return 'secondary';
      case 'SLOPE_ANALYSIS': return 'warning';
      case 'GEOTECHNICAL_SUMMARY': return 'info';
      case 'CUSTOM': return 'default';
      default: return 'default';
    }
  };

  const formatReportType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const downloadReport = (report: Report) => {
    const element = document.createElement('a');
    const file = new Blob([report.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-generated geotechnical engineering reports
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateReport}
        >
          Generate Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {reports.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Description sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No reports yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate your first AI-powered geotechnical report
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreateReport}>
            Generate Report
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} md={6} lg={4} key={report.id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {report.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {report.isPublic ? (
                        <Public sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : (
                        <Lock sx={{ fontSize: 16, color: 'grey.500' }} />
                      )}
                      <Chip
                        label={formatReportType(report.type)}
                        color={getReportTypeColor(report.type) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {report.content.substring(0, 150)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Project: {report.project?.name || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Generated {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Generated by: {report.generatedBy}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button size="small" startIcon={<Visibility />} onClick={() => handleViewReport(report)}>
                    View
                  </Button>
                  <Box>
                    <IconButton size="small" onClick={() => downloadReport(report)} title="Download">
                      <Download />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRegenerateReport(report.id)} title="Regenerate">
                      <Refresh />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteReport(report.id)} color="error" title="Delete">
                      <Delete />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Report Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate New Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Report Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleInputChange('title')}
            required
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Report Type</InputLabel>
            <Select
              value={formData.type}
              label="Report Type"
              onChange={handleInputChange('type')}
            >
              <MenuItem value="SOIL_INVESTIGATION">Soil Investigation Report</MenuItem>
              <MenuItem value="FOUNDATION_DESIGN">Foundation Design Report</MenuItem>
              <MenuItem value="SLOPE_ANALYSIS">Slope Analysis Report</MenuItem>
              <MenuItem value="GEOTECHNICAL_SUMMARY">Geotechnical Summary</MenuItem>
              <MenuItem value="CUSTOM">Custom Report</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Project</InputLabel>
            <Select
              value={formData.projectId}
              label="Project"
              onChange={handleInputChange('projectId')}
              required
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isPublic}
                onChange={handleInputChange('isPublic')}
              />
            }
            label="Make report public"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.title.trim() || !formData.projectId}
          >
            {submitting ? <CircularProgress size={20} /> : 'Generate Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{selectedReport?.title}</Typography>
          <Box>
            <IconButton onClick={() => selectedReport && downloadReport(selectedReport)}>
              <Download />
            </IconButton>
            <IconButton onClick={() => setViewDialogOpen(false)}>
              ×
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedReport && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={formatReportType(selectedReport.type)}
                  color={getReportTypeColor(selectedReport.type) as any}
                />
                <Chip
                  label={selectedReport.isPublic ? 'Public' : 'Private'}
                  color={selectedReport.isPublic ? 'success' : 'default'}
                  icon={selectedReport.isPublic ? <Public /> : <Lock />}
                />
                <Chip
                  label={`Project: ${selectedReport.project?.name || 'N/A'}`}
                  variant="outlined"
                />
              </Box>
              
              <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography 
                  variant="body1" 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'inherit',
                    lineHeight: 1.6 
                  }}
                >
                  {selectedReport.content}
                </Typography>
              </Paper>
              
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Generated by: {selectedReport.generatedBy} • {new Date(selectedReport.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reports; 