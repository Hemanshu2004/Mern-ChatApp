import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Mongoose schema for User (Identity context)
 * This is separate from the domain entity - it's just for persistence
 */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    // Note: Profile fields (bio, profilePic, etc.) are in UserProfile context
    // We keep them here for backward compatibility during migration
    bio: {
      type: String,
      default: '',
    },
    profilePic: {
      type: String,
      default: '',
    },
    nativeLanguage: {
      type: String,
      default: '',
    },
    learningLanguage: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving (if modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Note: We don't use matchPassword method here since PasswordHasher is in domain layer
// But we keep the schema compatible with existing code

// Reuse existing User model if it exists (from old models/User.js)
// Otherwise create new one with same name
// This ensures both old and new code use the same Mongoose model
let UserModel;
if (mongoose.models.User) {
  UserModel = mongoose.models.User;
} else {
  UserModel = mongoose.model('User', userSchema);
}

export default UserModel;

