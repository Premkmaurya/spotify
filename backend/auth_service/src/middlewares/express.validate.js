const { body, validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ errors: errors.array() });
  };
};

const registerValidation = [
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  oneOf(
    [
      // Path 1: Username is present and valid
      body("username")
        .trim()
        .notEmpty()
        .withMessage("Username cannot be empty")
        .isAlphanumeric()
        .withMessage("Username must be alphanumeric"),

      // Path 2: Email is present and valid
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email cannot be empty")
        .isEmail()
        .withMessage("Must be a valid email address"),
    ],
    {
      // Custom error message if BOTH validation paths fail
      message:
        "You must provide either a valid username or a valid email address.",
    },
  ),
  body("password").notEmpty().withMessage("Password is required"),
];


module.exports = {
    validate,
    registerValidation,
    loginValidation,
};