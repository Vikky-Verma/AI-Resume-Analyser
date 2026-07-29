/**
 * Generic zod validation middleware.
 * Usage: router.post("/register", validate(registerSchema), handler)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors,
    });
  }

  // Replace req.body with the parsed/sanitized data (trimmed, lowercased email, etc.)
  req.body = result.data;
  next();
};

module.exports = validate;