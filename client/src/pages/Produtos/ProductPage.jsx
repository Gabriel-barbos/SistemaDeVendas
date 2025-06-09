import React, { useState, useEffect } from 'react';
import "./productpage.css";
import { Button, Drawer, Alert, Input } from 'antd';
import { ShoppingOutlined, PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import ProductForm from '../../components/ProductForm';
import ProductCard from '../../components/ProductCard';
import useProducts from '../Produtos/useProducts';
import EmptyProduct from '../../assets/EmptyProduct.png';

// Componente de Loading personalizado
const LoadingComponent = () => (
  <div className="loading-container">
    <div className="loading-content">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <div className="loading-text">
        <h3>Carregando produtos...</h3>
        <p>Aguarde enquanto buscamos seus produtos</p>
      </div>
    </div>
  </div>
);

function ProductPage() {
  const [open, setOpen] = useState(false);
  const { products, loading, error, createProduct } = useProducts(); 
  const [btnLoading, setBtnLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (products) {
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

      <div className="search-container" style={{ margin: '20px 0' }}>
        <Input
          placeholder="Pesquisar produtos..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: '100%', maxWidth: '400px', height: '50px' }}
          allowClear
        />
      </div>

      <Drawer title="Cadastrar novo produto" onClose={onClose} open={open}>
        <ProductForm onSubmit={handleCreateProduct} btnLoading={btnLoading} />
      </Drawer>

      {loading && <LoadingComponent />}
      {error && <Alert message="Erro ao carregar produtos" type="error" showIcon />}

      <div className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          !loading && (
            searchTerm ? (
              <div className="empty-search-results"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px"
                }}>
                <p style={{ fontSize: 20, fontWeight: 600 }}>Nenhum produto encontrado para "{searchTerm}"</p>
              </div>
            ) : (
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
              </div>
            )
          )
        )}
      </div>
    </>
  );
}

export default ProductPage;