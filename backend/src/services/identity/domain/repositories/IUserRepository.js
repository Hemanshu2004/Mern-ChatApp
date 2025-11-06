/**
 * User repository interface
 * Defines contract for user persistence
 * 
 * @interface
 */
export class IUserRepository {
  /**
   * Finds a user by ID
   * @param {string} userId
   * @returns {Promise<User | null>}
   */
  async findById(userId) {
    throw new Error('IUserRepository.findById() must be implemented');
  }

  /**
   * Finds a user by email
   * @param {string} email
   * @returns {Promise<User | null>}
   */
  async findByEmail(email) {
    throw new Error('IUserRepository.findByEmail() must be implemented');
  }

  /**
   * Saves a user (create or update)
   * @param {User} user
   * @returns {Promise<User>}
   */
  async save(user) {
    throw new Error('IUserRepository.save() must be implemented');
  }

  /**
   * Checks if email exists
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    throw new Error('IUserRepository.emailExists() must be implemented');
  }
}

