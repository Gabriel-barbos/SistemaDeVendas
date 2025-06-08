import React, { useEffect, useState } from 'react';


import { BarcodeOutlined, ShopOutlined, DollarCircleOutlined, AppstoreOutlined, LineChartOutlined } from '@ant-design/icons';
import './Estoque.css';
import useProducts from '../Produtos/useProducts';
import ProductStockTable from '../../components/ProductStockTable';

function Estoque() {
  const { products, loading, error, updateProduct } = useProducts();

  const [stats, setStats] = useState({
    estoque: 0,
    estoqueVenda: 0,
    margemLucro: 0,
    quantidadeTotal: 0,
  });

  useEffect(() => {
    fetch('https://sistema-de-vendas-lemon.vercel.app/products')
      .then(response => response.json())
      .then(data => {
        // Soma do custo dos produtos vezes a quantidade
        const totalEstoque = data.reduce((acc, produto) =>
          acc + (produto.cost * produto.quantity), 0);
        // Soma do preço dos produtos vezes a quantidade
        const totalEstoqueVenda = data.reduce((acc, produto) =>
          acc + (produto.price * produto.quantity), 0);
        // Margem de lucro (em porcentagem)
        const margemLucro = totalEstoqueVenda > 0
          ? (totalEstoque / totalEstoqueVenda) * 100
          : 0;

        const quantidadeTotal = data.reduce((acc, produto) => acc + produto.quantity, 0);

        setStats({
          estoque: totalEstoque,
          estoqueVenda: totalEstoqueVenda,
          margemLucro,
          quantidadeTotal
        });
      })
      .catch(error => console.error("Erro ao buscar produtos:", error));
  }, []);


  return (
    <div>
       <div className="Page-title">
          <AppstoreOutlined style={{ fontSize: 25, marginRight: 5 }} />
          <h1>Estoque</h1>
        </div>

      <div className="cards-group">
        <div className="stock-card items">
          <div className="card-icon">
            <BarcodeOutlined />
          </div>
          <div className="card-content">
            <h3 className="card-title">Total de Itens</h3>
            <p className="card-value">{stats.quantidadeTotal} </p>
            <span className="card-subtitle">produtos cadastrados</span>
          </div>
        </div>

        <div className="stock-card value">
          <div className="card-icon">
            <DollarCircleOutlined />
          </div>
          <div className="card-content">
            <h3 className="card-title">Valor do estoque</h3>
            <p className="card-value">
              {stats.estoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <span className="card-subtitle">Valor total em estoque</span>
          </div>
        </div>

        <div className="stock-card ">
          <div className="card-icon">
            <ShopOutlined />
          </div>
          <div className="card-content">
            <h3 className="card-title"> Valor do estoque (venda)</h3>
            <p className="card-value">
              {stats.estoqueVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <span className="card-subtitle">valor de venda do estoque</span>
          </div>
        </div>

        <div className="stock-card ">
          <div className="card-icon">
            <LineChartOutlined />

          </div>
          <div className="card-content">
            <h3 className="card-title">Margem de lucro</h3>
            <p className="card-value">{stats.margemLucro.toFixed(2)}%</p>
            <span className="card-subtitle">margem de lucro estoque x valor de venda</span>
          </div>
        </div>
      </div>

      <ProductStockTable />
    </div>
  );
}

export default Estoque;