import express from 'express';
import * as plannerController from '../controllers/plannerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Tasks
router.get('/tasks', plannerController.getTasks);
router.post('/tasks', plannerController.createTask);
router.patch('/tasks/:id', plannerController.updateTask);
router.delete('/tasks/:id', plannerController.deleteTask);
router.post('/tasks/template', plannerController.applyTemplate);
router.post('/tasks/copy-partner', plannerController.copyPartnerTasks);

// Goals
router.get('/goals', plannerController.getGoals);
router.post('/goals', plannerController.createGoal);
router.patch('/goals/:id', plannerController.updateGoal);
router.delete('/goals/:id', plannerController.deleteGoal);

// Custom Templates
router.get('/templates', plannerController.getTemplates);
router.post('/templates', plannerController.saveAsTemplate);
router.patch('/templates/:id', plannerController.updateTemplate);
router.delete('/templates/:id', plannerController.deleteTemplate);

export default router;
