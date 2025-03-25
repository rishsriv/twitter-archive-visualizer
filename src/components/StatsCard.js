import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #536471;
  font-weight: 600;
`;

const Value = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #0f1419;
`;

const StatsCard = ({ title, value, subtitle }) => {
  return (
    <Card>
      <Title>{title}</Title>
      <Value>{value}</Value>
      {subtitle && <p>{subtitle}</p>}
    </Card>
  );
};

export default StatsCard;