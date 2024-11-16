import { usersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { sessionCollection } from '../db/models/session.js';
import { FEFTEEN_MINUTES, THIRTY_DAY } from '../constants/index.js';

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FEFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAY),
  };
};
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

export const loginUser = async ({ email, password }) => {
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password is invalid');
  }

  const isEqual = await bcrypt.compare(password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Password is invalid');
  }

  await sessionCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  return sessionCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await sessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  console.log(session);
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (Date.now() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Sessiontoken is expired');
  }
  await sessionCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  const newSession = createSession();

  return await sessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await sessionCollection.deleteOne({ _id: sessionId });
};
