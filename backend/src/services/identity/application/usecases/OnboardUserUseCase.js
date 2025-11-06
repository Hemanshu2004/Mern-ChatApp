import { NotFoundError } from '../../../../libs/shared-kernel/exceptions/NotFoundError.js';
import { ValidationError } from '../../../../libs/shared-kernel/exceptions/ValidationError.js';
import { UserOnboarded } from '../../domain/events/UserOnboarded.js';
import { eventBus } from '../../../../infrastructure/events/EventBus.js';

/**
 * Use case: Complete user onboarding
 */
export class OnboardUserUseCase {
  /**
   * @param {IUserRepository} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} request
   * @param {string} request.userId
   * @param {Object} [request.profileData] - Profile data (for migration compatibility: fullName, bio, etc.)
   * @returns {Promise<User>}
   * @throws {NotFoundError | ValidationError}
   */
  async execute({ userId, profileData = {} }) {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Mark as onboarded
    user.completeOnboarding();

    // Save with profile data (for migration - profile data should be in UserProfile context)
    const savedUser = await this.userRepository.save(user, profileData);

    // Publish domain event
    await eventBus.publish(
      new UserOnboarded({
        userId: savedUser.id,
      })
    );

    return savedUser;
  }
}

