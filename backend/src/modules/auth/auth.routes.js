import { Router } from 'express';
import { autenticar } from '../../middlewares/auth.js';
import * as controller from './auth.controller.js';

const router = Router();

router.post('/login', controller.login);
router.get('/me', autenticar, controller.me);

export default router;