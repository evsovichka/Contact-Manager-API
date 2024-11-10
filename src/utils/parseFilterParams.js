import { contactType } from '../db/models/contact.js';

const parseType = (type) => {
  if (typeof type !== 'string') return;

  const isType = contactType.includes(type);

  if (!isType) return;
  return type;
};

const parseIsFavourite = (isFavourite) => {
  if (typeof isFavourite !== 'string') return undefined;

  if (isFavourite === 'true') {
    return true;
  } else if (isFavourite === 'false') {
    return false;
  }

  return undefined;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;
  const parsedType = parseType(type);
  const parsedIsFavourite = parseIsFavourite(isFavourite);
  return {
    type: parsedType,
    isFavourite: parsedIsFavourite,
  };
};
