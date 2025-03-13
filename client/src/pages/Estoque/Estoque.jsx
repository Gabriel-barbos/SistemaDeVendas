import React from 'react';
import { ShoppingOutlined } from '@ant-design/icons';
import ProductCardStock from '../../components/ProductCardStock';
import './Estoque.css';
import useProducts from '../Produtos/useProducts';
import EmptyData from  '../../assets/EmptyData.gif'

function Estoque() {
  const { products, loading, error, updateProduct } = useProducts();

  return (
    <div>
      <div className="Page-title">
        <ShoppingOutlined style={{ fontSize: 25, marginRight: 5 }} />
        <h1>Estoque</h1>
      </div>

      <div className="stock-list">
        {products.length > 0 ? (
          products.map((produto) => (
            <ProductCardStock 
              key={produto._id} 
              produto={produto} 
              updateProduct={updateProduct} 
            />
          ))
        ) : (
          !loading && (
            <div
              className="empty-purchase-list"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
              }}
            >
              <img
                src={EmptyData}
                alt="Nenhum item"
                style={{ height: "100%", maxHeight: "150px", marginBottom: "5px" }}
              />
              <p style={{ fontSize: 20, fontWeight: 600 }}>Nenhum produto encontrado no estoque</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Estoque;
