const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: [String], required: true },
    price: { type: Number, required: true },
    cost: { type: Number, required: true },
    quantity: { type: Number, required: true },
    code: { type: String, required: true },
    BarCode: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['eletronicos', 'acessorios', 'outros', 'cosmeticos', 'utilidades']
    }
});

module.exports = mongoose.model('Product', ProductSchema);
