import React from 'react';
import { Card } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PaymentMethodsChart = ({ data }) => {
  return (
    <Card title="Métodos de Pagamento" extra={<DollarOutlined />}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Total']} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PaymentMethodsChart;