import mongoose from 'mongoose';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import UserModel from '../persistence/UserModel.js';

/**
 * Mongoose implementation of IUserRepository
 */
export class MongooseUserRepository extends IUserRepository {
  /**
   * @param {string} userId
   * @returns {Promise<User | null>}
   */
  async findById(userId) {
    // Get user with password (needed for domain entity)
    const doc = await UserModel.findById(userId).select('+password');
    if (!doc) return null;
    return User.fromData(doc.toObject());
  }

  /**
   * @param {string} email
   * @returns {Promise<User | null>}
   */
  async findByEmail(email) {
    const doc = await UserModel.findOne({ email }).select('+password');
    if (!doc) return null;
    return User.fromData(doc.toObject());
  }

  /**
   * @param {User} user
   * @param {Object} [additionalData] - Additional data for Mongoose model (e.g., fullName, profilePic)
   * @returns {Promise<User>}
   */
  async save(user, additionalData = {}) {
    const data = user.toData();
    
    if (data._id && !data._id.startsWith('temp-')) {
      // Update existing
      const updateData = {
        email: data.email,
        password: data.password,
        isOnboarded: data.isOnboarded,
        updatedAt: data.updatedAt,
        ...additionalData,
      };
      
      const doc = await UserModel.findByIdAndUpdate(
        data._id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!doc) {
        throw new Error(`User with ID ${data._id} not found`);
      }
      
      return User.fromData(doc.toObject());
    } else {
      // Create new
      const doc = await UserModel.create({
        email: data.email,
        password: data.password,
        isOnboarded: data.isOnboarded,
        fullName: additionalData.fullName || 'User', // Required by Mongoose schema
        profilePic: additionalData.profilePic || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
      
      return User.fromData(doc.toObject());
    }
  }

  /**
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    const count = await UserModel.countDocuments({ email });
    return count > 0;
  }
}

