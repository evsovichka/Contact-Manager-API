import { usersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

export const registerUser = async (payload) => {
  const { email, password } = payload;
  const user = await usersCollection.findOne({ email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(password, 10);
  return await usersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};
