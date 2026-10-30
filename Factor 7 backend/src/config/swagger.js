import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fastor CRM API',
      version: '1.0.0',
      description: `
## Fastor CRM Backend API

A CRM system for managing student enquiries in an educational company.

### How to use:
1. **Register** an employee account using \`POST /api/auth/register\`
2. **Login** using \`POST /api/auth/login\` — copy the **token** from the response
3. Click the **Authorize 🔒** button above and paste: \`Bearer YOUR_TOKEN\`
4. Now you can access all protected endpoints!

### Business Flow:
- Students submit enquiries (no login needed)
- Employees log in and view available PUBLIC enquiries
- An employee claims an enquiry → it becomes private to them
- Two employees cannot claim the same enquiry simultaneously
      `,
      contact: {
        name: 'Fastor CRM Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from the login response. Example: Bearer eyJhbG...',
        },
      },
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Enquiry: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Jane Smith' },
            email: { type: 'string', format: 'email', example: 'jane@student.com' },
            courseInterest: { type: 'string', example: 'Full Stack Development' },
            phone: { type: 'string', example: '9876543210', nullable: true },
            status: { type: 'string', enum: ['PUBLIC', 'CLAIMED'], example: 'PUBLIC' },
            claimedById: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully.' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Meaningful error message.' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Server health check' },
      { name: 'Auth', description: 'Employee registration and login' },
      { name: 'Enquiries', description: 'Student enquiry management' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health Check',
          description: 'Check if the server is running correctly.',
          responses: {
            200: {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Fastor CRM API is running.',
                    timestamp: '2024-01-01T00:00:00.000Z',
                    environment: 'development',
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new employee',
          description: 'Create a new employee account. Returns a JWT token on success.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe', minLength: 2 },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: {
                      type: 'string',
                      example: 'StrongPassword123',
                      description: 'Min 8 chars, must include uppercase, lowercase, and a number',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Employee registered successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Employee registered successfully.',
                    data: {
                      employee: {
                        id: 'uuid-here',
                        name: 'John Doe',
                        email: 'john@example.com',
                        createdAt: '2024-01-01T00:00:00.000Z',
                      },
                      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error (invalid email, weak password, etc.)' },
            409: { description: 'Email already registered' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login as an employee',
          description: 'Login with your email and password. Copy the **token** from the response and use the **Authorize 🔒** button above.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', example: 'StrongPassword123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful — copy the token!',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Login successful.',
                    data: {
                      employee: { id: 'uuid', name: 'John Doe', email: 'john@example.com' },
                      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid email or password' },
          },
        },
      },
      '/api/enquiries/public': {
        post: {
          tags: ['Enquiries'],
          summary: 'Submit a public enquiry (No login required)',
          description: 'A student submits an enquiry. No authentication needed. Rate limited to 10 per hour per IP.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'courseInterest'],
                  properties: {
                    name: { type: 'string', example: 'Jane Smith' },
                    email: { type: 'string', format: 'email', example: 'jane@student.com' },
                    courseInterest: { type: 'string', example: 'Full Stack Development' },
                    phone: { type: 'string', example: '9876543210', description: 'Optional' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Enquiry submitted successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Enquiry submitted successfully.',
                    data: {
                      id: 'enquiry-uuid',
                      name: 'Jane Smith',
                      email: 'jane@student.com',
                      courseInterest: 'Full Stack Development',
                      phone: '9876543210',
                      status: 'PUBLIC',
                      claimedById: null,
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
          },
        },
        get: {
          tags: ['Enquiries'],
          summary: 'Get all unclaimed enquiries 🔒',
          description: 'Fetch all PUBLIC (unclaimed) enquiries. **Login required.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items per page (max 100)' },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Sort by creation date' },
          ],
          responses: {
            200: {
              description: 'Public enquiries fetched successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Public enquiries fetched successfully.',
                    data: [],
                    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
                  },
                },
              },
            },
            401: { description: 'Not authenticated — use Authorize button' },
          },
        },
      },
      '/api/enquiries/{id}/claim': {
        patch: {
          tags: ['Enquiries'],
          summary: 'Claim an enquiry 🔒',
          description: 'Claim a PUBLIC enquiry. It becomes private to you. **Login required.** Uses atomic operation to prevent two employees from claiming the same enquiry.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'The enquiry UUID (copy from the GET /public response)',
              example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            },
          ],
          responses: {
            200: {
              description: 'Enquiry claimed successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Enquiry claimed successfully.',
                    data: { id: 'uuid', status: 'CLAIMED', claimedById: 'employee-uuid' },
                  },
                },
              },
            },
            401: { description: 'Not authenticated' },
            404: { description: 'Enquiry not found' },
            409: { description: 'Already claimed by someone else' },
          },
        },
      },
      '/api/enquiries/my': {
        get: {
          tags: ['Enquiries'],
          summary: 'Get my claimed enquiries 🔒',
          description: 'Fetch only enquiries **you** have claimed. Other employees cannot see your enquiries. **Login required.**',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
          ],
          responses: {
            200: {
              description: 'Your private enquiries',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Your enquiries fetched successfully.',
                    data: [],
                    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
                  },
                },
              },
            },
            401: { description: 'Not authenticated' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
