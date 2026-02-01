import { Router } from 'express';
import eventRoutes from './eventroutes';
import taskRoutes from './taskroutes';

const router = Router();

router.use('/events', eventRoutes);
router.use('/tasks', taskRoutes);

export default router;