import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
}).single('image'); // image es el nombre del atributo que viene en req

// funcion parra subir la image de memoria a cloudinary
export const uploadToCloudinary = async (req, res, next) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  try {
    upload(req, res, async (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({message: "El archivo es demasiado grande, el limite es de 5MB",
          });
        } else {
          return res.status(400).json({ message: ["Error al subir la imagen"] });
        }
      } // fin de if (err)
      //que la imagen venga en el objeto request en el atributo image
      if (!req.file) {
        return res.status(400).json({ message: ["No se encontró la imagen"] });
      }
      //que la imagen sea del mime valido
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({message: ["Tipo de archivo no permitido, solo se permiten jpeg, jpg, png y webp",
          ],
        });
      }
      //obtenemos los datos de la imagen del producto almacenada en memoria en req.file
      const image = req.file;
      //subimos la imagen a cloudinary
      const base64Image = Buffer.from(image.buffer).toString("base64");
      const dataUri = "data:" + image.mimetype + ";base64," + base64Image;

      //subimos la imagen a cloudinary
      const uploadResponse = await cloudinary.uploader.upload(dataUri);
      req.urlImage = uploadResponse.secure_url; //url de la imagen subida a cloudinary

      next();
    }); // fin de upload
  } catch (error) {
    return res.status(400).json({ message: [error.message] });
  }
}; // fin de uploadToCloudinary