const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

// Importação das rotas
const productRoutes = require('./routes/ProductRoutes');
const saleRoutes = require('./routes/SalesRoutes');
const CaixaRoutes = require('./routes/CaixaRoutes.')
const categoriesRoutes = require('./routes/Categories')


const app = express();

// Middlewares
app.use(express.json());
app.use(cors()); 

// Rotas
app.use('/products', productRoutes);
app.use('/estoque', productRoutes);
app.use('/sales', saleRoutes);
app.use('/caixa', CaixaRoutes); 
app.use('/categories', categoriesRoutes);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});