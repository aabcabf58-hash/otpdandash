import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    phoneVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    phone: this.phone,
    phoneVerified: this.phoneVerified,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
