const mongoose = require('mongoose');

const caixaSchema = new mongoose.Schema({
  dataAbertura: { type: Date, required: true },
  valorAbertura: { type: Number, required: true },
  dataFechamento: { type: Date },
  valorFechamento: { type: Number },
  totalVendasDinheiro: { type: Number },
  diferenca: { type: Number }, 
  status: {
    type: String,
    enum: ['aberto', 'fechado'],
    default: 'aberto',
  }
});

module.exports = mongoose.model('Caixa', caixaSchema);
