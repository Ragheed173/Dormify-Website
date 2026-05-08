const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGISTER_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@(gmail\.com|stu\.najah\.edu)$/
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/
const PHONE_PATTERN = /^\+?[0-9\s-]{7,30}$/
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const isBlank = (value) => value === undefined || value === null || String(value).trim() === ''

const isValidDateOnly = (value) => {
  if (!DATE_ONLY_PATTERN.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const isValidUrlLike = (value) => {
  if (typeof value !== 'string' || value.trim() === '') return false
  if (value.startsWith('/')) return true

  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch (error) {
    return false
  }
}

const firstError = (...checks) => checks.find(Boolean) || ''

export const parseImageUrls = (value) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

export const validateEmail = (email) => {
  if (isBlank(email)) return 'Email is required'
  if (!EMAIL_PATTERN.test(String(email).trim())) return 'Email must be a valid email address'
  return ''
}

export const validateRegisterEmail = (email) => {
  if (isBlank(email)) return 'Email is required'
  if (!REGISTER_EMAIL_PATTERN.test(String(email).trim())) {
    return 'Email must end with @gmail.com or @stu.najah.edu'
  }
  return ''
}

export const validatePassword = (password) => {
  if (isBlank(password)) return 'Password is required'
  if (!PASSWORD_PATTERN.test(password)) {
    return 'Password must be at least 8 characters and include one uppercase letter, one number, and one special character'
  }
  return ''
}

export const validatePhone = (phone) => {
  if (isBlank(phone)) return ''
  if (!PHONE_PATTERN.test(String(phone).trim())) {
    return 'Phone must contain 7 to 30 digits and may include +, spaces, or hyphens'
  }
  return ''
}

export const validateProfileForm = ({ name, email, phone }) =>
  firstError(
    isBlank(name) ? 'Name is required' : '',
    !isBlank(name) && String(name).trim().length < 2 ? 'Name must be at least 2 characters' : '',
    !isBlank(name) && String(name).trim().length > 120 ? 'Name must be at most 120 characters' : '',
    validateEmail(email),
    validatePhone(phone)
  )

export const validateLoginForm = ({ email, password }) =>
  firstError(validateEmail(email), isBlank(password) ? 'Password is required' : '')

export const validateRegisterForm = ({ name, email, password, phone, role }) =>
  firstError(
    isBlank(name) ? 'Name is required' : '',
    !isBlank(name) && String(name).trim().length < 2 ? 'Name must be at least 2 characters' : '',
    !isBlank(name) && String(name).trim().length > 120 ? 'Name must be at most 120 characters' : '',
    validateRegisterEmail(email),
    validatePassword(password),
    validatePhone(phone),
    !['student', 'owner'].includes(role) ? 'Account type must be student or owner' : ''
  )

export const validateUserForm = ({ name, email, phone, role }) =>
  firstError(
    validateProfileForm({ name, email, phone }),
    !['student', 'owner', 'admin'].includes(role) ? 'Role must be student, owner, or admin' : ''
  )

export const validateBookingForm = ({ start_date, end_date, notes }) =>
  firstError(
    isBlank(start_date) ? 'Start date is required' : '',
    !isBlank(start_date) && !isValidDateOnly(start_date) ? 'Start date must use YYYY-MM-DD format' : '',
    isBlank(end_date) ? 'End date is required' : '',
    !isBlank(end_date) && !isValidDateOnly(end_date) ? 'End date must use YYYY-MM-DD format' : '',
    start_date && end_date && end_date <= start_date ? 'End date must be after start date' : '',
    String(notes || '').length > 1000 ? 'Notes must be at most 1000 characters' : ''
  )

export const validateHousingFilters = ({ search, minPrice, maxPrice }) => {
  const min = minPrice === '' ? null : Number(minPrice)
  const max = maxPrice === '' ? null : Number(maxPrice)

  return firstError(
    String(search || '').length > 100 ? 'Search must be at most 100 characters' : '',
    minPrice !== '' && !Number.isFinite(min) ? 'Minimum price must be a valid number' : '',
    min !== null && min < 0 ? 'Minimum price must be at least 0' : '',
    maxPrice !== '' && !Number.isFinite(max) ? 'Maximum price must be a valid number' : '',
    max !== null && max < 0 ? 'Maximum price must be at least 0' : '',
    min !== null && max !== null && max < min ? 'Maximum price must be greater than or equal to minimum price' : ''
  )
}

export const validateHousingForm = (form, { includeImages = false } = {}) => {
  const price = Number(form.price)
  const availableRooms = Number(form.available_rooms)
  const imageUrls = parseImageUrls(form.image_urls)

  return firstError(
    isBlank(form.title) ? 'Title is required' : '',
    !isBlank(form.title) && String(form.title).trim().length < 3 ? 'Title must be at least 3 characters' : '',
    !isBlank(form.title) && String(form.title).trim().length > 150 ? 'Title must be at most 150 characters' : '',
    String(form.description || '').length > 2000 ? 'Description must be at most 2000 characters' : '',
    isBlank(form.location) ? 'Location is required' : '',
    !isBlank(form.location) && String(form.location).trim().length < 2 ? 'Location must be at least 2 characters' : '',
    !isBlank(form.location) && String(form.location).trim().length > 120 ? 'Location must be at most 120 characters' : '',
    isBlank(form.price) ? 'Price is required' : '',
    !Number.isFinite(price) ? 'Price must be a valid number' : '',
    Number.isFinite(price) && price < 0 ? 'Price must be at least 0' : '',
    !['male', 'female', 'both'].includes(form.gender_allowed) ? 'Gender must be male, female, or both' : '',
    !['single', 'double', 'triple'].includes(form.room_type) ? 'Room type must be single, double, or triple' : '',
    isBlank(form.available_rooms) ? 'Available rooms is required' : '',
    !Number.isInteger(availableRooms) ? 'Available rooms must be a valid integer' : '',
    Number.isInteger(availableRooms) && availableRooms < 0 ? 'Available rooms must be at least 0' : '',
    form.status === 'available' && availableRooms <= 0
      ? 'Available rooms must be at least 1 when status is available'
      : '',
    !['available', 'unavailable'].includes(form.status) ? 'Status must be available or unavailable' : '',
    includeImages && imageUrls.length > 20 ? 'Image URLs must contain at most 20 items' : '',
    includeImages && imageUrls.some((url) => !isValidUrlLike(url)) ? 'Image URLs must be valid URLs or local paths' : ''
  )
}

export const buildHousingPayload = (form, { includeImages = false } = {}) => {
  const payload = {
    title: String(form.title || '').trim(),
    description: String(form.description || '').trim(),
    location: String(form.location || '').trim(),
    price: Number(form.price),
    gender_allowed: form.gender_allowed,
    room_type: form.room_type,
    available_rooms: Number(form.available_rooms),
    status: form.status,
  }

  if (includeImages) {
    payload.image_urls = parseImageUrls(form.image_urls)
  }

  return payload
}
