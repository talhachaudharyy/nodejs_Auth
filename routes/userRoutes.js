import express from 'express'
const router = express.Router();

import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';


//route level middleware
router.use('/changepassword', checkUserAuth)
router.get('/loggeduser', checkUserAuth )



//public routes

router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)


//protected routes

router.post('/changepassword', UserController.changeUserPassword)
router.get('/loggeduser', UserController.loggedUser)
export default router