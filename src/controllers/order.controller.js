import Products from '../models/product.models.js';
import Orders from '../models/order.models.js';

//funcion para crear una orden
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            paymentMethod,
            subTotal,
            iva,
            total,
            totalProducts,
        } = req.body;

        //validar stock en la bd
        for(const item of items) {
            const product = await Products.findById(item.productId);
            if(!product || product.quantity < item.quantity) {
                if(!product)
                    return res.status(400).json({message: ['Producto '+ item.productId + ' no encontrado en la base de datos']})
                else 
                    return res.status(400).json({message: ['No hay suficiente stock en existencia para el producto ' + product.name]})
            } //if
        } //for

        //crear el pedido
        const order = await Orders.create({
            user: req.user.id,
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            subTotal,
            iva,
            total,
            totalProducts,
            paymentMethod,
            status: 'received',
            timestamps: Date.now()
        }); //fin de objeto order

        //guardamos la orden
        const newOrder = await order.save();

        //actualizar el stock en la base de datos
        await Promise.all(items.map(async item => {
            await Products.findByIdAndUpdate(item.productId, {
                $inc: {quantity: -item.quantity}
            });
        }));

        res.json(newOrder);

    } catch (error) {
        res.status(500).json({message: ['Error al crear la orden']})
    }
}; //fin de createOrder

//funcion para actualizar el status de una orden
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        //validar el estado 
        if(!['received', 'confirmed', 'cancelled', 'delivered'].includes(status)){
            return res.status(400).json({message: ['Errro al actualizar la orden, estado no valido']})
        }

        //buscar y actualizar la orden
        const order = await Orders.findByIdAndUpdate(id, {status}, {new: true})

        if(!order) {
            return res.status(400).json({message: ['Error al actualizar la orden, orden no encontrada']})
        }

        //si se cancela la orden, restaurar stock
        if(status === 'cancelled' && order.status !== 'cancelled') {
            await Promise.all(order.items.map(async item => {
                await Products.findByIdAndUpdate(item.productId, {
                    $inc: {quantity: item.quantity} //sumar de vuelta al stock los productos cancelados
                });
            }));
        }

        res.json(order);

    } catch (error) {
        return res.status(400).json({message: ['Error al actulizar la orden']})
    }
}; //fin de updateOrderStatus

//funcion para obtener todas las ordenes para el administrador
export const getAllOrders = async (req, res) => {
    try {
        //obtener todas las ordenes
        const orders = await Orders.find()
    .sort({ createdAt: -1 })
    .populate({
        path: 'items.productId',
        model: 'Product',
        select: 'name price image quantity'
    });
        res.json(orders);
    } catch (error) {
        return res.status(400).json({message: ['Error al obtener todas las ordenes']})
    }
}; //fin de getAllProducts

//funcion para obtener todas las ordenes para un usuario
export const getUserOrders = async (req, res) => {
    try {
        //obtener todas las ordenes para un usuario especifico
        const orders = await Orders.find({user: req.user.id})
                                    .sort({createdAt: -1})
                                    .populate({
                                        path: 'items.productId',
                                        model: 'Product',
                                        select: 'name price image quantity'
                                    });
        if(!orders)
            return res.json({});

        res.json(orders);

    } catch (error) {
        return res.status(400).json({message: ['Error al obtener todas las ordenes']})
    }
}; //fin de getUserOrders

//funcion para obtener una orden por ID
export const getOrdersById = async (req, res) => {
    try {
        //obtener una orden por ID
        const order = await Orders.findById(req.params.id)
                                   .populate({
                                    path: 'items.productId',
                                    model: 'Product',
                                    select: 'name price image quantity'
                                   });
        if(!order) //no se encontro la orden
            return res.status(404).json({message: ['Error, no se encontro la orden']})

        res.json(order);

    } catch (error) {
        return res.status(400).json({message: ['Error al obtener la orden']})
    }
}; //fin de getOrdersById

//funcion para eliminar una orden solo si el status es cancelado
export const deleteOrder = async (req, res) => {
    try {
        //obtener una orden por id para validar su status
        const order = await Orders.findById(req.params.id)
        if(!order)
            return res.status(404).json({message: ['Error, no se encontro la orden para eliminar']})

        if(order.status !== 'cancelled') {
            return res.status(400).json({message: ['Error, solo se pueden eliminar ordenes canceladas']})
        };

        //eliminar una orden por id
        await Orders.findByIdAndDelete(req.params.id)

        res.json(order);

    } catch (error) {
        return res.status(400).json({message: ['Error al obtener la orden']})
    }
}; //fin de deleteOrder