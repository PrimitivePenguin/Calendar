import { Router } from 'express';
import { eventController } from '../controllers/eventcontroller';

const router = Router();

// GET /api/events - Get all events
router.get('/', eventController.getAll);

// GET /api/events/:id - Get single event
router.get('/:id', eventController.getById);

// POST /api/events - Create new event
router.post('/', eventController.create);

// PUT /api/events/:id - Update event
router.put('/:id', eventController.update);

// DELETE /api/events/:id - Delete event
router.delete('/:id', eventController.delete);

export default router;