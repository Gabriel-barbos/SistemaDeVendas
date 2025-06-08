import React from 'react';
import { Card } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const HourlySalesChart = ({ data }) => {
  return (
    <Card title="Vendas por Horário" extra={<CalendarOutlined />}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hora" />
          <YAxis />
          <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Vendas']} />
          <Line type="monotone" dataKey="vendas" stroke="#32d36f" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default HourlySalesChart;