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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import {
  Add,
  Calculate,
  ExpandMore,
  Delete,
  Visibility,
  Engineering,
} from '@mui/icons-material';
import { calculationService } from '@/services/calculationService';
import { projectService } from '@/services/projectService';
import { Calculation, CreateCalculationRequest, Project } from '@/types';

const Calculations: React.FC = () => {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<Calculation | null>(null);
  const [formData, setFormData] = useState<CreateCalculationRequest>({
    type: 'BEARING_CAPACITY',
    input: {},
    projectId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [calculationsData, projectsData] = await Promise.all([
        calculationService.getCalculations(),
        projectService.getProjects(),
      ]);
      setCalculations(calculationsData);
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalculation = () => {
    setSelectedCalculation(null);
    setFormData({
      type: 'BEARING_CAPACITY',
      input: {},
      projectId: '',
    });
    setDialogOpen(true);
  };

  const handleViewCalculation = (calculation: Calculation) => {
    setSelectedCalculation(calculation);
  };

  const handleDeleteCalculation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      try {
        await calculationService.deleteCalculation(id);
        await fetchData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete calculation');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Prepare input based on calculation type
      let input = {};
      switch (formData.type) {
        case 'BEARING_CAPACITY':
          input = {
            soilType: formData.input.soilType || 'clay',
            depth: parseFloat(formData.input.depth) || 2,
            width: parseFloat(formData.input.width) || 2,
            cohesion: parseFloat(formData.input.cohesion) || 50,
            frictionAngle: parseFloat(formData.input.frictionAngle) || 25,
            unitWeight: parseFloat(formData.input.unitWeight) || 18,
          };
          break;
        case 'SETTLEMENT':
          input = {
            load: parseFloat(formData.input.load) || 1000,
            area: parseFloat(formData.input.area) || 4,
            elasticModulus: parseFloat(formData.input.elasticModulus) || 20000,
            poissonRatio: parseFloat(formData.input.poissonRatio) || 0.3,
          };
          break;
        case 'SLOPE_STABILITY':
          input = {
            height: parseFloat(formData.input.height) || 10,
            angle: parseFloat(formData.input.angle) || 30,
            cohesion: parseFloat(formData.input.cohesion) || 20,
            frictionAngle: parseFloat(formData.input.frictionAngle) || 25,
            unitWeight: parseFloat(formData.input.unitWeight) || 18,
          };
          break;
        case 'LATERAL_PRESSURE':
          input = {
            height: parseFloat(formData.input.height) || 5,
            unitWeight: parseFloat(formData.input.unitWeight) || 18,
            frictionAngle: parseFloat(formData.input.frictionAngle) || 30,
            cohesion: parseFloat(formData.input.cohesion) || 0,
            pressureType: formData.input.pressureType || 'active',
          };
          break;
        default:
          input = formData.input;
      }

      await calculationService.createCalculation({
        ...formData,
        input,
      });
      
      setDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create calculation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    if (field === 'type' || field === 'projectId') {
      setFormData({
        ...formData,
        [field]: event.target.value,
        input: {}, // Reset input when type changes
      });
    } else {
      setFormData({
        ...formData,
        input: {
          ...formData.input,
          [field]: event.target.value,
        },
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PROCESSING': return 'info';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  const renderCalculationInputs = () => {
    switch (formData.type) {
      case 'BEARING_CAPACITY':
        return (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel>Soil Type</InputLabel>
              <Select
                value={formData.input.soilType || 'clay'}
                label="Soil Type"
                onChange={handleInputChange('soilType')}
              >
                <MenuItem value="clay">Clay</MenuItem>
                <MenuItem value="sand">Sand</MenuItem>
                <MenuItem value="silt">Silt</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Foundation Depth (m)"
              type="number"
              fullWidth
              value={formData.input.depth || ''}
              onChange={handleInputChange('depth')}
            />
            <TextField
              margin="dense"
              label="Foundation Width (m)"
              type="number"
              fullWidth
              value={formData.input.width || ''}
              onChange={handleInputChange('width')}
            />
            <TextField
              margin="dense"
              label="Cohesion (kPa)"
              type="number"
              fullWidth
              value={formData.input.cohesion || ''}
              onChange={handleInputChange('cohesion')}
            />
            <TextField
              margin="dense"
              label="Friction Angle (degrees)"
              type="number"
              fullWidth
              value={formData.input.frictionAngle || ''}
              onChange={handleInputChange('frictionAngle')}
            />
            <TextField
              margin="dense"
              label="Unit Weight (kN/m³)"
              type="number"
              fullWidth
              value={formData.input.unitWeight || ''}
              onChange={handleInputChange('unitWeight')}
            />
          </>
        );
      case 'SETTLEMENT':
        return (
          <>
            <TextField
              margin="dense"
              label="Applied Load (kN)"
              type="number"
              fullWidth
              value={formData.input.load || ''}
              onChange={handleInputChange('load')}
            />
            <TextField
              margin="dense"
              label="Foundation Area (m²)"
              type="number"
              fullWidth
              value={formData.input.area || ''}
              onChange={handleInputChange('area')}
            />
            <TextField
              margin="dense"
              label="Elastic Modulus (kPa)"
              type="number"
              fullWidth
              value={formData.input.elasticModulus || ''}
              onChange={handleInputChange('elasticModulus')}
            />
            <TextField
              margin="dense"
              label="Poisson's Ratio"
              type="number"
              fullWidth
              inputProps={{ step: 0.1, min: 0, max: 0.5 }}
              value={formData.input.poissonRatio || ''}
              onChange={handleInputChange('poissonRatio')}
            />
          </>
        );
      case 'SLOPE_STABILITY':
        return (
          <>
            <TextField
              margin="dense"
              label="Slope Height (m)"
              type="number"
              fullWidth
              value={formData.input.height || ''}
              onChange={handleInputChange('height')}
            />
            <TextField
              margin="dense"
              label="Slope Angle (degrees)"
              type="number"
              fullWidth
              value={formData.input.angle || ''}
              onChange={handleInputChange('angle')}
            />
            <TextField
              margin="dense"
              label="Cohesion (kPa)"
              type="number"
              fullWidth
              value={formData.input.cohesion || ''}
              onChange={handleInputChange('cohesion')}
            />
            <TextField
              margin="dense"
              label="Friction Angle (degrees)"
              type="number"
              fullWidth
              value={formData.input.frictionAngle || ''}
              onChange={handleInputChange('frictionAngle')}
            />
            <TextField
              margin="dense"
              label="Unit Weight (kN/m³)"
              type="number"
              fullWidth
              value={formData.input.unitWeight || ''}
              onChange={handleInputChange('unitWeight')}
            />
          </>
        );
      case 'LATERAL_PRESSURE':
        return (
          <>
            <TextField
              margin="dense"
              label="Wall Height (m)"
              type="number"
              fullWidth
              value={formData.input.height || ''}
              onChange={handleInputChange('height')}
            />
            <TextField
              margin="dense"
              label="Unit Weight (kN/m³)"
              type="number"
              fullWidth
              value={formData.input.unitWeight || ''}
              onChange={handleInputChange('unitWeight')}
            />
            <TextField
              margin="dense"
              label="Friction Angle (degrees)"
              type="number"
              fullWidth
              value={formData.input.frictionAngle || ''}
              onChange={handleInputChange('frictionAngle')}
            />
            <TextField
              margin="dense"
              label="Cohesion (kPa)"
              type="number"
              fullWidth
              value={formData.input.cohesion || ''}
              onChange={handleInputChange('cohesion')}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Pressure Type</InputLabel>
              <Select
                value={formData.input.pressureType || 'active'}
                label="Pressure Type"
                onChange={handleInputChange('pressureType')}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="passive">Passive</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      default:
        return (
          <TextField
            margin="dense"
            label="Input Parameters (JSON)"
            fullWidth
            multiline
            rows={4}
            value={JSON.stringify(formData.input, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({ ...formData, input: parsed });
              } catch (err) {
                // Invalid JSON, ignore
              }
            }}
          />
        );
    }
  };

  const renderCalculationResult = (calculation: Calculation) => {
    if (!calculation.output) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Results
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {JSON.stringify(calculation.output, null, 2)}
          </pre>
        </Paper>
        {calculation.aiResponse && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI Analysis
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="body2">
                {calculation.aiResponse}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    );
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
            Calculations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Perform geotechnical engineering calculations with AI assistance
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCalculation}
        >
          New Calculation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {calculations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Calculate sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No calculations yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first geotechnical calculation to get started
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleCreateCalculation}>
            Create Calculation
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {calculations.map((calculation) => (
            <Grid item xs={12} key={calculation.id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Calculate color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {calculation.type.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created {new Date(calculation.createdAt).toLocaleDateString()}
                        {calculation.project && ` • Project: ${calculation.project.name}`}
                      </Typography>
                    </Box>
                    <Chip
                      label={calculation.status}
                      color={getStatusColor(calculation.status) as any}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCalculation(calculation.id);
                      }}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Input Parameters
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                      <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {JSON.stringify(calculation.input, null, 2)}
                      </pre>
                    </Paper>
                    {renderCalculationResult(calculation)}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Calculation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Calculation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Calculation Type</InputLabel>
            <Select
              value={formData.type}
              label="Calculation Type"
              onChange={handleInputChange('type')}
            >
              <MenuItem value="BEARING_CAPACITY">Bearing Capacity</MenuItem>
              <MenuItem value="SETTLEMENT">Settlement Analysis</MenuItem>
              <MenuItem value="SLOPE_STABILITY">Slope Stability</MenuItem>
              <MenuItem value="LATERAL_PRESSURE">Lateral Earth Pressure</MenuItem>
              <MenuItem value="CONSOLIDATION">Consolidation</MenuItem>
              <MenuItem value="COMPACTION">Compaction</MenuItem>
              <MenuItem value="PERMEABILITY">Permeability</MenuItem>
              <MenuItem value="SHEAR_STRENGTH">Shear Strength</MenuItem>
              <MenuItem value="CUSTOM">Custom</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Project (Optional)</InputLabel>
            <Select
              value={formData.projectId || ''}
              label="Project (Optional)"
              onChange={handleInputChange('projectId')}
            >
              <MenuItem value="">No Project</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {renderCalculationInputs()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Calculate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Calculations; 