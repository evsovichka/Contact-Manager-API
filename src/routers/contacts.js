import { Router } from 'express';
import * as contactsControllers from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  addContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrlWrapper(contactsControllers.getContactsController));

router.get(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsControllers.getContactByIdController),
);

router.post(
  '/',
  upload.single('photo'),
  validateBody(addContactSchema),
  ctrlWrapper(contactsControllers.createContactController),
);

router.patch(
  '/:contactId',
  isValidId,
  upload.single('photo'),
  validateBody(updateContactSchema),
  ctrlWrapper(contactsControllers.patchContactController),
);

router.delete(
  '/:contactId',
  isValidId,
  ctrlWrapper(contactsControllers.deleteContactController),
);

export default router;

// router.put(
//   '/:contactId',
//   isValidId,
//   ctrlWrapper(contactsControllers.upsertContactController),
// );
