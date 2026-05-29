import {email, z} from 'zod';

export const registerSchema = z.object({
    username: z.string("Nombre de usuario requerido").min(5, {error: "El nombre de usuario debe tener al menos 5 caracteres"}),
    email: z.email({error: (email)=> email.input === undefined ? "Email es requerido" : "Formato de email incorrecto"}),
    password: z.string("Contrasena requerida").min(6, {error: "El password debe tener minimo 6 caracteres"})
});

export const loginSchema = z.object({
    email: z.email({error: (email)=> email.input === undefined ? "Email es requerido" : "Formato de email incorrecto"}),
    password: z.string("Contrasena requerida").min(6, {error: "El password debe tener minimo 6 caracteres"})
});