import React from 'react';


import { BarcodeOutlined, ShopOutlined, DollarCircleOutlined, AppstoreOutlined, LineChartOutlined } from '@ant-design/icons';
import ProductCardStock from '../../components/ProductCardStock';
import './Estoque.css';
import useProducts from '../Produtos/useProducts';
import EmptyData from '../../assets/EmptyData.gif';

function Estoque() {
  const { products, loading, error, updateProduct } = useProducts();

  return (
    <div>
      <h1>Estoque</h1>
      
      <div className="cards-group">
        <div className="stock-card items">
          <div className="card-icon">
            <BarcodeOutlined />
          </div>
          <div className="card-content">
            <h3 className="card-title">Total de Itens</h3>
            <p className="card-value">109</p>
            <span className="card-subtitle">produtos cadastrados</span>
          </div>
        </div>

        <div className="stock-card value">
          <div className="card-icon">
            <DollarCircleOutlined />
          </div>
          <div className="card-content">
            <h3 className="card-title">Valor do estoque</h3>
            <p className="card-value">R$ 347.071,35</p>
            <span className="card-subtitle">Valor total em estoque</span>
          </div>
        </div>

        <div className="stock-card ">
          <div className="card-icon">
            <ShopOutlined />
          </div>
          <div className="card-content">
            <h3 className="card-title"> Valor do estoque (venda)</h3>
            <p className="card-value">R$ 387.071,35</p>
            <span className="card-subtitle">valor de venda do estoque</span>
          </div>
        </div>

        <div className="stock-card ">
          <div className="card-icon">
          <LineChartOutlined />
          
                    </div>
          <div className="card-content">
            <h3 className="card-title">Margem de lucro</h3>
            <p className="card-value">15%</p>
            <span className="card-subtitle">margem de lucro estoque x valor de venda</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Estoque;