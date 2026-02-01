import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storageservice';
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../models/task';

const TASKS_FILE = 'tasks.json';

export const taskController = {
  /**
   * GET /api/tasks
   * Get all tasks
   */
  getAll(_req: Request, res: Response): void {
    try {
      const tasks = storageService.read<Task>(TASKS_FILE);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks', error });
    }
  },

  /**
   * GET /api/tasks/:id
   * Get a single task by ID
   */
  getById(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const task = storageService.findById<Task>(TASKS_FILE, id as string);
      
      if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch task', error });
    }
  },

  /**
   * POST /api/tasks
   * Create a new task
   */
  create(req: Request, res: Response): void {
    try {
      const body: CreateTaskDTO = req.body;
      
      // Validation
      if (!body.title || !body.dueDate) {
        res.status(400).json({ message: 'title and dueDate are required' });
        return;
      }
      
      // Validate priority if provided
      if (body.priority && !['low', 'medium', 'high'].includes(body.priority)) {
        res.status(400).json({ message: 'priority must be low, medium, or high' });
        return;
      }
      
      const now = new Date().toISOString();
      const newTask: Task = {
        id: uuidv4(),
        title: body.title,
        description: body.description || '',
        dueDate: body.dueDate,
        completed: false,
        priority: body.priority || 'medium',
        createdAt: now,
        updatedAt: now
      };
      
      const created = storageService.create<Task>(TASKS_FILE, newTask);
      res.status(201).json(created);
      } catch (error) {
        console.error('Task creation error:', error);
        res.status(500).json({ message: 'Failed to create task', error: error instanceof Error ? error.message : String(error) });
      }
  },

  /**
   * PUT /api/tasks/:id
   * Update an existing task
   */
  update(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const body: UpdateTaskDTO = req.body;
      
      const existing = storageService.findById<Task>(TASKS_FILE, id as string);
      if (!existing) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      
      // Validate priority if provided
      if (body.priority && !['low', 'medium', 'high'].includes(body.priority)) {
        res.status(400).json({ message: 'priority must be low, medium, or high' });
        return;
      }
      
      const updates: Partial<Task> = {
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      const updated = storageService.update<Task>(TASKS_FILE, id as string, updates);
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task', error });
    }
  },

  /**
   * PATCH /api/tasks/:id/toggle
   * Toggle task completion status
   */
  toggleComplete(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      
      const existing = storageService.findById<Task>(TASKS_FILE, id as string);
      if (!existing) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      
      const updates: Partial<Task> = {
        completed: !existing.completed,
        updatedAt: new Date().toISOString()
      };
      
      const updated = storageService.update<Task>(TASKS_FILE, id as string, updates);
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ message: 'Failed to toggle task', error });
    }
  },

  /**
   * DELETE /api/tasks/:id
   * Delete a task
   */
  delete(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      
      const deleted = storageService.delete<Task>(TASKS_FILE, id as string);
      
      if (!deleted) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task', error });
    }
  }
};