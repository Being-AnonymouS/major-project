import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize string input by trimming and removing potentially harmful characters
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Validate registration input
 */
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password, name, role } = req.body;

  const errors: string[] = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (typeof password !== 'string') {
    errors.push('Password must be a string');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Validate name
  if (!name) {
    errors.push('Name is required');
  } else if (typeof name !== 'string') {
    errors.push('Name must be a string');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  // Validate role
  if (!role) {
    errors.push('Role is required');
  } else if (!['MENTOR', 'MENTEE', 'ADMIN'].includes(role)) {
    errors.push('Role must be MENTOR, MENTEE, or ADMIN');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
    return;
  }

  // Sanitize inputs
  req.body.email = sanitizeString(email).toLowerCase();
  req.body.name = sanitizeString(name);
  req.body.role = role.toUpperCase();

  next();
};

/**
 * Validate login input
 */
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  const errors: string[] = [];

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (typeof password !== 'string') {
    errors.push('Password must be a string');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
    return;
  }

  // Sanitize email
  req.body.email = sanitizeString(email).toLowerCase();

  next();
};

/**
 * Validate profile update input
 */
export const validateProfileUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, expertise, bio, yearsExperience, availabilitySlots, institute, course, goals } = req.body;

  const errors: string[] = [];

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push('Name must be a string');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
  }

  // Validate mentor-specific fields
  if (expertise !== undefined) {
    if (!Array.isArray(expertise)) {
      errors.push('Expertise must be an array');
    } else if (expertise.length === 0) {
      errors.push('At least one expertise area is required');
    } else {
      for (const exp of expertise) {
        if (typeof exp !== 'string' || exp.trim().length === 0) {
          errors.push('Each expertise must be a non-empty string');
          break;
        }
      }
    }
  }

  if (bio !== undefined && typeof bio !== 'string') {
    errors.push('Bio must be a string');
  }

  if (yearsExperience !== undefined) {
    if (typeof yearsExperience !== 'number' || yearsExperience < 0) {
      errors.push('Years of experience must be a non-negative number');
    }
  }

  if (availabilitySlots !== undefined) {
    if (!Array.isArray(availabilitySlots)) {
      errors.push('Availability slots must be an array');
    } else {
      for (const slot of availabilitySlots) {
        if (!slot.day || !slot.startTime || !slot.endTime) {
          errors.push('Each availability slot must have day, startTime, and endTime');
          break;
        }
        if (typeof slot.day !== 'string' || typeof slot.startTime !== 'string' || typeof slot.endTime !== 'string') {
          errors.push('Availability slot fields must be strings');
          break;
        }
      }
    }
  }

  // Validate mentee-specific fields
  if (institute !== undefined && typeof institute !== 'string') {
    errors.push('Institute must be a string');
  }

  if (course !== undefined && typeof course !== 'string') {
    errors.push('Course must be a string');
  }

  if (goals !== undefined && typeof goals !== 'string') {
    errors.push('Goals must be a string');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
    return;
  }

  // Sanitize string inputs
  if (name !== undefined) {
    req.body.name = sanitizeString(name);
  }
  if (bio !== undefined) {
    req.body.bio = sanitizeString(bio);
  }
  if (institute !== undefined) {
    req.body.institute = sanitizeString(institute);
  }
  if (course !== undefined) {
    req.body.course = sanitizeString(course);
  }
  if (goals !== undefined) {
    req.body.goals = sanitizeString(goals);
  }

  next();
};

/**
 * Validate mentor profile completeness
 */
export const validateMentorProfileComplete = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message: 'User not authenticated',
        code: 'NOT_AUTHENTICATED',
      },
    });
    return;
  }

  // This middleware would typically check if mentor has completed required fields
  // For now, we'll just pass through and let the service handle validation
  next();
};

/**
 * Validate mentee profile completeness
 */
