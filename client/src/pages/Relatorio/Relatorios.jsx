import React, { useEffect, useState } from 'react';
import "../Relatorio/relatorio.css";
import { PieChartOutlined, ContainerOutlined } from '@ant-design/icons';
import { Statistic, Tabs } from "antd";
import GeneralTable from '../../components/GeneralTable';
import TodaySalesTable from '../../components/TodaySalesTable';
import MonthlySalesTable from '../../components/MonthlySaleTable';

const onChange = (key) => {
  console.log(key);
};

const items = [
  {
    key: '1',
    label: 'Dia',
    children: <TodaySalesTable />,
  },
  {
    key: '2',
    label: 'Mês',
    children: <MonthlySalesTable />,
  },
  {
    key: '3',
    label: 'Geral',
    children: <GeneralTable />,
  },
];

function Relatorios() {
  const [stats, setStats] = useState({
    estoque: 0,
    estoqueVenda: 0,
    margemLucro: 0,
  });
  const [salesStats, setSalesStats] = useState({
    dailySales: 0,
    monthlySales: 0,
    yearlySales: 0,
  });

  useEffect(() => {
    fetch('https://sistemapdv-2.onrender.com/products')
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

        setStats({
          estoque: totalEstoque,
          estoqueVenda: totalEstoqueVenda,
          margemLucro,
        });
      })
      .catch(error => console.error("Erro ao buscar produtos:", error));
  }, []);

  // Busca as vendas e filtra por dia, mês e ano
  useEffect(() => {
    fetch('https://sistemapdv-2.onrender.com/sales')
      .then(response => response.json())
      .then(data => {
        const hoje = new Date();

        // Valor vendido no dia
        const dailySales = data.reduce((acc, sale) => {
          const saleDate = new Date(sale.date);
          if (
            saleDate.getFullYear() === hoje.getFullYear() &&
            saleDate.getMonth() === hoje.getMonth() &&
            saleDate.getDate() === hoje.getDate()
          ) {
            return acc + sale.total;
          }
          return acc;
        }, 0);

        // Valor vendido no mês
        const monthlySales = data.reduce((acc, sale) => {
          const saleDate = new Date(sale.date);
          if (
            saleDate.getFullYear() === hoje.getFullYear() &&
            saleDate.getMonth() === hoje.getMonth()
          ) {
            return acc + sale.total;
          }
          return acc;
        }, 0);

        // Valor vendido no ano
        const yearlySales = data.reduce((acc, sale) => {
          const saleDate = new Date(sale.date);
          if (saleDate.getFullYear() === hoje.getFullYear()) {
            return acc + sale.total;
          }
          return acc;
        }, 0);

        setSalesStats({
          dailySales,
          monthlySales,
          yearlySales,
        });
      })
      .catch(error => console.error("Erro ao buscar vendas:", error));
  }, []);

  return (
    <>
      <div className="Page-title">
        <PieChartOutlined style={{ fontSize: 25, marginRight: 5 }} />
        <h1>Relatórios</h1>
      </div>
      <div className='stat-list'>
        <div className='stats-card'>
          <Statistic 
            title="Valor do estoque:" 
            value={stats.estoque.toFixed(2)} 
            prefix={"R$"} 
          />
        </div>
        <div className='stats-card'>
          <Statistic 
            title="Valor do estoque(venda):" 
            value={stats.estoqueVenda.toFixed(2)} 
            prefix={"R$"} 
          />
        </div>
        <div className='stats-card'>
          <Statistic 
            title="Margem de lucro" 
            value={stats.margemLucro.toFixed(2)} 
            suffix={"%"} 
          />
        </div>
        <div className='stats-card' style={{ borderTopColor: "green" }}>
          <Statistic 
            title="Vendas Dia" 
            value={salesStats.dailySales.toFixed(2)} 
            prefix={"R$"} 
          />
        </div>
        <div className='stats-card' style={{ borderTopColor: "green" }}>
          <Statistic 
            title="Vendas Mês" 
            value={salesStats.monthlySales.toFixed(2)} 
            prefix={"R$"} 
          />
        </div>
        <div className='stats-card' style={{ borderTopColor: "green" }}>
          <Statistic 
            title="Vendas Ano" 
            value={salesStats.yearlySales.toFixed(2)} 
            prefix={"R$"} 
          />
        </div>
      </div>

      <div className="Page-title">
      <ContainerOutlined style={{ fontSize: 25, marginRight: 5 }} />
        <h1>Histórico</h1>
      </div>

      <Tabs 
        style={{ marginTop: 20 }}
        defaultActiveKey="1" 
        items={items} 
        onChange={onChange} 
      />
    </>
  );
}

export default Relatorios;
