import api from './api';
import { Report, CreateReportRequest } from '@/types';

export const reportService = {
  async getReports(): Promise<Report[]> {
    const response = await api.get<Report[]>('/reports');
    return response.data;
  },

  async getReport(id: string): Promise<Report> {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  async createReport(reportData: CreateReportRequest): Promise<Report> {
    const response = await api.post<Report>('/reports', reportData);
    return response.data;
  },

  async updateReport(id: string, reportData: Partial<Report>): Promise<Report> {
    const response = await api.patch<Report>(`/reports/${id}`, reportData);
    return response.data;
  },

  async deleteReport(id: string): Promise<void> {
    await api.delete(`/reports/${id}`);
  },

  async regenerateReport(id: string): Promise<Report> {
    const response = await api.post<Report>(`/reports/${id}/regenerate`);
    return response.data;
  },
}; 