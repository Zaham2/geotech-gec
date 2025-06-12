import api from './api';
import { Calculation, CreateCalculationRequest } from '@/types';

export const calculationService = {
  async getCalculations(): Promise<Calculation[]> {
    const response = await api.get<Calculation[]>('/calculations');
    return response.data;
  },

  async getCalculation(id: string): Promise<Calculation> {
    const response = await api.get<Calculation>(`/calculations/${id}`);
    return response.data;
  },

  async createCalculation(calculationData: CreateCalculationRequest): Promise<Calculation> {
    const response = await api.post<Calculation>('/calculations', calculationData);
    return response.data;
  },

  async updateCalculation(id: string, calculationData: Partial<CreateCalculationRequest>): Promise<Calculation> {
    const response = await api.patch<Calculation>(`/calculations/${id}`, calculationData);
    return response.data;
  },

  async deleteCalculation(id: string): Promise<void> {
    await api.delete(`/calculations/${id}`);
  },
}; 