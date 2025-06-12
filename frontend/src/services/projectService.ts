import api from './api';
import { Project, CreateProjectRequest, SoilSample, Calculation, Report } from '@/types';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await api.post<Project>('/projects', projectData);
    return response.data;
  },

  async updateProject(id: string, projectData: Partial<CreateProjectRequest>): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}`, projectData);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getSoilSamples(projectId: string): Promise<SoilSample[]> {
    const response = await api.get<SoilSample[]>(`/projects/${projectId}/soil-samples`);
    return response.data;
  },

  async addSoilSample(projectId: string, sampleData: Omit<SoilSample, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>): Promise<SoilSample> {
    const response = await api.post<SoilSample>(`/projects/${projectId}/soil-samples`, sampleData);
    return response.data;
  },

  async getProjectCalculations(projectId: string): Promise<Calculation[]> {
    const response = await api.get<Calculation[]>(`/projects/${projectId}/calculations`);
    return response.data;
  },

  async getProjectReports(projectId: string): Promise<Report[]> {
    const response = await api.get<Report[]>(`/projects/${projectId}/reports`);
    return response.data;
  },
}; 