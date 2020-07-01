import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';
import Auth from './app/middlewares/auth';
import multerConfig from './config/multer';

// Validations middlewares
import sessionValidation from './app/validations/SessionValidation';
import userValidation from './app/validations/UserValidation';
import appointmentValidation from './app/validations/AppointmentValidation';

const routes = new Router();
const upload = multer(multerConfig);

// Sessions route
routes.post('/sessions', sessionValidation.create, SessionController.store);
// Users route create
routes.post('/users', userValidation.create, UserController.store);

// Middlware Authentication
routes.use(Auth);
// Users routes protected
routes.put('/users', userValidation.edit, UserController.update);
// File Avatar route
routes.post('/files', upload.single('file'), FileController.store);
// Provider routes
routes.get('/providers', ProviderController.index);
// Appointment routes
routes.post(
  '/appointments',
  appointmentValidation.create,
  AppointmentController.store
);
routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);
routes.get('/appointments/:providerId/available', AvailableController.index);

// Schedule routes
routes.get('/schedules', ScheduleController.index);

// Notification routes
routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

export default module.exports = routes;
