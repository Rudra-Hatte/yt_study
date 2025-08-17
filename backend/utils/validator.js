const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: errors.array()[0].msg,
      details: errors.array()
    });
  }
  next();
};

// Course validation rules
const validateCourseCreation = [
  body('youtubeUrl')
    .isURL()
    .withMessage('Please provide a valid YouTube URL')
    .matches(/youtube\.com|youtu\.be/)
    .withMessage('URL must be from YouTube'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .optional()
    .isIn(['technology', 'science', 'business', 'arts', 'language', 'health', 'lifestyle', 'education', 'other'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// User registration validation
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

module.exports = {
  validateCourseCreation,
  validateRegistration,
  validateLogin,
  handleValidationErrors
};