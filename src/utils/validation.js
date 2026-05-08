const isBlank = (value) => value === undefined || value === null || String(value).trim() === ''

const isValidEmail = (value) => {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed === '' || trimmed.includes(' ')) return false

  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false

  const domain = trimmed.slice(atIndex + 1)
  const dotIndex = domain.indexOf('.')
  if (dotIndex <= 0 || dotIndex === domain.length - 1) return false

  return !domain.split('.').some((part) => part === '')
}

const isAllowedRegisterEmail = (value) => {
  if (!isValidEmail(value)) return false
  const email = String(value).trim().toLowerCase()
  return email.endsWith('@gmail.com') || email.endsWith('@stu.najah.edu')
}

const isValidPassword = (value) => {
  if (typeof value !== 'string' || value.length < 8) return false

  let hasUpper = false
  let hasDigit = false
  let hasSpecial = false
  const specialChars = `!@#$%^&*()_-+=[\\]{};':"\\|,.<>/?`

  for (const char of value) {
    if (char >= 'A' && char <= 'Z') hasUpper = true
    else if (char >= '0' && char <= '9') hasDigit = true
    else if (specialChars.includes(char)) hasSpecial = true
  }

  return hasUpper && hasDigit && hasSpecial
}

const isValidPhone = (value) => {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed === '') return false

  let digits = 0
  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i]
    if (char === '+' && i === 0) continue
    if (char === ' ' || char === '-') continue
    if (char >= '0' && char <= '9') digits += 1
    else return false
  }

  return digits >= 7 && digits <= 30
}

const isValidDateOnly = (value) => {
  if (typeof value !== 'string' || value.length !== 10) return false
  if (value[4] !== '-' || value[7] !== '-') return false

  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(5, 7))
  const day = Number(value.slice(8, 10))
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false
  if (month < 1 || month > 12) return false

  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) return false

  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}` === value
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
  if (!isValidEmail(email)) return 'Email must be a valid email address'
  return ''
}

export const validateRegisterEmail = (email) => {
  if (isBlank(email)) return 'Email is required'
  if (!isAllowedRegisterEmail(email)) {
    return 'Email must end with @gmail.com or @stu.najah.edu'
  }
  return ''
}

export const validatePassword = (password) => {
  if (isBlank(password)) return 'Password is required'
  if (!isValidPassword(password)) {
    return 'Password must be at least 8 characters and include one uppercase letter, one number, and one special character'
  }
  return ''
}

export const validatePhone = (phone) => {
  if (isBlank(phone)) return ''
  if (!isValidPhone(phone)) {
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

export const validateAiExplainForm = ({ topic }) =>
  firstError(
    isBlank(topic) ? 'Topic is required' : '',
    !isBlank(topic) && String(topic).trim().length < 2 ? 'Topic must be at least 2 characters' : '',
    !isBlank(topic) && String(topic).trim().length > 500 ? 'Topic must be at most 500 characters' : ''
  )

export const validateAiHousingSearchForm = ({ query }) =>
  firstError(
    isBlank(query) ? 'Student request is required' : '',
    !isBlank(query) && String(query).trim().length < 2
      ? 'Student request must be at least 2 characters'
      : '',
    !isBlank(query) && String(query).trim().length > 500
      ? 'Student request must be at most 500 characters'
      : ''
  )

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
