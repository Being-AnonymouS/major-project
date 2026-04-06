import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};