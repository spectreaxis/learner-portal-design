/**
 * Authentication Provider Interface
 *
 * This interface abstracts authentication logic, allowing the application to switch
 * between different auth providers (JWT, Supabase, Firebase, etc.) without code changes.
 */

export interface IAuthProvider {
  /**
   * Register a new user
   * @param email - User email
   * @param password - User password
   * @param name - User name
   * @returns Auth token and user data
   */
  register(
    email: string,
    password: string,
    name: string
  ): Promise<{
    token: string;
    user: { id: string; email: string; name: string };
  }>;

  /**
   * Login user
   * @param email - User email
   * @param password - User password
   * @returns Auth token and user data
   */
  login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    user: { id: string; email: string; name: string };
  }>;

  /**
   * Verify authentication token
   * @param token - Authentication token
   * @returns userId - The authenticated user's ID
   * @throws Error if token is invalid or expired
   */
  verifyToken(token: string): Promise<string>;

  /**
   * The user a token was issued to, checked by its signature alone (no
   * database lookup), so it is cheap enough to run before authentication
   * @param token - Authentication token
   * @returns userId, or null if the token is invalid or expired
   */
  getTokenSubject(token: string): string | null;

  /**
   * Change user password
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void>;
}
