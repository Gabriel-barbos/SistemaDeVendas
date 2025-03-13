import React, { useState } from 'react';
import "./productpage.css";
import { Button, Drawer, Spin, Alert } from 'antd';
import { ShoppingOutlined, PlusCircleOutlined } from '@ant-design/icons';
import ProductForm from '../../components/ProductForm';
import ProductCard from '../../components/ProductCard';
import useProducts from '../Produtos/useProducts';
import EmptyProduct from '../../assets/EmptyProduct.png'

function ProductPage() {
  const [open, setOpen] = useState(false);
  const { products, loading, error, createProduct } = useProducts(); 
  const [btnLoading, setBtnLoading] = useState(false); 

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const handleCreateProduct = async (productData) => {
    setBtnLoading(true); 
    try {
      await createProduct(productData); 
      onClose(); 
    } catch (err) {

      setBtnLoading(false);
    }
  };

  return (
    <>
      <div className="page-top">
        <div className="Page-title">
          <ShoppingOutlined style={{ fontSize: 25, marginRight: 5 }} />
          <h1>Gerenciar Produtos</h1>
        </div>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}

          onClick={showDrawer}

        >
          Adicionar novo
        </Button>
      </div>

      <Drawer title="Cadastrar novo produto" onClose={onClose} open={open}>
        <ProductForm onSubmit={handleCreateProduct} btnLoading={btnLoading} />
      </Drawer>

      {loading && <Spin size="large" />}
      {error && <Alert message="Erro ao carregar produtos" type="error" showIcon />}




      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          !loading &&

          <div className="empty-purchase-list"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px"
            }}>
            <img
              src={EmptyProduct}
              alt="Nenhum item"
              style={{ height: "100%", maxHeight: "100px", marginBottom: "5px" }}
            />
            <p style={{ fontSize: 20, fontWeight: 600 }}>Nenhum Produto adicionado</p>
          </div>)}
      </div>
    </>
  );
}

export default ProductPage;