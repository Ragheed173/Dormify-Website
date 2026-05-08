const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const PORT = process.env.PORT || 5000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dormify API",
      version: "1.0.0",
      description:
        "API documentation for the Dormify student housing platform.",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${PORT}`,
        description: "Local server",
      },
    ],
    tags: [
      { name: "Health", description: "Server health checks" },
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Home", description: "Homepage data endpoints" },
      { name: "Housings", description: "Public housing listings" },
      { name: "Bookings", description: "Booking management" },
      { name: "Student", description: "Student account endpoints" },
      { name: "Owner", description: "Owner dashboard endpoints" },
      { name: "Admin", description: "Admin dashboard endpoints" },
      { name: "AI", description: "AI explanation endpoints" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiMessage: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            code: { type: "string" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Validation failed" },
            code: { type: "string", example: "VALIDATION_ERROR" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: {
                    type: "string",
                    example: "email must be a valid email address",
                  },
                },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Ragheed Ahmad" },
            email: { type: "string", format: "email", example: "user@example.com" },
            phone: { type: "string", nullable: true, example: "0599123456" },
            role: {
              type: "string",
              enum: ["student", "admin", "owner"],
              example: "student",
            },
            google_id: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Ragheed Ahmad" },
            email: { type: "string", format: "email", example: "user@example.com" },
            phone: { type: "string", nullable: true, example: "0599123456" },
            role: {
              type: "string",
              enum: ["student", "admin", "owner"],
              example: "student",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: { type: "string" },
            user: { $ref: "#/components/schemas/AuthUser" },
          },
        },
        HousingImage: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            housing_id: { type: "integer", example: 4 },
            image_url: {
              type: "string",
              example: "https://example.com/housing.jpg",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Housing: {
          type: "object",
          properties: {
            id: { type: "integer", example: 4 },
            title: { type: "string", example: "Modern student studio" },
            description: {
              type: "string",
              nullable: true,
              example: "Close to campus with shared kitchen.",
            },
            location: { type: "string", example: "Nablus" },
            price: { type: "number", format: "float", example: 450 },
            gender_allowed: {
              type: "string",
              enum: ["male", "female", "both"],
              example: "both",
            },
            room_type: {
              type: "string",
              enum: ["single", "double", "triple"],
              example: "single",
            },
            available_rooms: { type: "integer", example: 3 },
            status: {
              type: "string",
              enum: ["available", "unavailable"],
              example: "available",
            },
            owner_id: { type: "integer", example: 2 },
            HousingImages: {
              type: "array",
              items: { $ref: "#/components/schemas/HousingImage" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "integer", example: 8 },
            user_id: { type: "integer", example: 1 },
            housing_id: { type: "integer", example: 4 },
            start_date: { type: "string", format: "date", example: "2026-06-01" },
            end_date: { type: "string", format: "date", example: "2026-09-01" },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "rejected"],
              example: "pending",
            },
            notes: {
              type: "string",
              nullable: true,
              example: "I prefer a quiet room.",
            },
            User: { $ref: "#/components/schemas/User" },
            Housing: { $ref: "#/components/schemas/Housing" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Ragheed Ahmad" },
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", format: "password", example: "Password123" },
            phone: { type: "string", example: "0599123456" },
            role: {
              type: "string",
              enum: ["student", "owner"],
              default: "student",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", format: "password", example: "Password123" },
          },
        },
        ProfileUpdateRequest: {
          type: "object",
          properties: {
            name: { type: "string", example: "Updated Name" },
            email: { type: "string", format: "email", example: "updated@example.com" },
            phone: { type: "string", example: "0599000000" },
          },
        },
        UserUpdateRequest: {
          allOf: [
            { $ref: "#/components/schemas/ProfileUpdateRequest" },
            {
              type: "object",
              properties: {
                role: {
                  type: "string",
                  enum: ["student", "admin", "owner"],
                },
              },
            },
          ],
        },
        HousingRequest: {
          type: "object",
          required: ["title", "location", "price", "room_type"],
          properties: {
            title: { type: "string", minLength: 3, maxLength: 150, example: "Modern student studio" },
            description: {
              type: "string",
              maxLength: 2000,
              example: "Close to campus with shared kitchen.",
            },
            location: { type: "string", minLength: 2, maxLength: 120, example: "Nablus" },
            price: { type: "number", format: "float", minimum: 0, example: 450 },
            gender_allowed: {
              type: "string",
              enum: ["male", "female", "both"],
              default: "both",
            },
            room_type: {
              type: "string",
              enum: ["single", "double", "triple"],
              example: "single",
            },
            available_rooms: {
              type: "integer",
              minimum: 0,
              example: 3,
              description: "Must be at least 1 when status is available.",
            },
            status: {
              type: "string",
              enum: ["available", "unavailable"],
              default: "available",
            },
            image_urls: {
              type: "array",
              items: { type: "string" },
              example: ["https://example.com/housing.jpg"],
            },
          },
        },
        AdminHousingRequest: {
          allOf: [
            { $ref: "#/components/schemas/HousingRequest" },
            {
              type: "object",
              required: ["owner_id"],
              properties: {
                owner_id: {
                  type: "integer",
                  minimum: 1,
                  example: 2,
                  description: "Existing user ID with role owner.",
                },
              },
            },
          ],
        },
        BookingRequest: {
          type: "object",
          required: ["housing_id", "start_date", "end_date"],
          properties: {
            housing_id: { type: "integer", example: 4 },
            start_date: { type: "string", format: "date", example: "2026-06-01" },
            end_date: { type: "string", format: "date", example: "2026-09-01" },
            notes: {
              type: "string",
              example: "I prefer a quiet room.",
            },
          },
        },
        BookingStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "rejected"],
              example: "confirmed",
            },
          },
        },
        OwnerBookingStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["confirmed", "rejected", "cancelled"],
              example: "confirmed",
            },
          },
        },
        AiInfoResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "AI explain service is ready" },
            data: {
              type: "object",
              properties: {
                provider: { type: "string", enum: ["gemini", "groq", "mock"], example: "groq" },
                geminiModel: { type: "string", example: "gemini-2.5-flash" },
                groqModel: { type: "string", example: "llama-3.1-8b-instant" },
                mockEnabled: { type: "boolean", example: false },
                endpoint: { type: "string", example: "/api/ai/explain" },
              },
            },
          },
        },
        AiExplainRequest: {
          type: "object",
          required: ["topic"],
          properties: {
            topic: {
              type: "string",
              minLength: 2,
              maxLength: 500,
              example: "what an HTTP request is",
            },
          },
        },
        AiExplainResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Explanation generated successfully" },
            data: {
              type: "object",
              properties: {
                topic: { type: "string", example: "what an HTTP request is" },
                explanation: {
                  type: "string",
                  example: "An HTTP request is a message your browser sends to a server to ask for data.",
                },
                source: { type: "string", enum: ["gemini", "groq", "mock"], example: "groq" },
                model: { type: "string", example: "llama-3.1-8b-instant" },
              },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../docs/*.js")],
};

module.exports = swaggerJSDoc(swaggerOptions);
