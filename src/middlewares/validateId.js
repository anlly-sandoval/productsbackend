import mongoose from "mongoose";

function idMongoDbValidator (id) {
    //validacion basica q no este vacio y tenga longitud de 24 caracetes
    if(!id || id.trim().length !== 24)
        return false;

    //validar formato hexadecimal
    const isValidHex = /^[0-9a-fA-F]{24}$/.test(id.trim());
    if(!isValidHex)
        return false;

    //validar ids especiales reservados
    const reservedOrSuspiciousObjectIds = [
        '000000000000000000000000',
        'ffffffffffffffffffffffff',
        'aaaaaaaaaaaaaaaaaaaaaaaa',
        'bbbbbbbbbbbbbbbbbbbbbbbb',
        'cccccccccccccccccccccccc',
        '0123456789abcdef01234567',
        '1234567890abcdef12345678',
        'deadbeefdeadbeefdeadbeef',
        'cafebabecafebabecafebabe',
        'badc0ffebadc0ffebadc0ffe'
    ];
    if(reservedOrSuspiciousObjectIds.includes(id.trim().toLowerCase()))
        return false;

    return true;
}; //fin de idMongoDbValidator

export const validateId = (req, res, next) => {
  try {
    const { id } = req.params;
    //validacion basica de vacio, longitud y hex
    const validateId = idMongoDbValidator(id);
    if(!validateId)
      return res.status(400).json({message: ['ID invalido o longitud incorrecta']});
    //limpiamos el id de espacios en blanco
    const cleanId = id.trim();
    //vaidar con mongoose
    if(!mongoose.isValidObjectId(cleanId))
      return res.status(400).json({message: ['Formato de id no valido para MongoDB']});
    //validar si es posible crear un objectid con los datos del id
    const objectId = mongoose.Types.ObjectId.createFromHexString(cleanId);
    //verificar q la conversion fue exacta
    if(objectId.toString() !== cleanId.toLowerCase())
      return res.status(400).json({messsage: ['Error al procesar el ID']});

    //validar ids especiales reservados
    const reservedOrSuspiciousObjectIds = [
        '000000000000000000000000',
        'ffffffffffffffffffffffff',
        'aaaaaaaaaaaaaaaaaaaaaaaa',
        'bbbbbbbbbbbbbbbbbbbbbbbb',
        'cccccccccccccccccccccccc',
        '0123456789abcdef01234567',
        '1234567890abcdef12345678',
        'deadbeefdeadbeefdeadbeef',
        'cafebabecafebabecafebabe',
        'badc0ffebadc0ffebadc0ffe'
    ];
    if(reservedOrSuspiciousObjectIds.includes(id.trim().toLowerCase()))
      return res.status(400).json({message: ['Error ID reservado']});

    next();

  } catch (error) {
    return res.status(400).json({message: ['El id no es un ObjectId valido']});
  }
}