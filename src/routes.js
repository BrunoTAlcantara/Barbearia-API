import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'
import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import SheduleController from './app/controllers/SheduleController'
import FileController from './app/controllers/FileController'
import ProviderController from './app/controllers/ProviderController'
import AvaliableController from './app/controllers/AvaliableController'
import NotificationsController from './app/controllers/NotificationsController'
import AppointmentsController from './app/controllers/AppointmentController'
import Auth from './app/middlewares/auth'

const routes = new Router()

const upload = multer(multerConfig)

routes.post('/users', UserController.store)
routes.post('/session', SessionController.store)
routes.use(Auth)
routes.put('/users', UserController.update)
routes.get('/providers', ProviderController.index)
routes.get('/providers/:providerId/avaliable', AvaliableController.index)

routes.get('/appointments', AppointmentsController.index)
routes.post('/appointments', AppointmentsController.store)
routes.delete('/appointments/:id', AppointmentsController.delete)

routes.get('/notifications', NotificationsController.index)
routes.post('/files', upload.single('file'), FileController.store)
routes.get('/shedule', SheduleController.index)

export default routes
