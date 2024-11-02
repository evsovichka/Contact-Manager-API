import { Router } from 'express';
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  upsertContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/', ctrlWrapper(getContactsController));

router.get('/:contactId', ctrlWrapper(getContactByIdController));

router.post('/', ctrlWrapper(createContactController));

router.put('/:contactId', ctrlWrapper(upsertContactController));

export default router;
