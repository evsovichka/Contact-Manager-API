import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { loginUserSchema, registerUserSchema } from '../validation/auth.js';
import * as authControllers from '../controllers/auth.js';

const routerAuth = Router();

routerAuth.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(authControllers.registerUserController),
);

routerAuth.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(authControllers.loginUserController),
);

routerAuth.post(
  '/refresh',
  ctrlWrapper(authControllers.refreshUserSessionController),
);

routerAuth.post('/logout', ctrlWrapper(authControllers.logoutUserController));
export default routerAuth;
