import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as session from "express-session";
import { API_PREFIX } from "../constants";

export function middleware(app: NestExpressApplication) {
  // 1. Session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // 2. Global Prefix
  app.setGlobalPrefix(API_PREFIX);

  // 3. CORS
  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ["Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // 4. Swagger
  const config = new DocumentBuilder()
    .setTitle("API DOCS")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", name: "JWT", in: "header" })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api", app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });
}
