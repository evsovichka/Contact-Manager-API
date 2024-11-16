import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = 'asc',
  sortBy = '_id',
  filter = {},
}) => {
  const skip = (page - 1) * perPage;

  const ContactsQuery = ContactsCollection.find();

  if (filter.type) {
    ContactsQuery.where('contactType').equals(filter.type);
  }

  if (filter.isFavourite !== undefined) {
    ContactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  if (filter.userId) {
    ContactsQuery.where('userId').equals(filter.userId);
  }
  const totalItems = await ContactsCollection.find()
    .merge(ContactsQuery)
    .countDocuments();

  const contacts = await ContactsQuery.skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData({ totalItems, page, perPage });
  return { data: contacts, ...paginationData };
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const updateContact = async (contactId, payload, options = {}) => {
  const rawResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    payload,
    { includeResultMetadata: true, ...options },
  );

  if (!rawResult || !rawResult.value) return null;
  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult.lastErrorObject.upserted),
  };
};

export const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findOneAndDelete({ _id: contactId });
  return contact;
};
