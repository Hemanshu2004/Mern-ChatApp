import { User } from '../../domain/entities/User.js';
import { PasswordHasher } from '../../domain/services/PasswordHasher.js';
import { UserRegistered } from '../../domain/events/UserRegistered.js';
import { DuplicateEmailError } from '../../domain/errors/DuplicateEmailError.js';
import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';
import { createEmail } from '../../../../libs/shared-kernel/valueObjects/Email.js';
import { createPassword } from '../../../../libs/shared-kernel/valueObjects/Password.js';
import { eventBus } from '../../../../infrastructure/events/EventBus.js';

/**
 * Use case: Sign up a new user
 */
export class SignUpUseCase {
  /**
   * @param {IUserRepository} userRepository
   * @param {PasswordHasher} passwordHasher
   */
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  /**
   * @param {Object} request
   * @param {string} request.email
   * @param {string} request.password
   * @param {string} request.fullName
   * @param {string} [request.profilePic] - Optional profile picture URL
   * @returns {Promise<User>}
   * @throws {ValidationError | DuplicateEmailError}
   */
  async execute({ email, password, fullName, profilePic }) {
    // Validate input
    if (!email || !password || !fullName) {
      throw new ValidationError('Email, password, and full name are required');
    }

    // Validate email format
    const validatedEmail = createEmail(email);
    
    // Validate password strength
    createPassword(password);

    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(validatedEmail);
    if (emailExists) {
      throw new DuplicateEmailError(validatedEmail);
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(password);

    // Generate random avatar if not provided
    const avatar = profilePic || this._generateRandomAvatar();

    // Create user (we'll need to generate ID - MongoDB will do this)
    // For now, we'll create a temporary ID that will be replaced by MongoDB
    const tempId = `temp-${Date.now()}`;
    const user = new User({
      id: tempId,
      email: validatedEmail,
      passwordHash,
      isOnboarded: false,
    });

    // Save user (repository will generate real ID)
    // Pass additional data for Mongoose model (fullName, profilePic are in UserProfile context but stored here for migration)
    const savedUser = await this.userRepository.save(user, {
      fullName,
      profilePic: avatar,
    });

    // Publish domain event
    await eventBus.publish(
      new UserRegistered({
        userId: savedUser.id,
        email: savedUser.email,
      })
    );

    return savedUser;
  }

  /**
   * Generates a random avatar URL
   * @private
   * @returns {string}
   */
  _generateRandomAvatar() {
    const idx = Math.floor(Math.random() * 100) + 1;
    return `https://avatar.iran.liara.run/public/${idx}.png`;
  }
}

