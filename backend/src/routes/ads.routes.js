import { Router } from 'express';
import validateAd from '../middlewares/validateAds.js';
import { createAd, listAds, getAd } from '../controllers/ads.controller.js';

const router = Router();

router.post('/', validateAd, createAd); // validateAd runs first
router.get('/', listAds);
router.get('/:id', getAd);

export default router;
