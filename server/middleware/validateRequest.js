const AppError = require("../utils/AppError");

const isEmpty = (value, allowEmpty = false) => {
  if (value === undefined || value === null) return true;
  return !allowEmpty && typeof value === "string" && value.trim() === "";
};

const isValidEmail = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.includes(" ")) return false;

  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false;

  const domain = trimmed.slice(atIndex + 1);
  const dotIndex = domain.indexOf(".");
  if (dotIndex <= 0 || dotIndex === domain.length - 1) return false;

  return !domain.split(".").some((part) => part === "");
};

const isStrongPassword = (value) => {
  if (typeof value !== "string" || value.length < 8) return false;

  let hasUpper = false;
  let hasDigit = false;
  let hasSpecial = false;
  const specialChars = "!@#$%^&*()_-+=[\\]{};':\"\\|,.<>/?";

  for (const char of value) {
    if (char >= "A" && char <= "Z") hasUpper = true;
    else if (char >= "0" && char <= "9") hasDigit = true;
    else if (specialChars.includes(char)) hasSpecial = true;
  }

  return hasUpper && hasDigit && hasSpecial;
};

const isValidPhone = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed === "") return false;

  let digits = 0;
  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    if (char === "+" && i === 0) continue;
    if (char === " " || char === "-") continue;
    if (char >= "0" && char <= "9") digits += 1;
    else return false;
  }

  return digits >= 7 && digits <= 30;
};

const isValidDateOnly = (value) => {
  if (typeof value !== "string" || value.length !== 10) return false;
  if (value[4] !== "-" || value[7] !== "-") return false;

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}` === value;
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

  if (rules.allowEmpty && value === "") {
    return;
  }

  if (rules.type === "string") {
    if (typeof value !== "string") {
      addError(errors, field, `${label} must be a string`);
      return;
    }
  }

  if (rules.type === "email") {
    if (typeof value !== "string" || !isValidEmail(value)) {
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
    if (!isStrongPassword(value)) {
      addError(
        errors,
        field,
        `${label} must be at least 8 characters and include one uppercase letter, one number, and one special character`
      );
      return;
    }
  }

  if (rules.type === "phone") {
    if (typeof value !== "string" || !isValidPhone(value)) {
      addError(
        errors,
        field,
        `${label} must contain 7 to 30 digits and may include +, spaces, or hyphens`
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
