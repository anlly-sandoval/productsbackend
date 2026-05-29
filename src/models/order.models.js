import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                },
                quantity: Number,
                price: Number
            }
        ],
        subTotal: {
            type: Number,
            required: true
        },
        iva: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        totalProducts: {
            type: Number,
            required: true
        },
        paymentMethod: {
            method: {
                type: String,
                required: true,
                enum: ['card', 'pickup', 'transfer', 'cash'],
                default: 'card'
            },
            cardDetails: {
                cardName: {
                    type: String,
                    trim: true,
                    required: function(){
                        return this.paymentMethod.method === 'card'
                    }
                },
                cardNumber: {
                    type: String,
                    trim: true,
                    required: function(){
                        return this.paymentMethod.method === 'card'
                    },
                    validate: {
                        validator: function(v){
                            return /^\d{12,19}$/.test(v.replace(/\s+/g, ''));
                        },
                        message: props => `${props.value} no es un numero valido`
                    }
                },
                expirationDate: {
                    type: String,
                    trim: true,
                    requiered: function(){
                        return this.paymentMethod.method === 'card'
                    },
                    validate: {
                        validator: function(v){
                            return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(v);
                        },
                        message: props => `${props.value} no es una fecha de expiracion valida (MM/YY)`
                    }
                },
                ccv: {
                    type: String,
                    trim: true,
                    requiered: function(){
                        return this.paymentMethod.method === 'card'
                    },
                    validate: {
                        validator: function(v){
                            return /^\d{3,4}$/.test(v);
                        },
                        message: props => `${props.value} no es un CCV valido`
                    }
                },
            }, //fin de cardDetails
            shippingAddress: {
                address: {
                    type: String,
                    requiered: true,
                    trim: true,
                    requiered: function(){
                        return this.paymentMethod.method === 'card'
                    }
                },
                name: {
                    type: String,
                    requiered: true,
                    trim: true,
                    requiered: function(){
                        return this.paymentMethod.method === 'card'
                    }
                },
                phone: {
                    type: String,
                    requiered: true,
                    trim: true,
                    requiered: function(){
                        return this.paymentMethod.method === 'card'
                    },
                    validate: {
                        validator: function(v){
                        return /^[\d\s\+\-\(\)]{7,20}$/.test(v);
                    },
                    message: props => `${props.value} no es un numero de telefono valido`
                    }
                },
            }, //fin de shippingAddres
            userName: {
                type: String,
                trim: true,
                requiered: function(){
                    return this.paymentMethod.method === 'pickup'
                },
            }, //fin de userName
        }, //fin de paymentMethod
        status: {
            type: String,
            enum: ['received', 'confirmed', 'cancelled', 'delivered'],
            default: 'received'
        }, //fin de status
    },
    {
        timestamps: true
    }
); //fin de productsSchema

export default mongoose.model('Orders', OrderSchema);