import { Router } from 'express';
import { searchAreas } from '../controllers/areas.controller.js';

const router = Router();

router.get('/', searchAreas);

export default router;
