import User from '../models/user.models.js';
import Role from '../models/roles.models.js';
import dotenv from 'dotenv';

//configurar variables de entorno
dotenv.config();
//obtener rol del usuario para la validacion de admin
const rolAdmin = process.env.SETUP_ROLE_ADMIN;

export const isAdmin = async (req, res, next)=>{
    try {
        const userFound = await User.findById(req.user.id);
        if(!userFound)
            return res.status(400).json({message: ['No autorizado, usuario no encontrado']});
        //obtenemos el rol para el usuario que inicio sesion y comprbamos que sea admin
        const role = await Role.findById(userFound.role);
        if(!role) //no se encuentra el rol del usuario en la bd
            return res.status(401).json({message: ['No autorizado, el rol del usuario no esta definido']});
        //si el rol del usurio pertenece a admin
        if(role.role != rolAdmin)
            return res.status(401).json({message: ['El usuario no esta autorizado para esta operacion']});
        //el usuario tiene rol de admin
        next();
    } catch (error) {
        return res.status(401).json({message: ['No autorizado para esta operacion']});
    }
}