import { Router } from 'express';
import { register, login, refresh, logout } from './auth.controller.ts';

const router = Router();

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

router.get('/logout', (req, res) => {
  res.render('logout', { title: 'Logout' });
});
router.post('/signup', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;