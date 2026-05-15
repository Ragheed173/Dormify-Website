const multer = require('multer')
const path = require('path')
const fs = require('fs')
const AppError = require('../utils/AppError')

const uploadDir = path.join(__dirname, '../uploads/housings')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp'])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, uniqueName)
  },
})

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowedExtensions.has(ext)) {
    cb(null, true)
    return
  }

  cb(new AppError('Only JPG, PNG, GIF, and WebP images are allowed', 400, 'INVALID_IMAGE_TYPE'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 20,
  },
})

module.exports = upload.array('images', 20)