import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  updateProductWithoutImage,
  updateProductWithImage,
  getAllProducts,
} from "../controllers/products.controller.js";

//importamos el validateSchema
import { validateSchema } from "../middlewares/validateSchema.js";
//importamos el esquema de productos para validacion
import { productSchema, productUpdateSchema } from "../schemas/product.schemas.js";
//importamos el middleware para subir imagenes a cloudinary
import { uploadToCloudinary } from "../middlewares/uploadImage.js";
//importamos middleware para admin
import { isAdmin } from "../middlewares/isAdmin.js";
//importamos el middleware para validar el id
import { validateId } from "../middlewares/validateId.js";

const router = Router();

//ruta para obtener todos los productos para la compra
router.get('/products/getallproducts', authRequired , getAllProducts);

//ruta para obtener todos los productos
router.get('/products', authRequired, isAdmin ,getProducts);

//ruta para crear un producto
router.post(
  "/products",
  authRequired,
  isAdmin,
  uploadToCloudinary,
  validateSchema(productSchema),
  createProduct,
  getAllProducts
);
//router.post("/products", authRequired, uploadToCloudinary, (req, res) => {
//console.log(req);
//res.status(200).json({ message: "OK" });
//});

//ruta para obtener un producto
router.get("/products/:id", validateId, authRequired, isAdmin, getProduct);
//ruta para eliminar un producto
router.delete("/products/:id", validateId, authRequired, isAdmin, deleteProduct);
//ruta para actualizar un producto sin actualizar la imagen
router.put(
  "/products/:id",
  validateId,
  authRequired,
  isAdmin,
  validateSchema(productUpdateSchema),
  updateProductWithoutImage,
);
//ruta para actualizar un producto y cambiar la imagen
router.put(
  "/products/updatewithimage/:id",
  validateId,
  authRequired,
  isAdmin,
  uploadToCloudinary,
  validateSchema(productSchema),
  updateProductWithImage
);


export default router;