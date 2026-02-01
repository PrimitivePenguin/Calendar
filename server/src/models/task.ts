export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;    // ISO 8601 format
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDate: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}