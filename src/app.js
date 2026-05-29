import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import {sanitizeMongoInput } from 'express-v5-mongo-sanitize';
import helmet from "helmet";
import ratelimit from 'express-rate-limit';

//configuramos nuestras variables de ambiente
//para leer la varieble de ambiente del BACKEND
dotenv.config();

console.log("BackEnd", process.env.BASE_URL_BACKEND);

//importamos las rutas para usuarios
import authRoutes from "./routes/auth.routes.js";
//importamos las rutas para productos
import productsRoutes from "./routes/products.routes.js";
//importamos las rutas para las ordenes
import orderRoutes from './routes/order.routes.js';

const app = express();

app.use(cors({
  origin: [
    process.env.BASE_URL_BACKEND,
    process.env.BASE_URL_FRONTEND
  ], 
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}))

//indicamos que el servidor utilice el objeto authRoutes
app.use("/api/", authRoutes);
app.use("/api/", productsRoutes);
app.use('/api/', orderRoutes);
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenido al API REST de Productos",
    version: "1.0.0",
    rutasDisponibles: [
      {endpoint: "/api/register", method: "POST", description: "Registrar un nuevo usuario"},
      {endpoint: "/api/login", method: "POST", description: "Iniciar sesion"},
      {endpoint: "/", method: "GET", description: "Ruta incial de la aplicacion"},
    ]
  });
}); //fin de app.get /

//healt check
app.get('health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ProductosApp API se esta ejecutando correctamente'
  });
});

//manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

export default app;