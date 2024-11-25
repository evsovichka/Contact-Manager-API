import { model, Schema } from 'mongoose';
import { handleSaveError, setUpdatesettings } from './hooks.js';
import { emailRegex } from '../../constants/index.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, match: emailRegex, unique: true, required: true },
    password: { type: String, required: true },
    photo: { type: String },
  },
  { versionKey: false, timestamps: true },
);

userSchema.post('save', handleSaveError);
userSchema.pre('findOneAndUpdate', setUpdatesettings);
userSchema.post('findOneAndUpdate', handleSaveError);

export const usersCollection = model('users', userSchema);
