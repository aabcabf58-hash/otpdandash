import mongoose from 'mongoose';

const otpChallengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    purpose: { type: String, enum: ['register', 'login'], required: true },
    codeHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    attemptsRemaining: { type: Number, required: true },
    consumedAt: Date,
  },
  { timestamps: true },
);

export const OtpChallenge = mongoose.model('OtpChallenge', otpChallengeSchema);
