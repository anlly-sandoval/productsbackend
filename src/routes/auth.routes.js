import { Router } from "express";
import { login, register, logout, profile, verifyToken } from "../controllers/auth.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validateSchema.js"; // importar el validatorSchema
import { loginSchema, registerSchema } from "../schemas/auth.schemas.js"; // importar esquemas de validacion

//Router redirecciona a la funcion de la ruta solicitada
const router = Router();
router.post('/register', validateSchema(registerSchema) ,register); //registro de usuarios
router.post('/login', validateSchema(loginSchema) ,login); //iniciar sesion
router.post('/logout', logout) //cerrar sesion
router.get('/profile', authRequired, profile) //obtener perfil del ususario, primero ejecutar el authrequired
router.get('/verify', verifyToken) //ruta para validar el token

export default router;