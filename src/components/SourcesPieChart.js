import React from 'react';
import styled from 'styled-components';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const Container = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 400px;
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f1419;
`;

// Custom colors for the pie chart
const COLORS = ['#1da1f2', '#17bf63', '#794bc4', '#e0245e', '#ffad1f', '#a0a0a0', '#66757f', '#b8e6fe', '#a5f3c3', '#dbb0ff'];

const SourcesPieChart = ({ sources }) => {
  if (!sources || !sources.length) {
    return (
      <Container>
        <Title>Tweet Sources</Title>
        <p>No data available</p>
      </Container>
    );
  }

  // Format data for the pie chart
  const data = sources.map(source => ({
    name: source.name,
    value: source.count
  }));

  return (
    <Container>
      <Title>Tweet Sources</Title>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={80}
            outerRadius={120}
            paddingAngle={1}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name]} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </Container>
  );
};

export default SourcesPieChart;