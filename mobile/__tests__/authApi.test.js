jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  })),
  post: jest.fn(),
}));

import axios from 'axios';
import api from '../apis/apiClient';
import { register, login } from '../apis/authApi';

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = { data: { user: { id: 1, name: 'Test' }, token: 'token123' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await register('Test', 'test@example.com', 'password', 'password', 'admin');

      expect(api.post).toHaveBeenCalledWith('/register', {
        name: 'Test',
        email: 'test@example.com',
        password: 'password',
        password_confirmation: 'password',
        role: 'admin'
      });
      expect(result).toEqual({ success: true, data: mockResponse.data });
    });

    it('should handle register error', async () => {
      const mockError = { response: { data: { message: 'Error registering' } } };
      api.post.mockRejectedValue(mockError);

      const result = await register('Test', 'test@example.com', 'password', 'password', 'admin');

      expect(result).toEqual({ success: false, error: 'Error registering' });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = { data: { user: { id: 1, name: 'Test' }, token: 'token123' } };
      api.post.mockResolvedValue(mockResponse);

      const result = await login('test@example.com', 'password');

      expect(api.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(result).toEqual({ success: true, data: mockResponse.data });
    });

    it('should handle login error', async () => {
      const mockError = { response: { data: { error: 'Invalid credentials' } } };
      api.post.mockRejectedValue(mockError);

      const result = await login('test@example.com', 'wrongpassword');

      expect(result).toEqual({ success: false, error: 'Invalid credentials' });
    });
  });
});