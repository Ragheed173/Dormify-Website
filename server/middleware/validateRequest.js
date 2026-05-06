const AppError = require("../utils/AppError");

const isEmpty = (value, allowEmpty = false) => {
  if (value === undefined || value === null) return true;
  return !allowEmpty && typeof value === "string" && value.trim() === "";
};

const isValidDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isValidUrlLike = (value) => {
  if (typeof value !== "string" || value.trim() === "") return false;
  if (value.startsWith("/")) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch (error) {
    return false;
  }
};

const addError = (errors, field, message) => {
  errors.push({ field, message });
};

const validateValue = (req, sourceName, source, field, rules, errors) => {
  const label = rules.label || field;
  const rawValue = source[field];

  if (isEmpty(rawValue, rules.allowEmpty)) {
    if (rules.required) {
      addError(errors, field, `${label} is required`);
    } else if (Object.prototype.hasOwnProperty.call(source, field)) {
      delete source[field];
    }
    return;
  }

  let value = rawValue;

  if (typeof value === "string" && rules.trim !== false) {
    value = value.trim();
    source[field] = value;
  }

  if (rules.type === "string") {
    if (typeof value !== "string") {
      addError(errors, field, `${label} must be a string`);
      return;
    }
  }

  if (rules.type === "email") {
    if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      addError(errors, field, `${label} must be a valid email address`);
      return;
    }
    source[field] = value.toLowerCase();
    value = source[field];
  }

  if (rules.type === "password") {
    if (typeof value !== "string") {
      addError(errors, field, `${label} must be a string`);
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(value)) {
      addError(
        errors,
        field,
        `${label} must be at least 8 characters and include at least one letter and one number`
      );
      return;
    }
  }

  if (rules.type === "enum" && !rules.values.includes(value)) {
    addError(errors, field, `${label} must be one of: ${rules.values.join(", ")}`);
    return;
  }

  if (rules.type === "number") {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      addError(errors, field, `${label} must be a valid number`);
      return;
    }
    source[field] = numberValue;
    value = numberValue;
  }

  if (rules.type === "integer") {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue)) {
      addError(errors, field, `${label} must be a valid integer`);
      return;
    }
    source[field] = numberValue;
    value = numberValue;
  }

  if (rules.type === "date" && !isValidDateOnly(value)) {
    addError(errors, field, `${label} must use YYYY-MM-DD format`);
    return;
  }

  if (rules.type === "array") {
    if (!Array.isArray(value)) {
      addError(errors, field, `${label} must be an array`);
      return;
    }

    if (rules.maxItems !== undefined && value.length > rules.maxItems) {
      addError(errors, field, `${label} must contain at most ${rules.maxItems} items`);
      return;
    }

    if (rules.itemType === "url") {
      const invalidIndex = value.findIndex((item) => !isValidUrlLike(item));
      if (invalidIndex !== -1) {
        addError(errors, field, `${label} contains an invalid URL at index ${invalidIndex}`);
        return;
      }
    }

    if (rules.itemType === "string") {
      const invalidIndex = value.findIndex((item) => typeof item !== "string");
      if (invalidIndex !== -1) {
        addError(errors, field, `${label} contains a non-string item at index ${invalidIndex}`);
        return;
      }
    }
  }

  if (rules.minLength !== undefined && value.length < rules.minLength) {
    addError(errors, field, `${label} must be at least ${rules.minLength} characters`);
    return;
  }

  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    addError(errors, field, `${label} must be at most ${rules.maxLength} characters`);
    return;
  }

  if (rules.min !== undefined && value < rules.min) {
    addError(errors, field, `${label} must be at least ${rules.min}`);
    return;
  }

  if (rules.max !== undefined && value > rules.max) {
    addError(errors, field, `${label} must be at most ${rules.max}`);
    return;
  }

  if (rules.custom) {
    const message = rules.custom(value, { req, sourceName, source, field });
    if (message) {
      addError(errors, field, message);
    }
  }
};

const validateRequest = (schema) => (req, res, next) => {
  const errors = [];

  Object.entries(schema).forEach(([sourceName, fields]) => {
    const source = req[sourceName] || {};

    Object.entries(fields).forEach(([field, rules]) => {
      validateValue(req, sourceName, source, field, rules, errors);
    });
  });

  if (errors.length > 0) {
    return next(
      new AppError("Validation failed", 400, "VALIDATION_ERROR", errors)
    );
  }

  return next();
};

module.exports = validateRequest;