export const validateMenteeProfileComplete = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message: 'User not authenticated',
        code: 'NOT_AUTHENTICATED',
      },
    });
    return;
  }

  // This middleware would typically check if mentee has completed required fields
  // For now, we'll just pass through and let the service handle validation
  next();
};

/**
 * Validate search query parameters
 */
export const validateMentorSearch = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page, limit } = req.query;

  const errors: string[] = [];

  // Validate page parameter
  if (page !== undefined) {
    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    }
  }

  // Validate limit parameter
  if (limit !== undefined) {
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be a positive integer between 1 and 100');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
    return;
  }

  next();
};

/**
 * Validate appointment creation input
 */
export const validateAppointmentCreation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { mentorId, datetime } = req.body;

  const errors: string[] = [];

  // Validate mentorId
  if (!mentorId) {
    errors.push('Mentor ID is required');
  } else if (typeof mentorId !== 'string') {
    errors.push('Mentor ID must be a string');
  }

  // Validate datetime
  if (!datetime) {
    errors.push('Datetime is required');
  } else {
    const appointmentDate = new Date(datetime);
    if (isNaN(appointmentDate.getTime())) {
      errors.push('Invalid datetime format');
    } else if (appointmentDate <= new Date()) {
      errors.push('Appointment must be scheduled for a future date');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
    return;
  }

  // Sanitize mentorId
  req.body.mentorId = sanitizeString(mentorId);

  next();
};

/**
 * Validate appointment ID parameter
 */
export const validateAppointmentId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Appointment ID is required',
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  if (typeof id !== 'string' || id.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid appointment ID format',
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  next();
};

/**
 * Validate message creation input
 */
export const validateMessageCreation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { appointmentId, text } = req.body;

  const errors: string[] = [];

  // Validate appointmentId
  if (!appointmentId) {
    errors.push('Appointment ID is required');
  } else if (typeof appointmentId !== 'string' || appointmentId.trim().length === 0) {
    errors.push('Appointment ID must be a non-empty string');
  }

  // Validate text
  if (!text) {
    errors.push('Message text is required');
  } else if (typeof text !== 'string') {
    errors.push('Message text must be a string');
  } else if (text.trim().length === 0) {
    errors.push('Message text cannot be empty');
  } else if (text.length > 1000) {
    errors.push('Message text cannot exceed 1000 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
    return;
  }

  // Sanitize inputs
  req.body.appointmentId = sanitizeString(appointmentId);
  req.body.text = sanitizeString(text);

  next();
};

/**
 * Validate message query parameters
 */
export const validateMessageQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page, limit } = req.query;

  const errors: string[] = [];

  // Validate page parameter
  if (page !== undefined) {
    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    }
  }

  // Validate limit parameter
  if (limit !== undefined) {
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be a positive integer between 1 and 100');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
    return;
  }

  next();
};
/**

 * Validate rating submission input
 */
export const validateRatingSubmission = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { appointmentId, score, comments } = req.body;

  const errors: string[] = [];

  // Validate appointmentId
  if (!appointmentId) {
    errors.push('Appointment ID is required');
  } else if (typeof appointmentId !== 'string' || appointmentId.trim().length === 0) {
    errors.push('Appointment ID must be a non-empty string');
  }

  // Validate score
  if (score === undefined || score === null) {
    errors.push('Score is required');
  } else if (typeof score !== 'number') {
    errors.push('Score must be a number');
  } else if (!Number.isInteger(score)) {
    errors.push('Score must be an integer');
  } else if (score < 1 || score > 5) {
    errors.push('Score must be between 1 and 5');
  }

  // Validate comments (optional)
  if (comments !== undefined && comments !== null) {
    if (typeof comments !== 'string') {
      errors.push('Comments must be a string');
    } else if (comments.length > 500) {
      errors.push('Comments cannot exceed 500 characters');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
    });
    return;
  }

  // Sanitize inputs
  req.body.appointmentId = sanitizeString(appointmentId);
  if (comments) {
    req.body.comments = sanitizeString(comments);
  }

  next();
};