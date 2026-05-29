import Role from '../models/roles.models.js';
import User from '../models/user.models.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../db.js';

export const initializeSetup = async()=>{
    try {
        //Configuramos la lectura de variables de entorno
        dotenv.config();

        //conectamos a la bd
        connectDB();

        const roleAdmin = process.env.SETUP_ROLE_ADMIN;
        const roleUser = process.env.SETUP_ROLE_USER;

        //buscamos si existen los roles creados en la base de datos
        const countRoles = await Role.estimatedDocumentCount();
        if(countRoles == 0){
            console.log("Creando roles de usuarios");
            await Promise.all([
                new Role({role: roleUser}).save(),
                new Role({role: roleAdmin}).save(),
            ])
        };//fin if
        const setupAdminName = process.env.SETUP_ADMIN_USERNAME;
        const setupPwd = process.env.SETUP_ADMIN_PWD;
        const setupEmail = process.env.SETUP_ADMIN_EMAIL;
        //buscamos si existe un usuario admin
        const userAdmin = await User.findOne({username: setupAdminName});
        if(userAdmin == null ){ //no existe un usuario admin
            //se crea el usuario admin tomando encuenta variables de entorno
            console.log('Creando nuevo admin');
            const roleAdminDB = await Role.findOne({role: roleAdmin});
            const passwordAdmin = await bcryptjs.hash(setupPwd, 10);
            const newUserAdmin = new User({
                username: setupAdminName,
                email: setupEmail,
                password: passwordAdmin,
                role: roleAdminDB._id
            });
            await newUserAdmin.save();
            console.log("Roles y usuarios inicializados")
        } //fin de if useradmin
    } catch (error) {
        console.log(error);
        console.log("Error al iniciar los roles de usuario")
    }
}

initializeSetup();