import React from "react";
import {
  TagOutlined,
  BarcodeOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import product from "../../../assets/product.avif";
import emptyGIF from "../../../assets/EmptyGIF.gif";

function OrderDetails({ lastProduct }) {
  return (
    <div className="product-container">
      <div className="page-title">
        <ShoppingOutlined style={{ fontSize: 25, marginRight: 5 }} />
        <h2>Detalhes do pedido</h2>
      </div>
      {lastProduct ? (
        <>
          <img
            className="product-img"
            src={lastProduct.image && lastProduct.image.length > 0 ? lastProduct.image[0] : product}
            alt="Produto"
          />
          <div className="product-details">
            <div className="detail-item">
              <TagOutlined style={{ fontSize: 20, marginRight: 10 }} />
              <span className="detail-text">
                <strong>Nome do Produto:</strong> {lastProduct.name}
              </span>
            </div>
            <div className="detail-item">
              <DollarOutlined style={{ fontSize: 20, marginRight: 10 }} />
              <span className="detail-text">
                <strong>Preço:</strong> R$ {lastProduct.price}
              </span>
            </div>
            <div className="detail-item">
              <BarcodeOutlined style={{ fontSize: 20, marginRight: 10 }} />
              <span className="detail-text">
                <strong>Cod.produto:</strong> {lastProduct.code || lastProduct.BarCode}
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          <img className="product-img" src={emptyGIF} alt="Produto" />
          <div className="product-details">
            <div className="detail-item">
              <span className="empty-text">Nenhum produto adicionado</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OrderDetails;