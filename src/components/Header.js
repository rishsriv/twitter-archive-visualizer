import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #1da1f2;
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 0;
  font-size: 1rem;
  opacity: 0.9;
`;

const Header = ({ username, totalTweets, dateRange }) => {
  return (
    <HeaderContainer>
      <Title>Twitter Archive Dashboard</Title>
      {username && (
        <Subtitle>
          @{username} • {totalTweets} tweets • {dateRange}
        </Subtitle>
      )}
    </HeaderContainer>
  );
};

export default Header;