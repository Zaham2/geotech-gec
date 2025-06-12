export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN' | 'ENGINEER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  soilSamples?: SoilSample[];
  calculations?: Calculation[];
  reports?: Report[];
}

export interface SoilSample {
  id: string;
  sampleId: string;
  depth: number;
  soilType: string;
  moistureContent?: number;
  density?: number;
  liquidLimit?: number;
  plasticLimit?: number;
  plasticityIndex?: number;
  grainSize?: any;
  strength?: any;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: Project;
}

export interface Calculation {
  id: string;
  type: 'BEARING_CAPACITY' | 'SETTLEMENT' | 'SLOPE_STABILITY' | 'LATERAL_PRESSURE' | 'CONSOLIDATION' | 'COMPACTION' | 'PERMEABILITY' | 'SHEAR_STRENGTH' | 'CUSTOM';
  input: any;
  output: any;
  aiPrompt?: string;
  aiResponse?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  projectId?: string;
  project?: Project;
  soilSampleId?: string;
  soilSample?: SoilSample;
}

export interface ChatSession {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  createdAt: string;
  sessionId: string;
  session?: ChatSession;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  type: 'SOIL_INVESTIGATION' | 'FOUNDATION_DESIGN' | 'SLOPE_ANALYSIS' | 'GEOTECHNICAL_SUMMARY' | 'CUSTOM';
  generatedBy: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: Project;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface UserStats {
  projects: number;
  calculations: number;
  chatSessions: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  location?: string;
  status?: Project['status'];
}

export interface CreateCalculationRequest {
  type: Calculation['type'];
  input: any;
  projectId?: string;
  soilSampleId?: string;
}

export interface CreateReportRequest {
  title: string;
  type: Report['type'];
  projectId: string;
  isPublic?: boolean;
}

export interface SendMessageRequest {
  content: string;
  sessionId: string;
} 