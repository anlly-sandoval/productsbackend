import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import {
    createOrder,
    updateOrderStatus,
    getAllOrders,
    getUserOrders,
    getOrdersById,
    deleteOrder
} from '../controllers/order.controller.js';
//importamos el middleware para validar el esquema
import { validateSchema } from '../middlewares/validateSchema.js';
//importamos el esquema de validacion para crear una orden
import { orderSchema } from '../schemas/order.schema.js';
import { validateId } from '../middlewares/validateId.js';

const router = Router();

//ruta para crear una orden
router.post('/order', authRequired, validateSchema(orderSchema), createOrder);

//ruta para actualizar el status de una orden por id
router.put('/order/:id', validateId, authRequired, updateOrderStatus);

//obtener todas las ordenes para el admin
router.get('/order/', authRequired, isAdmin, getAllOrders);

//obtener todas las ordenes para un usuario
router.get('/order/getuserorders', authRequired, getUserOrders);

//obtener una orden por id
router.get('/order/:id', validateId, authRequired, getOrdersById);

//eliminar una orden
router.delete('/order/:id', validateId, authRequired, isAdmin, deleteOrder);

export default router;