  import React, { useEffect, useState } from 'react';
  import { PieChartOutlined, ContainerOutlined, DollarOutlined, ShoppingCartOutlined, CalendarOutlined,  } from '@ant-design/icons';
  import { Statistic, Tabs, Row, Col, Card, Table, Tag } from "antd";
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

  import GeneralTable from '../../components/GeneralTable';
  import MonthlySaleTable from '../../components/MonthlySaleTable'
  import TodaySaleTable from '../../components/TodaySalesTable'

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  function Relatorios() {
    const [salesStats, setSalesStats] = useState({
      dailySales: 0,
      monthlySales: 0,
      yearlySales: 0,
      totalSales: 0,
      avgTicket: 0,
      salesCount: 0
    });

    const [chartData, setChartData] = useState({
      dailyTrend: [],
      paymentMethods: [],
      topProducts: [],
      hourlySales: []
    });

    // Dados fictícios para histórico de caixa
    const [cashHistory, setCashHistory] = useState([
      {
        key: '1',
        date: '2024-06-06',
        openingAmount: 100.00,
        closingAmount: 850.00,
        totalSales: 750.00,
        status: 'Fechado',
        balanco: '+500'
      },
      {
        key: '2',
        date: '2024-06-05',
        openingAmount: 100.00,
        closingAmount: 920.00,
        totalSales: 820.00,
        status: 'Fechado',
        balanco: '-20'

      },
      {
        key: '3',
        date: '2024-06-04',
        openingAmount: 100.00,
        closingAmount: 675.00,
        totalSales: 575.00,
        status: 'Fechado',
        balanco: '+100'
      }
    ]);

    const cashColumns = [
      {
        title: 'Data',
        dataIndex: 'date',
        key: 'date',
        render: (text) => new Date(text).toLocaleDateString('pt-BR')
      },
      {
        title: 'Abertura',
        dataIndex: 'openingAmount',
        key: 'openingAmount',
        render: (value) => `R$ ${value.toFixed(2)}`
      },
      {
        title: 'Fechamento',
        dataIndex: 'closingAmount',
        key: 'closingAmount',
        render: (value) => `R$ ${value.toFixed(2)}`
      },
      {
        title: 'Total Vendas',
        dataIndex: 'totalSales',
        key: 'totalSales',
        render: (value) => `R$ ${value.toFixed(2)}`
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <Tag color={status === 'Fechado' ? 'red' : 'green'}>
            {status}
          </Tag>
        )
      },
      {
        title: 'balanço',
        dataIndex: 'balanco',
        key: 'balanco'
      }
    ];

    const tabItems = [
      {
        key: '1',
        label: 'Vendas Hoje',
        children: <TodaySaleTable/>,
      },
      {
        key: '2',
        label: 'Vendas Mês',
        children: <MonthlySaleTable/>,
      },
      {
        key: '3',
        label: 'Vendas Geral',
        children: <GeneralTable/>,
      },
      {
        key: '4',
        label: 'Histórico Caixa',
        children: <Table dataSource={cashHistory} columns={cashColumns} pagination={{ pageSize: 10 }} />
      }
    ];

    useEffect(() => {
      fetch('https://sistema-de-vendas-lemon.vercel.app/sales')
        .then(response => response.json())
        .then(data => {
          const hoje = new Date();
          
          // Cálculos de vendas
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

          const yearlySales = data.reduce((acc, sale) => {
            const saleDate = new Date(sale.date);
            if (saleDate.getFullYear() === hoje.getFullYear()) {
              return acc + sale.total;
            }
            return acc;
          }, 0);

          const totalSales = data.reduce((acc, sale) => acc + sale.total, 0);
          const avgTicket = data.length > 0 ? totalSales / data.length : 0;

          setSalesStats({
            dailySales,
            monthlySales,
            yearlySales,
            totalSales,
            avgTicket,
            salesCount: data.length
          });

          // Preparar dados para gráficos
          
          // Vendas por método de pagamento
          const paymentMethods = data.reduce((acc, sale) => {
            const method = sale.payment.method;
            acc[method] = (acc[method] || 0) + sale.total;
            return acc;
          }, {});

          const paymentData = Object.entries(paymentMethods).map(([method, total]) => ({
            name: method,
            value: total
          }));

          // Histórico de vendas dos últimos 15 dias
          const salesHistory = [];
          for (let i = 14; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayString = date.toISOString().split('T')[0];
            
            const dayTotal = data.reduce((acc, sale) => {
              const saleDate = new Date(sale.date).toISOString().split('T')[0];
              if (saleDate === dayString) {
                return acc + sale.total;
              }
              return acc;
            }, 0);

            const salesCount = data.filter(sale => {
              const saleDate = new Date(sale.date).toISOString().split('T')[0];
              return saleDate === dayString;
            }).length;

            salesHistory.push({
              data: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              vendas: dayTotal,
              quantidade: salesCount,
              ticketMedio: salesCount > 0 ? (dayTotal / salesCount) : 0
            });
          }

          // Vendas por hora do dia
          const hourlySales = Array.from({ length: 24 }, (_, hour) => {
            const hourSales = data.reduce((acc, sale) => {
              const saleHour = new Date(sale.date).getHours();
              if (saleHour === hour) {
                return acc + sale.total;
              }
              return acc;
            }, 0);

            return {
              hora: `${hour}:00`,
              vendas: hourSales
            };
          }).filter(item => item.vendas > 0);

          // Top produtos mais vendidos com detalhes
          const productSales = {};
          const productRevenue = {};
          
          data.forEach(sale => {
            sale.items.forEach(item => {
              const productId = item.product;
              // Quantidade vendida
              if (productSales[productId]) {
                productSales[productId] += item.quantity;
              } else {
                productSales[productId] = item.quantity;
              }
              
              // Receita gerada
              const itemRevenue = item.quantity * item.price;
              if (productRevenue[productId]) {
                productRevenue[productId] += itemRevenue;
              } else {
                productRevenue[productId] = itemRevenue;
              }
            });
          });

          const topProducts = Object.entries(productSales)
            .map(([productId, quantity]) => ({
              produto: `Produto ${productId.slice(-4)}`,
              quantidade: quantity,
              receita: productRevenue[productId] || 0,
              precoMedio: productRevenue[productId] ? (productRevenue[productId] / quantity).toFixed(2) : 0
            }))
            .sort((a, b) => b.receita - a.receita)
            .slice(0, 8);

          setChartData({
            dailyTrend: salesHistory,
            paymentMethods: paymentData,
            topProducts,
            hourlySales
          });
        })
        .catch(error => console.error("Erro ao buscar vendas:", error));
    }, []);

    return (
      <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <PieChartOutlined style={{ fontSize: 25, marginRight: 10, color: '#000' }} />
          <h1 style={{ margin: 0, color: '#001529' }}>Dashboard de Relatórios</h1>
        </div>

        {/* Cards de Estatísticas */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Vendas Hoje" 
                value={salesStats.dailySales.toFixed(2)} 
                prefix="R$" 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Vendas Mês" 
                value={salesStats.monthlySales.toFixed(2)} 
                prefix="R$" 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Vendas Ano" 
                value={salesStats.yearlySales.toFixed(2)} 
                prefix="R$" 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic 
                title="Ticket Médio" 
                value={salesStats.avgTicket.toFixed(2)} 
                prefix="R$" 
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Gráficos */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Histórico de Vendas (15 dias)" extra={<CalendarOutlined />}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'vendas') return [`R$ ${value.toFixed(2)}`, 'Valor Vendido'];
                      if (name === 'quantidade') return [value, 'Qtd Vendas'];
                      if (name === 'ticketMedio') return [`R$ ${value.toFixed(2)}`, 'Ticket Médio'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="vendas" stroke="#8884d8" strokeWidth={2} name="Valor Vendido" />
                  <Line yAxisId="right" type="monotone" dataKey="quantidade" stroke="#82ca9d" strokeWidth={2} name="Qtd Vendas" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Métodos de Pagamento" extra={<DollarOutlined />}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Total']} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Top Produtos por Receita" extra={<ShoppingCartOutlined />}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="produto" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'receita') return [`R$ ${value.toFixed(2)}`, 'Receita Total'];
                      if (name === 'quantidade') return [value, 'Qtd Vendida'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="receita" fill="#8884d8" name="Receita Total" />
                  <Bar yAxisId="right" dataKey="quantidade" fill="#82ca9d" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Vendas por Horário" extra={<CalendarOutlined />}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.hourlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Vendas']} />
                  <Line type="monotone" dataKey="vendas" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Seção de Histórico */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <ContainerOutlined style={{ fontSize: 25, marginRight: 10, color: '#000' }} />
          <h2 style={{ margin: 0, color: '#001529' }}>Histórico de Dados</h2>
        </div>

        <Card>
          <Tabs 
            defaultActiveKey="1" 
            items={tabItems} 
            onChange={(key) => console.log(key)}
          />
        </Card>
      </div>
    );
  }

  export default Relatorios;