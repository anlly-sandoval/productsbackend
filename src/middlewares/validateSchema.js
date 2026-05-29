export const validateSchema = (schema) => (req, res, next) =>{
    try {
        //parse valida el objeto req.body con el esquema definido, si no hay error se ejecuta next
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({message: error.issues.map((e)=> e.message)});
    }
}