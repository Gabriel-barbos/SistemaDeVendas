import React from 'react';
import { Card } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SalesHistoryChart = ({ data }) => {
  return (
    <Card title="Histórico de Vendas (15 dias)" extra={<CalendarOutlined />}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
  );
};

export default SalesHistoryChart;