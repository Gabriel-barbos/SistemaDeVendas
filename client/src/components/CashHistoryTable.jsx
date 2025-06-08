import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

function CashHistoryTable() {
  const [cashHistory, setCashHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCashHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://sistema-de-vendas-lemon.vercel.app/caixa');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mapear os dados da API para o formato da tabela
      const mappedData = data.map((item, index) => ({
        key: item._id || index.toString(),
        dataAbertura: item.dataAbertura,
        valorAbertura: item.valorAbertura || 0,
        dataFechamento: item.dataFechamento,
        valorFechamento: item.valorFechamento || 0,
        totalVendasDinheiro: item.totalVendasDinheiro || 0,
        diferenca: item.diferenca || 0,
        status: item.status || 'aberto'
      }));
      
      setCashHistory(mappedData);
    } catch (err) {
      console.error('Erro ao buscar dados do caixa:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashHistory();
  }, []);

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const cashColumns = [
    {
      title: 'Data Abertura',
      dataIndex: 'dataAbertura',
      key: 'dataAbertura',
      render: (date) => formatDateTime(date),
      sorter: (a, b) => new Date(a.dataAbertura) - new Date(b.dataAbertura),
      width: 140
    },
    {
      title: 'Valor Abertura',
      dataIndex: 'valorAbertura',
      key: 'valorAbertura',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => a.valorAbertura - b.valorAbertura,
      align: 'right',
      width: 130
    },
    {
      title: 'Data Fechamento',
      dataIndex: 'dataFechamento',
      key: 'dataFechamento',
      render: (date) => date ? formatDateTime(date) : '-',
      sorter: (a, b) => {
        if (!a.dataFechamento && !b.dataFechamento) return 0;
        if (!a.dataFechamento) return 1;
        if (!b.dataFechamento) return -1;
        return new Date(a.dataFechamento) - new Date(b.dataFechamento);
      },
      width: 140
    },
    {
      title: 'Valor Fechamento',
      dataIndex: 'valorFechamento',
      key: 'valorFechamento',
      render: (value) => value ? formatCurrency(value) : '-',
      sorter: (a, b) => (a.valorFechamento || 0) - (b.valorFechamento || 0),
      align: 'right',
      width: 130
    },
    {
      title: 'Total Vendas',
      dataIndex: 'totalVendasDinheiro',
      key: 'totalVendasDinheiro',
      render: (value) => formatCurrency(value),
      sorter: (a, b) => (a.totalVendasDinheiro || 0) - (b.totalVendasDinheiro || 0),
      align: 'right',
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'fechado' ? 'red' : 'green'}>
          {status === 'fechado' ? 'Fechado' : 'Aberto'}
        </Tag>
      ),
      filters: [
        { text: 'Aberto', value: 'aberto' },
        { text: 'Fechado', value: 'fechado' }
      ],
      onFilter: (value, record) => record.status === value,
      width: 100
    },
    {
      title: 'Diferença',
      dataIndex: 'diferenca',
      key: 'diferenca',
      render: (value) => {
        if (value == null || value === 0) {
          return <span style={{ color: '#666' }}>R$ 0,00</span>;
        }
        
        const color = value > 0 ? '#52c41a' : '#ff4d4f';
        const prefix = value > 0 ? '+' : '';
        
        return (
          <span style={{ 
            color: color,
            fontWeight: 'bold'
          }}>
            {prefix}{formatCurrency(Math.abs(value)).replace('R$ ', 'R$ ')}
          </span>
        );
      },
      sorter: (a, b) => (a.diferenca || 0) - (b.diferenca || 0),
      align: 'right',
      width: 120
    }
  ];

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="Erro ao carregar dados"
          description={`Não foi possível carregar o histórico do caixa: ${error}`}
          type="error"
          showIcon
          action={
            <Button 
              size="small" 
              danger 
              onClick={fetchCashHistory}
              icon={<ReloadOutlined />}
            >
              Tentar novamente
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px' 
      }}>
        <h2 style={{ margin: 0 }}>Histórico do Caixa</h2>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchCashHistory}
          loading={loading}
        >
          Atualizar
        </Button>
      </div>
      
      <Table 
        dataSource={cashHistory} 
        columns={cashColumns} 
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} de ${total} registros`
        }}
        scroll={{ x: 1000 }}
        size="middle"
        bordered
        rowClassName={(record) => 
          record.status === 'aberto' ? 'row-aberto' : 'row-fechado'
        }
      />
      
      <style jsx global>{`
        .ant-table-tbody > tr.row-aberto {
          background-color: #f6ffed;
        }
        .ant-table-tbody > tr.row-fechado {
          background-color: #fff2f0;
        }
        .ant-table-tbody > tr.row-aberto:hover > td {
          background-color: #d9f7be !important;
        }
        .ant-table-tbody > tr.row-fechado:hover > td {
          background-color: #ffccc7 !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: inherit;
        }
      `}</style>
    </div>
  );
}

export default CashHistoryTable;