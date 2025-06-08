import React, { useEffect, useState } from 'react';
import { PieChartOutlined, ContainerOutlined } from '@ant-design/icons';
import { Statistic, Tabs, Row, Col, Card } from "antd";

// Importar apenas os componentes de gráficos
import SalesHistoryChart from '../../components/SalesHistoryChart';
import PaymentMethodsChart from '../../components/PaymentMethodChart';
import TopProductsChart from '../../components/TopProductsChart';
import HourlySalesChart from '../../components/HourlySalesChart';

// Componentes de tabela existentes
import GeneralTable from '../../components/GeneralTable';
import MonthlySaleTable from '../../components/MonthlySaleTable';
import TodaySaleTable from '../../components/TodaySalesTable';
import CashHistoryTable from '../../components/CashHistoryTable';

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

  const [loading, setLoading] = useState(true);

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
      children: <CashHistoryTable/>
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados das novas rotas criadas
        const [
          dashboardResponse,
          topProductsResponse,
          paymentMethodsResponse,
          salesByPeriodResponse,
          allSalesResponse
        ] = await Promise.all([
          fetch('https://sistema-de-vendas-lemon.vercel.app/sales/dashboard-summary'),
          fetch('https://sistema-de-vendas-lemon.vercel.app/sales/top-products'),
          fetch('https://sistema-de-vendas-lemon.vercel.app/sales/payment-methods'),
          fetch('https://sistema-de-vendas-lemon.vercel.app/sales/sales-by-period?period=day'),
          fetch('https://sistema-de-vendas-lemon.vercel.app/sales')
        ]);

        const dashboardData = await dashboardResponse.json();
        const topProductsData = await topProductsResponse.json();
        const paymentMethodsData = await paymentMethodsResponse.json();
        const salesByPeriodData = await salesByPeriodResponse.json();
        const allSalesData = await allSalesResponse.json();

        // Configurar estatísticas do dashboard
        setSalesStats({
          dailySales: dashboardData.todayRevenue || 0,
          monthlySales: dashboardData.monthRevenue || 0,
          yearlySales: dashboardData.totalRevenue || 0, // Você pode criar uma rota específica para ano
          totalSales: dashboardData.totalRevenue || 0,
          avgTicket: dashboardData.totalOrders > 0 ? (dashboardData.totalRevenue / dashboardData.totalOrders) : 0,
          salesCount: dashboardData.totalOrders || 0
        });

        // Preparar dados dos gráficos

        // 1. Top Produtos (agora com nomes corretos)
        const topProducts = topProductsData.map(product => ({
          produto: product.name, // Agora vai mostrar o nome real
          quantidade: product.totalQuantity,
          receita: product.totalRevenue,
          precoMedio: product.totalQuantity > 0 ? (product.totalRevenue / product.totalQuantity).toFixed(2) : 0
        }));

        // 2. Métodos de Pagamento
        const paymentData = paymentMethodsData.map(method => ({
          name: method._id,
          value: method.totalValue
        }));

        // 3. Histórico de vendas (últimos 15 dias)
        const salesHistory = [];
        for (let i = 14; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayString = date.toISOString().split('T')[0];
          
          const dayTotal = allSalesData.reduce((acc, sale) => {
            const saleDate = new Date(sale.date).toISOString().split('T')[0];
            if (saleDate === dayString) {
              return acc + sale.total;
            }
            return acc;
          }, 0);

          const salesCount = allSalesData.filter(sale => {
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

        // 4. Vendas por hora do dia (usando dados existentes)
        const hourlySales = Array.from({ length: 24 }, (_, hour) => {
          const hourSales = allSalesData.reduce((acc, sale) => {
            const saleHour = new Date(sale.date).getHours();
            if (saleHour === hour) {
              return acc + sale.total;
            }
            return acc;
          }, 0);

          return {
            hora: `${hour.toString().padStart(2, '0')}:00`,
            vendas: hourSales
          };
        }).filter(item => item.vendas > 0);

        setChartData({
          dailyTrend: salesHistory,
          paymentMethods: paymentData,
          topProducts,
          hourlySales
        });

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para calcular vendas anuais (caso não tenha rota específica)
  const calculateYearlySales = (salesData) => {
    const hoje = new Date();
    return salesData.reduce((acc, sale) => {
      const saleDate = new Date(sale.date);
      if (saleDate.getFullYear() === hoje.getFullYear()) {
        return acc + sale.total;
      }
      return acc;
    }, 0);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Card>
          <p>Carregando dados do dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <PieChartOutlined style={{ fontSize: 25, marginRight: 10, color: '#000' }} />
        <h1 style={{ margin: 0, color: '#001529' }}>Dashboard de Relatórios</h1>
      </div>

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
              title="Total Vendas" 
              value={salesStats.totalSales.toFixed(2)} 
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

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <SalesHistoryChart data={chartData.dailyTrend} />
        </Col>
        
        <Col xs={24} lg={12}>
          <PaymentMethodsChart data={chartData.paymentMethods} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <TopProductsChart data={chartData.topProducts} />
        </Col>
        
        <Col xs={24} lg={12}>
          <HourlySalesChart data={chartData.hourlySales} />
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