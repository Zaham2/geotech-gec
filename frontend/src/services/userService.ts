import api from './api';
import { User, UserStats, Project } from '@/types';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  async getStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/users/stats');
    return response.data;
  },

  async getUserProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/users/projects');
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/users/profile', userData);
    return response.data;
  },

  async getPendingUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users/pending');
    return response.data;
  },

  async approveUser(userId: string): Promise<User> {
    const response = await api.post<User>(`/auth/approve/${userId}`);
    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async deauthorizeUser(userId: string): Promise<User> {
    const response = await api.put(`/users/${userId}/deauthorize`);
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  }
}; 