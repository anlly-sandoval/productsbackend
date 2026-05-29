import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import Role from "../models/roles.models.js";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from "../config.js";

//configuramos las variables de entorno
dotenv.config();

//funcion para validar el token de inicio de sesion
export const verifyToken = async (req, res)=>{
  const { token } = req.cookies;
  if(!token)
    return res.status(400).json({message: ['No autorizado']});

  jwt.verify(token, TOKEN_SECRET, async(err, user)=>{
    if(err)
      return res.status(401).json({message: ['No autorizado']});
    const userFound = await User.findById(user.id);
    if(!userFound)
      return res.status(401).json({message: ['No autorizado']});
    //validar el rol del usuario
    const role = Role.findById(userFound.role);
    if(!role)
      return res.status(401).json({message: ['No autorizado, el rol no esta definido']});
    const userResponse = {
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: role.role
    };
    return res.json(userResponse);
  })//fin de jwt.verify
}

//obtenemos el rol de usuario para el registro
const roleUser = process.env.SETUP_ROLE_USER;

// objeto request -> recibe las peticiones del cliente
// objeto response -> envia la respuesta del bakcend al cliente

//funcion para registrar usuarios
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  //validar que el email no este registrado en la bdd
  const userFound = await User.findOne({ email });
  if (userFound)
    //ya se encuentra un usuario con ese email en la bdd
    return res
      .status(400) //retornamos un error 400 al cliente
      .json({ message: ["El email ya esta registrado"] });

  const passwordHash = await bcrypt.hash(password, 10);
  //obtenemos el rol para los usuarios
  //y lo agregamos para guardarlo en la bdd con es rol
  const role = await Role.findOne({ role: roleUser });
  if (!role) {
    //no se encuentra el rol de usuarios inicializado
    return res.status(400).json({ message: ["El rol para usuarios no esta definido"] });
  }
  try {
    const newUser = new User({
      username,
      email,
      password: passwordHash,
      role: role._id,
    });
    const userSaved = await newUser.save();
    //console.log(newUser);

    //generamos el token de inicio de sesion
    const token = await createAccessToken({ id: userSaved._id });

    //verificar si el token de inicio de sesion lo generamos
    //para el entorno local de desarrollo o lo generamos para
    //el servidor en la nube
    if (process.env.ENVIROMENT == 'local') {
      //el entorno es desarrollo
      res.cookie('token', token, {
        sameSite: 'lax', //para que el back y el front esten locales
      });
    } else {
      //el back y el front se encuentran en distintos servidores
      //tienen que compartir la cookie entre ellos
      res.cookie("token", token, {
        sameSite: "none", //para peticiones remotas
        secure: true, //para activar https en deployment
      });
    } //fin de if (process.env)

    res.json({
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      role: role.role
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: ["Error al registrar usuario"] });
  }
};

//funcion para iniciar sesion
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });
    console.log(userFound);
    if (!userFound)
      return res.status(400).json({ message: ["Usuario no encontrado"] });
    //comparar el password que envio el usuario con el de la bd
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch)
      return res.status(400).json({ message: ["Password no coincide"] });

    const token = await createAccessToken({ id: userFound._id });

    if (process.env.ENVIROMENT == "local") {
      //el entorno es desarrollo
      res.cookie("token", token, {
        sameSite: "lax", //para que el back y el front esten locales
      });
    } else {
      //el back y el front se encuentran en distintos servidores
      //tienen que compartir la cookie entre ellos
      res.cookie("token", token, {
        sameSite: "none", //para peticiones remotas
        secure: true, //para activar https en deployment
      });
    } //fin de if (process.env)

    //obtenemos el rol del usuario que inicio sesion
    //y lo asignamos en el return del usuario
    const role = await Role.findById(userFound.role);
    if (!role)
      //no se encuentra el rol del usuario
      return res.status(400).json({ message: ["Rol en login no encontrado"] });
    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: role.role
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: ["Error al iniciar sesion"] });
  }
};

//funcion para cerrar una sesion de un usuario
export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.status(200).json({ message: ["Sesion cerrada"] });
};

//funcion para visulizar el perfil del usuario
export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);

  if (!userFound)
    //no se encontro el id en la bdd
    return res.status(400).json({ message: ["Usuario no encontrado"] });
    //obtenemos el rol para el usuario q inicio sesion y lo asignamos en el return del usuario
    const role = await Role.findById(userFound.role);
    if(!role)
      return res.status(400).json({message: ["El rol para el usuario no esta definido"]})
  res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    role: role.role
  });
};