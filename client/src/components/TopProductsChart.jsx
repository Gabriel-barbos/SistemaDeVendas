import React from 'react';
import { Card } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const TopProductsChart = ({ data }) => {
  return (
    <Card title="Top Produtos por Receita" extra={<ShoppingCartOutlined />}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
  );
};

export default TopProductsChart;