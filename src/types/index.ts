export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  scenarioId?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  estimatedDuration: number;
  learningObjectives: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  progress: number;
  isCompleted: boolean;
  resources: LearningResource[];
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'interactive';
  url: string;
  duration?: number;
}

export interface Competency {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number;
  targetLevel: number;
  gap: number;
}

export interface DevelopmentPlan {
  id: string;
  title: string;
  description: string;
  competencies: Competency[];
  goals: DevelopmentGoal[];
  timeline: number; // in weeks
  progress: number;
}

export interface DevelopmentGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  isCompleted: boolean;
  progress: number;
}

export interface PracticeSession {
  id: string;
  scenarioId: string;
  startTime: number;
  endTime?: number;
  messages: Message[];
  evaluation?: SessionEvaluation;
}

export interface SessionEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  correlationId?: string;
  timestamp?: string;
} 