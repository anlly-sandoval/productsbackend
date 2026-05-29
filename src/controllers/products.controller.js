import Product from "../models/product.models.js";
import { v2 as cloudinary } from "cloudinary";

//funcion para obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    //select * from Products where id = req.user.id;
    const products = await Product.find({ user: req.user.id });
    //.populate("user");
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener los productos" });
  }
}; //fin de getProducts

//funcion para crear un producto
export const createProduct = async (req, res) => {
  try {
    const { name, price, quantity, urlImage } = req.body;
    const newProduct = new Product({
      name,
      price,
      quantity,
      image: req.urlImage,
      user: req.user.id, //obtenemos el id del usuario que creo el producto
    }); //insert into Products values (name, price, quantity)
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear el producto" });
  }
}; //fin de createProduct

//funcion para obtener un producto
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      //no se encontro el producto
      return res.status(404).json({ message: "Producto no encontrado" });
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener el producto" });
  }
}; //fin de getProduct

//funcion para eliminar un producto
export const deleteProduct = async (req, res) => {
  try {
    //antes de eliminar el producto comprobamos que exista el producto
    //en la base de datos para primeramente eliminar su imagen
    //y posteriormente eliminar el prducto de la bdd
    const product = await Product.findById(req.params.id);
    if (!product)
      //no se encontro el producto
      return res.status(404).json({ message: "Producto no encontrado" });
    //para eliminar la imagen de cloudinary, es necesario extraer
    //unicamente el nombre de la imagen, sin la url ni extension

    //obtenemos la url de la imagen de cloudinary, es necesario extraer
    //p.ej. https://res.cloudinary.com/dmf2h1yyg/image/upload/v1773766310/rekvlw30ubd3espqj3vf.jpg
    const imageUrl = product.image;

    //dividimos la url por / y nos quedamos con el ultimo elemento
    //que contiene el nombre de la imagen
    const urlArray = imageUrl.split('/');

    //image contener el id de la imagen de cloudinary
    //image=rekvlw30ubd3espqj3vf.jpg
    const image = urlArray[urlArray.length - 1];

    //dividimos el nombre de la imagen para quitar la extension
    //imageName=rekvlw30ubd3espqj3vf
    const imageName = image.split('.')[0];

    //eliminamos la imagen de cloudinary enviando el nombre de la imagen
    const result = await cloudinary.uploader.destroy(imageName);
console.log("Cloudinary result:", result);

if (result.result === "ok" || result.result === "not found") {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    return res.status(404).json({
      message: ["Producto no encontrado"],
    });
  }

  return res.json(deletedProduct);
} else {
  return res.status(500).json({
    message: ["Error al eliminar la imagen del producto"],
  });
}
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
}; //fin de deleteProduct

//funcion para actualizar un producto sin actualizar la imagen
export const updateProductWithoutImage = async (req, res) => {
  try {
    //comprobar que este el producto en la bdd
    const product = await Product.findById(req.params.id);
    if (!product)
      //no se encontro el producto
      return res.status(404).json({ message: "Producto no encontrado" });
    const dataProduct = {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      image: req.body.image, //url de la imagen en cloudinary
      user: req.user.id,
    };
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      dataProduct,
      { new: true },
    );
    res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
}; //fin de updateProductWithoutImage

//funcion para actualizar un producto actualizando la imagen
export const updateProductWithImage = async (req, res) => {
  try {
    //comprobamos que exista el producto a actualizar en la bdd
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: ["Producto no encontrado"] });
    //comprobamos que venga el nuevo archivo para actualizar
    if (!req.file) {
      res.status(500).json({
        message: ["Error al actualizar un producto, no se encontró la imagen"],
      });
    }
    //eliminamos la imagen anterior de cloudinary
    //obtenemos la url de la imagen de cloudinary
    const imageUrl = product.image;
    const urlArray = imageUrl.split("/");
    const image = urlArray[urlArray.length - 1];
    const imageName = image.split(".")[0];

    const result = await cloudinary.uploader.destroy(imageName);
    if (!result.result === "OK") {
      return res
        .status(500)
        .json({ message: ["Error al eliminar la imagen del producto"] });
    } //fin de if
    const dataProduct = {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      image: req.urlImage, //url de la imagen en cloudinary
      user: req.user.id,
    };
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      dataProduct,
      { new: true },
    );
    res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: ["Error al actualizar el producto"] });
  }
}; //fin de updateProductWithImage

//funcion para obtner productos de todos los usuarios para el carrito de compras
export const getAllProducts = async (req, res)=>{
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: ["Error al obtener todos los productos"]})
    }
} //fin de getAll