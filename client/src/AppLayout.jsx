import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../src/assets/logo.jpeg"
import './main.css';
import {
  PieChartOutlined,
  TagOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button } from 'antd';

const { Content, Footer, Sider } = Layout;

const allItems = [
  { key: "1", label: "Caixa", icon: <ShoppingCartOutlined />, path: "/caixa" },
  { key: "2", label: "Produtos", icon: <TagOutlined />, path: "/admin/produtos" },
  { key: "3", label: "Estoque", icon: <AppstoreOutlined />, path: "/admin/estoque" },
  { key: "4", label: "Relatórios", icon: <PieChartOutlined />, path: "/admin/relatorios" },
];

const AppLayout = ({ children, selectedKey }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Recupera o usuário logado do localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Define as abas permitidas de acordo com o papel do usuário
  const allowedItems =
    user && user.role === 'admin'
      ? allItems
      : allItems.filter(item => item.key === "1");

  // Navega para a rota selecionada
  const handleMenuClick = (e) => {
    const selectedItem = allowedItems.find(item => item.key === e.key);
    if (selectedItem) {
      navigate(selectedItem.path);
    }
  };

  // Realiza o logout removendo o usuário e redirecionando para a tela de login
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#e0e0e0' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: '#002140' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div>

            <div style={{ padding: '16px', textAlign: 'center' }}>
              <img 
                src={logo} 
                alt="Logo" 
                style={{ maxWidth: '100%', height: 'auto' }} 
              />
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              items={allowedItems}
            />
          </div>
          <div style={{ marginTop: 'auto', padding: '10px', textAlign: 'center' }}>
            <Button type="primary" danger onClick={handleLogout} block>
              Logout
            </Button>
          </div>
        </div>
      </Sider>
      <Layout>
        <Content style={{ margin: '0 16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#f0f2f5', borderRadius: '8px' }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', background: '#001529', color: '#fff' }}>
         Todos os Direitos Reservados ©{new Date().getFullYear()} Created by Gabriel Barbosa
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
