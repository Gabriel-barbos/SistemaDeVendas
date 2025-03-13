import React from 'react';
import { Button } from 'antd';
import { RestOutlined } from '@ant-design/icons';
import '../assets/productitem.css';
import placeholder from "../assets/placeholder.webp";

function ProductItem({ product, quantity, onQuantityChange, onRemove }) {
  const aumentar = () => onQuantityChange(quantity + 1);
  const diminuir = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const totalPrice = product.price * quantity;

  return (
    <div className='product-item'>
      <div className='product-left'>
        <img  
          src={product.image && product.image.length > 0 ? product.image[0] : placeholder}
          alt="Produto"
        />
        <div className='product-info'>
          <span className='title'>{product.name}</span><br />
          <span className='codigo'>Cod. {product.code || product.BarCode}</span>
        </div>
      </div>

      <div className='product-right'>
        <span className='price'>
          {totalPrice.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </span>
        <br />

        <div className="contador">
          <button className="botao" onClick={diminuir}>-</button>
          <div className="quantidade">{quantity}</div>
          <button className="botao" onClick={aumentar}>+</button>
        </div>
        <Button
          danger
          icon={<RestOutlined />}
          style={{ marginTop: 10 }}
          onClick={onRemove}
        >
          Excluir
        </Button>
      </div>
    </div>
  );
}

export default ProductItem;
