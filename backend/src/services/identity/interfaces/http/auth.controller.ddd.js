import { SignUpUseCase } from '../../application/usecases/SignUpUseCase.js';
import { LoginUseCase } from '../../application/usecases/LoginUseCase.js';
import { OnboardUserUseCase } from '../../application/usecases/OnboardUserUseCase.js';
import { MongooseUserRepository } from '../../infrastructure/repositories/MongooseUserRepository.js';
import { PasswordHasher } from '../../domain/services/PasswordHasher.js';
import { ValidationError, NotFoundError } from '../../../../libs/shared-kernel/exceptions/index.js';
import { DuplicateEmailError } from '../../domain/errors/DuplicateEmailError.js';
import { InvalidCredentialsError } from '../../domain/errors/InvalidCredentialsError.js';
import jwt from 'jsonwebtoken';
import { upsertStreamUser } from '../../../../lib/stream.js';

/**
 * DDD-based authentication controller
 * Thin adapter layer - no business logic, only mapping
 */
export class AuthController {
  constructor() {
    // Initialize dependencies
    this.userRepository = new MongooseUserRepository();
    this.passwordHasher = new PasswordHasher();
    
    // Initialize use cases
    this.signUpUseCase = new SignUpUseCase(this.userRepository, this.passwordHasher);
    this.loginUseCase = new LoginUseCase(this.userRepository, this.passwordHasher);
    this.onboardUseCase = new OnboardUserUseCase(this.userRepository);
  }

  /**
   * Sign up handler
   */
  async signup(req, res) {
    try {
      const { email, password, fullName, profilePic } = req.body;

      // Execute use case
      const user = await this.signUpUseCase.execute({
        email,
        password,
        fullName,
        profilePic,
      });

      // Sync with Stream (anti-corruption - external service)
      // Get full user data from repository for Stream
      try {
        const fullUserData = await this.userRepository.findById(user.id);
        await upsertStreamUser({
          id: user.id,
          name: fullName,
          image: profilePic || '',
        });
      } catch (streamError) {
        console.error('Error creating Stream user:', streamError);
        // Don't fail the request if Stream fails
      }

      // Generate JWT token (infrastructure concern)
      const token = this._generateToken(user.id);

      // Set cookie
      this._setAuthCookie(res, token);

      // Return response
      res.status(201).json({
        success: true,
        user: {
          _id: user.id,
          email: user.email,
          isOnboarded: user.isOnboarded,
        },
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  /**
   * Login handler
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Execute use case
      const user = await this.loginUseCase.execute({ email, password });

      // Generate JWT token
      const token = this._generateToken(user.id);

      // Set cookie
      this._setAuthCookie(res, token);

      // Return response
      res.status(200).json({
        success: true,
        user: {
          _id: user.id,
          email: user.email,
          isOnboarded: user.isOnboarded,
        },
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  /**
   * Onboard handler
   */
  async onboard(req, res) {
    try {
      const userId = req.user._id || req.user.id;
      const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

      // Validate required fields
      if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
        return res.status(400).json({
          message: 'All fields are required',
          missingFields: [
            !fullName && 'fullName',
            !bio && 'bio',
            !nativeLanguage && 'nativeLanguage',
            !learningLanguage && 'learningLanguage',
            !location && 'location',
          ].filter(Boolean),
        });
      }

      // Execute use case with profile data (for migration compatibility)
      const user = await this.onboardUseCase.execute({
        userId,
        profileData: {
          fullName,
          bio,
          nativeLanguage,
          learningLanguage,
          location,
        },
      });

      // Sync with Stream (anti-corruption)
      // Get full user data from repository
      try {
        const fullUser = await this.userRepository.findById(userId);
        if (fullUser) {
          // Get additional profile data from Mongoose model
          const UserModel = (await import('../../infrastructure/persistence/UserModel.js')).default;
          const userDoc = await UserModel.findById(userId);
          if (userDoc) {
            await upsertStreamUser({
              id: user.id,
              name: userDoc.fullName || 'User',
              image: userDoc.profilePic || '',
            });
          }
        }
      } catch (streamError) {
        console.error('Error updating Stream user:', streamError);
      }

      // Return response
      res.status(200).json({
        success: true,
        user: {
          _id: user.id,
          email: user.email,
          isOnboarded: user.isOnboarded,
        },
      });
    } catch (error) {
      this._handleError(error, res);
    }
  }

  /**
   * Logout handler
   */
  logout(req, res) {
    res.clearCookie('jwt');
    res.status(200).json({ success: true, message: 'Logout successful' });
  }

  /**
   * Generates JWT token
   * @private
   */
  _generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: '7d',
    });
  }

  /**
   * Sets authentication cookie
   * @private
   */
  _setAuthCookie(res, token) {
    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  /**
   * Handles errors and maps to HTTP responses
   * @private
   */
  _handleError(error, res) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    if (error instanceof DuplicateEmailError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({ message: error.message });
    }

    // Unknown error
    console.error('Unexpected error in AuthController:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Create singleton instance
const authController = new AuthController();

// Export handlers
export const signup = (req, res) => authController.signup(req, res);
export const login = (req, res) => authController.login(req, res);
export const onboard = (req, res) => authController.onboard(req, res);
export const logout = (req, res) => authController.logout(req, res);

