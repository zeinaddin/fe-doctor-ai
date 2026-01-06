import api from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export const authService = {
  /**
   * Login user and fetch profile
   * 1. Send credentials to /users/login
   * 2. Receive access_token and refresh_token
   * 3. Store both tokens
   * 4. Fetch user profile from /users/me
   * 5. Store user data
   * 6. Return user object
   */
  async login(credentials: LoginRequest): Promise<User> {
    // Step 1: Login and get tokens
    const loginResponse = await api.post<LoginResponse>('/users/login', credentials);
    const { access_token, refresh_token } = loginResponse.data;

    // Step 2: Store tokens
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

    // Step 3: Fetch user profile with the new access token
    // The api interceptor will automatically attach the token
    const userResponse = await api.get<User>('/users/me');
    const user = userResponse.data;

    // Step 4: Store user data
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<User> {
    const response = await api.post<User>('/users/register', userData);
    return response.data;
  },

  /**
   * Logout user and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // Optional: call backend logout endpoint if exists
      // await api.post('/users/logout');
    } finally {
      // Clear all auth data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Get current user profile from backend
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    const user = response.data;

    // Update stored user data
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Call refresh endpoint if it exists in your backend
      // For now, we'll assume the endpoint structure
      const response = await api.post<LoginResponse>('/users/refresh', {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: new_refresh_token } = response.data;

      // Update stored tokens
      localStorage.setItem(TOKEN_KEY, access_token);
      if (new_refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, new_refresh_token);
      }

      return access_token;
    } catch (error) {
      // If refresh fails, clear auth data
      this.logout();
      throw error;
    }
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  /**
   * Set tokens (useful for testing or external login)
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /**
   * Clear all auth data
   */
  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
