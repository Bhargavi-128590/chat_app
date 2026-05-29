const swaggerJsDoc = require("swagger-jsdoc");

const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Chat App API",
      version: "1.0.0",
      description: "Chat application APIs",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Server",
      },
      {
        url: "https://chat-app-odlx.onrender.com",
        description: "Production Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
