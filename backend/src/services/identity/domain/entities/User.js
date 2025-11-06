import { createEmail, createPassword } from '../../../../libs/shared-kernel/valueObjects/Email.js';
import { createUserId } from '../../../../libs/shared-kernel/valueObjects/UserId.js';
import { now } from '../../../../libs/shared-kernel/valueObjects/Timestamp.js';

/**
 * User aggregate root (Identity context)
 * Handles authentication and credentials only.
 * Profile data is in UserProfile context.
 */
export class User {
  /**
   * @param {Object} params
   * @param {string} params.id - User ID
   * @param {string} params.email - Email address
   * @param {string} params.passwordHash - Hashed password
   * @param {boolean} [params.isOnboarded] - Onboarding completion status
   * @param {Date} [params.createdAt] - Creation timestamp
   * @param {Date} [params.updatedAt] - Update timestamp
   */
  constructor({ id, email, passwordHash, isOnboarded = false, createdAt, updatedAt }) {
    this._id = createUserId(id);
    this._email = createEmail(email);
    this._passwordHash = passwordHash; // Already hashed, no validation needed
    this._isOnboarded = Boolean(isOnboarded);
    this._createdAt = createdAt || now();
    this._updatedAt = updatedAt || now();
  }

  /** @returns {string} */
  get id() {
    return this._id;
  }

  /** @returns {string} */
  get email() {
    return this._email;
  }

  /** @returns {string} */
  get passwordHash() {
    return this._passwordHash;
  }

  /** @returns {boolean} */
  get isOnboarded() {
    return this._isOnboarded;
  }

  /** @returns {Date} */
  get createdAt() {
    return this._createdAt;
  }

  /** @returns {Date} */
  get updatedAt() {
    return this._updatedAt;
  }

  /**
   * Marks user as onboarded
   */
  completeOnboarding() {
    this._isOnboarded = true;
    this._updatedAt = now();
  }

  /**
   * Updates password hash
   * @param {string} newPasswordHash - New hashed password
   */
  updatePassword(newPasswordHash) {
    this._passwordHash = newPasswordHash;
    this._updatedAt = now();
  }

  /**
   * Creates a User from a plain object (e.g., from database)
   * @param {Object} data
   * @returns {User}
   */
  static fromData(data) {
    return new User({
      id: data._id?.toString() || data.id,
      email: data.email,
      passwordHash: data.password,
      isOnboarded: data.isOnboarded || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Converts User to plain object for persistence
   * @returns {Object}
   */
  toData() {
    return {
      _id: this._id,
      email: this._email,
      password: this._passwordHash,
      isOnboarded: this._isOnboarded,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

