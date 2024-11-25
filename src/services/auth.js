import { usersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { sessionCollection } from '../db/models/session.js';
import {
  FEFTEEN_MINUTES,
  SMTP,
  TEMPLATES_DIR,
  THIRTY_DAY,
} from '../constants/index.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import { env } from '../utils/env.js';
import handlebars from 'handlebars';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

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

export const requestResetEmail = async (email) => {
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    { expiresIn: '5m' },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'resetPasswordEmail.html',
  );
  const templateSource = await fs.readFile(resetPasswordTemplatePath, 'utf-8');
  const template = handlebars.compile(templateSource);
  const html = template({
    username: user.name,
    link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });
  const verifyEmail = {
    from: env(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  };

  await sendEmail(verifyEmail);
};

export const resetPassword = async ({ data, sessionId }) => {
  let entries;
  try {
    entries = jwt.verify(data.token, env('JWT_SECRET'));
  } catch (error) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await usersCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  await sessionCollection.deleteOne({ _id: sessionId });
  const encryptedPassword = await bcrypt.hash(data.password, 10);

  await usersCollection.findOneAndUpdate(
    { _id: user._id },
    {
      password: encryptedPassword,
    },
  );
};
