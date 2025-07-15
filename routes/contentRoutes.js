
import express from 'express';
import { getGuides, getGuideBySlug, getDirectory } from '../controllers/contentController.js';

const router = express.Router();

router.get('/guides', getGuides);
router.get('/guides/:slug', getGuideBySlug);
router.get('/directory', getDirectory);

export default router;