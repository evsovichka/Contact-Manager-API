import createHttpError from 'http-errors';
import { sessionCollection } from '../db/models/session.js';
import { usersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(createHttpError(401, 'Please provide Authorization header'));
  }

  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Auth header should be of type Bearer'));
  }

  const session = await sessionCollection.findOne({ accessToken: token });
  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }
  if (Date.now() > session.accessTokenValidUntil) {
    return next(createHttpError(401, 'Access token expired'));
  }

  const user = await usersCollection.findById(session.userId);

  if (!user) {
    return next(createHttpError(401, 'User not found'));
  }

  req.user = user;
  next();
};
