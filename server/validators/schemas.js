const idParam = {
  params: {
    id: { type: "integer", required: true, min: 1 },
  },
};

const register = {
  body: {
    name: { type: "string", required: true, minLength: 2, maxLength: 120 },
    email: { type: "email", required: true, maxLength: 160 },
    password: { type: "password", required: true },
    phone: { type: "phone", allowEmpty: true },
    role: {
      type: "enum",
      values: ["student", "owner"],
    },
  },
};

const login = {
  body: {
    email: { type: "email", required: true, maxLength: 160 },
    password: { type: "string", required: true, minLength: 1 },
  },
};

const profileUpdate = {
  body: {
    name: { type: "string", minLength: 2, maxLength: 120 },
    email: { type: "email", maxLength: 160 },
    phone: { type: "phone", allowEmpty: true },
  },
};

const userUpdate = {
  body: {
    ...profileUpdate.body,
    role: {
      type: "enum",
      values: ["student", "owner", "admin"],
    },
  },
};

const housingBody = (isCreate = false) => ({
  body: {
    title: {
      type: "string",
      required: isCreate,
      minLength: 3,
      maxLength: 150,
    },
    description: {
      type: "string",
      maxLength: 2000,
      allowEmpty: true,
    },
    location: {
      type: "string",
      required: isCreate,
      minLength: 2,
      maxLength: 120,
    },
    price: {
      type: "number",
      required: isCreate,
      min: 0,
    },
    gender_allowed: {
      type: "enum",
      values: ["male", "female", "both"],
    },
    room_type: {
      type: "enum",
      required: isCreate,
      values: ["single", "double", "triple"],
    },
    available_rooms: {
      type: "integer",
      required: isCreate,
      min: 0,
      custom: (value, { req }) => {
        const status = req.body.status || "available";
        if (status === "available" && value <= 0) {
          return "available_rooms must be at least 1 when status is available";
        }
        return null;
      },
    },
    status: {
      type: "enum",
      values: ["available", "unavailable"],
    },
    image_urls: {
      type: "array",
      itemType: "url",
      maxItems: 20,
    },
  },
});

const adminHousingCreate = {
  body: {
    ...housingBody(true).body,
    owner_id: {
      type: "integer",
      required: true,
      min: 1,
    },
  },
};

const housingQuery = {
  query: {
    search: { type: "string", maxLength: 100 },
    minPrice: { type: "number", min: 0 },
    maxPrice: {
      type: "number",
      min: 0,
      custom: (value, { req }) => {
        if (req.query.minPrice !== undefined && value < req.query.minPrice) {
          return "maxPrice must be greater than or equal to minPrice";
        }
        return null;
      },
    },
    gender_allowed: {
      type: "enum",
      values: ["male", "female", "both"],
    },
    room_type: {
      type: "enum",
      values: ["single", "double", "triple"],
    },
    status: {
      type: "enum",
      values: ["available", "unavailable"],
    },
    page: { type: "integer", min: 1 },
    limit: { type: "integer", min: 1, max: 50 },
  },
};

const bookingCreate = {
  body: {
    housing_id: { type: "integer", required: true, min: 1 },
    start_date: { type: "date", required: true },
    end_date: {
      type: "date",
      required: true,
      custom: (value, { req }) => {
        if (req.body.start_date && value <= req.body.start_date) {
          return "end_date must be after start_date";
        }
        return null;
      },
    },
    notes: { type: "string", maxLength: 1000, allowEmpty: true },
  },
};

const bookingStatus = {
  body: {
    status: {
      type: "enum",
      required: true,
      values: ["pending", "confirmed", "cancelled", "rejected"],
    },
  },
};

const ownerBookingStatus = {
  body: {
    status: {
      type: "enum",
      required: true,
      values: ["confirmed", "rejected", "cancelled"],
    },
  },
};

const aiExplain = {
  body: {
    topic: {
      type: "string",
      required: true,
      minLength: 2,
      maxLength: 500,
    },
  },
};

module.exports = {
  idParam,
  register,
  login,
  profileUpdate,
  userUpdate,
  housingBody,
  adminHousingCreate,
  housingQuery,
  bookingCreate,
  bookingStatus,
  ownerBookingStatus,
  aiExplain,
};
