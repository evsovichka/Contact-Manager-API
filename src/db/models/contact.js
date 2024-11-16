import { model, Schema } from 'mongoose';
import { handleSaveError, setUpdatesettings } from './hooks.js';

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
    isFavourite: { type: Boolean, default: false },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  },
  { versionKey: false, timestamps: true },
);

export const keyOfStudentForSort = ['_id', 'name'];
export const contactType = ['work', 'home', 'personal'];

contactSchema.post('save', handleSaveError);
contactSchema.pre('findOneAndUpdate', setUpdatesettings);
contactSchema.post('findOneAndUpdate', handleSaveError);

export const ContactsCollection = model('contacts', contactSchema);
