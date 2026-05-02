import { Router } from 'express';
import { register, login, refresh, logout } from './auth.controller.ts';
import authDevicesRouter from './devices/auth.devices.routes.ts';

const router = Router();

router.use('/device', authDevicesRouter);

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

router.get('/logout', (req, res) => {
  res.render('logout', { title: 'Logout' });
});

router.post('/signup', register, (req, res) => {
  res.redirect('../../');
});

router.post('/login', login, (req, res) => {
  res.redirect('../../');
});

router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;