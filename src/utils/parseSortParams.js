import { SORT_ORDER } from '../constants/index.js';
import { keyOfStudentForSort } from '../db/models/contact.js';

export const parseSortParams = (query) => {
  const { sortOrder, sortBy } = query;
  const parsedSortOrder = SORT_ORDER.includes(sortOrder) ? sortOrder : 'asc';
  const parsedSortBy = keyOfStudentForSort.includes(sortBy) ? sortBy : '_id';
  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
