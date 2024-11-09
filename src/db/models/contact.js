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
  },
  { versionKey: false, timestamps: true },
);

contactSchema.post('save', handleSaveError);
contactSchema.pre('findOneAndUpdate', setUpdatesettings);
contactSchema.post('findOneAndUpdate', handleSaveError);

export const ContactsCollection = model('contacts', contactSchema);
