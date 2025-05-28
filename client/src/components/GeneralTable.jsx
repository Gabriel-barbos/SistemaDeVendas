import React, { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import axios from 'axios';
import moment from 'moment';

const GeneralTable = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('https://sistema-de-vendas-lemon.vercel.app/sales');
      setSales(data);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
    }
    setLoading(false);
  };

  // Função para mapear cada método de pagamento a uma cor
  const getPaymentTagColor = (method) => {
    switch (method.toLowerCase()) {
      case 'dinheiro':
        return 'green';
      case 'cartao':
        return 'blue';
      case 'boleto':
        return 'volcano';
      default:
        return 'purple';
    }
  };

  const columns = [
    {
      title: 'Data da Venda',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `R$ ${total.toFixed(2)}`,
    },
    {
      title: 'Pagamento',
      dataIndex: 'payment',
      key: 'payment',
      render: (payment) => (
        <>
          <Tag color={getPaymentTagColor(payment.method)}>
            {payment.method.toUpperCase()}
          </Tag>
          {payment.details && (
            <div>
              <strong>Detalhes:</strong> {payment.details}
            </div>
          )}
        </>
      ),
    },
    {
      title: 'Itens Vendidos',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <>
          {items.map((item, idx) => (
            <div key={idx}>
              <strong>Produto:</strong> {item.product ? item.product.name : 'Produto não encontrado'} |{' '}
              <strong>Qtd:</strong> {item.quantity} | <strong>Preço:</strong> R$ {item.price.toFixed(2)}
            </div>
          ))}
        </>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={sales}
      loading={loading}
      rowKey={(record) => record._id}
    />
  );
};

export default GeneralTable;
