import { Router } from 'express';
// Nuevo: middleware de login de Saúl
import { autenticar } from '../../middlewares/auth.js';
import * as ventas from './ventas.controller.js';

const router = Router();
 