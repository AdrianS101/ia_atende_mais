const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const connectToDatabase = require("./config/database");
const authRoutes = require("./routes/auth");
const onboardingRoutes = require("./routes/onboarding");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: "https://ia-atende-mais.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use("/auth", authRoutes);
app.use("/onboarding", onboardingRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Online ✅",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /auth/register": "Registrar cliente",
        "POST /auth/login": "Login de cliente",
        "POST /auth/admin/register-once": "Registrar admin (única vez)",
        "POST /auth/admin/login": "Login de admin",
      },
      onboarding: {
        "POST /onboarding/create": "Criar/atualizar onboarding",
        "GET /onboarding/:userId": "Buscar onboarding por userId",
        "PUT /onboarding/:id": "Editar onboarding",
        "POST /onboarding/files/add": "Upload de arquivos (GridFS)",
        "GET /onboarding/files/:id": "Download de arquivo (GridFS)",
        "DELETE /onboarding/files/:id": "Excluir arquivo (GridFS)",
        "GET /onboarding": "Listar todos (admin)",
        "DELETE /onboarding/:id": "Excluir onboarding (admin)",
      },
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
});

app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erro interno do servidor",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

module.exports = app;
