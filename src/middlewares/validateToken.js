import { TOKEN_SECRET } from "../config.js";
import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next)=>{
    //console.log("Validando token");
    //imprimimos a consola los headers de la peticion
    //console.log(req.headers);
    //obtenemos las cookies
    const {token} = req.cookies;
    if(!token)
        return res.status(401).json({message: "No token, autorizacion denegada"});
    //verificamos el token
    jwt.verify(token, TOKEN_SECRET, (err, user)=>{
        if(err)
            return res.status(403).json({message: "Token invalido"});
        //si no hay error en el token, imprimomos el usuario
        req.user = user; //guardamos en usuario en el objeto request
        next();
    })
}