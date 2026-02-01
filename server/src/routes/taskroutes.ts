import { Router } from 'express';
import { taskController } from '../controllers/taskcontroller';

const router = Router();

// GET /api/tasks - Get all tasks
router.get('/', taskController.getAll);

// GET /api/tasks/:id - Get single task
router.get('/:id', taskController.getById);

// POST /api/tasks - Create new task
router.post('/', taskController.create);

// PUT /api/tasks/:id - Update task
router.put('/:id', taskController.update);

// PATCH /api/tasks/:id/toggle - Toggle completion
router.patch('/:id/toggle', taskController.toggleComplete);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', taskController.delete);

export default router;