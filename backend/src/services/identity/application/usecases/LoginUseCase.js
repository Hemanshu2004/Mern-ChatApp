import { InvalidCredentialsError } from '../../domain/errors/InvalidCredentialsError.js';
import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';
import { createEmail } from '../../../../libs/shared-kernel/valueObjects/Email.js';
import { PasswordHasher } from '../../domain/services/PasswordHasher.js';

/**
 * Use case: Login a user
 */
export class LoginUseCase {
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
   * @returns {Promise<User>}
   * @throws {ValidationError | InvalidCredentialsError}
   */
  async execute({ email, password }) {
    // Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Validate email format
    const validatedEmail = createEmail(email);

    // Find user by email
    const user = await this.userRepository.findByEmail(validatedEmail);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.verify(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}

