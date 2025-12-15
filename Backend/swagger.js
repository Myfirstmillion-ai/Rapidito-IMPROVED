/**
 * L-008: Swagger API Documentation Configuration
 * 
 * This file configures Swagger/OpenAPI documentation for the Rapi-dito API.
 * Access the documentation at: /api-docs
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rapi-dito API',
      version: '1.0.0',
      description: `
# Rapi-dito - Ride-Sharing Platform API

API documentation for the Rapi-dito ride-sharing application serving the San Antonio del Táchira - Cúcuta border region.

## Authentication
Most endpoints require authentication via JWT token. Include the token in the request header:
- **Header**: \`token: <your_jwt_token>\`
- **Cookie**: \`token=<your_jwt_token>\` (httpOnly)

## Rate Limiting
- **General**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Ride creation**: 5 requests per minute
      `,
      contact: {
        name: 'Rapi-dito Support',
        email: 'support@rapidito.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://api.rapidito.app',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        tokenAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'token',
          description: 'JWT authentication token'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token in httpOnly cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'User ID' },
            fullname: {
              type: 'object',
              properties: {
                firstname: { type: 'string' },
                lastname: { type: 'string' }
              }
            },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            emailVerified: { type: 'boolean' },
            rating: { type: 'number' }
          }
        },
        Captain: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullname: {
              type: 'object',
              properties: {
                firstname: { type: 'string' },
                lastname: { type: 'string' }
              }
            },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            vehicle: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['car', 'bike'] },
                color: { type: 'string' },
                number: { type: 'string' },
                capacity: { type: 'number' }
              }
            },
            isMembershipActive: { type: 'boolean' },
            status: { type: 'string', enum: ['active', 'inactive'] }
          }
        },
        Ride: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'User ID' },
            captain: { type: 'string', description: 'Captain ID' },
            pickup: { type: 'string' },
            destination: { type: 'string' },
            fare: { type: 'number' },
            vehicle: { type: 'string', enum: ['car', 'bike'] },
            status: { 
              type: 'string', 
              enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'] 
            },
            distance: { type: 'number', description: 'Distance in meters' },
            duration: { type: 'number', description: 'Duration in seconds' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        },
        ValidationError: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              msg: { type: 'string' },
              param: { type: 'string' },
              location: { type: 'string' }
            }
          }
        }
      }
    },
    tags: [
      { name: 'User', description: 'User authentication and profile management' },
      { name: 'Captain', description: 'Captain/Driver authentication and profile management' },
      { name: 'Ride', description: 'Ride booking and management' },
      { name: 'Maps', description: 'Geolocation and mapping services' },
      { name: 'Admin', description: 'Administrative operations' },
      { name: 'Health', description: 'Server health monitoring' }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

/**
 * Initialize Swagger documentation
 * @param {Express} app - Express application instance
 */
function setupSwagger(app) {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Rapi-dito API Documentation'
  };

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

  // Serve raw OpenAPI spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at /api-docs');
}

module.exports = { setupSwagger, specs };
