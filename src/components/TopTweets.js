import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f1419;
`;

const TweetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cfd9de;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #bdc6cc;
  }
`;

const Tweet = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: #f7f9fa;
  border-left: 4px solid #1da1f2;
`;

const TweetText = styled.p`
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  line-height: 1.4;
  color: #0f1419;
`;

const TweetMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #536471;
`;

const TweetDate = styled.span``;

const TweetStats = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ShowMoreButton = styled.button`
  background-color: transparent;
  color: #1da1f2;
  border: 1px solid #1da1f2;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  align-self: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(29, 161, 242, 0.1);
  }
  
  &:disabled {
    color: #cfd9de;
    border-color: #cfd9de;
    cursor: not-allowed;
    background-color: transparent;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const truncateText = (text, maxLength = 180) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const TopTweets = ({ tweets, title, type = 'likes' }) => {
  const INITIAL_COUNT = 5;
  const BATCH_SIZE = 5;
  
  // Use state to track how many tweets we're showing
  const [displayCount, setDisplayCount] = useState(INITIAL_COUNT);
  
  if (!tweets || !tweets.length) {
    return (
      <Container>
        <Title>{title || 'Top Tweets'}</Title>
        <p>No tweets to display</p>
      </Container>
    );
  }
  
  // Get tweets to display based on current count
  const displayedTweets = tweets.slice(0, displayCount);
  
  // Show button only if there are more tweets to load
  const hasMoreTweets = displayCount < tweets.length;
  
  // Handler to load more tweets
  const handleShowMore = () => {
    // Increase by BATCH_SIZE (5), but don't exceed total tweets length
    setDisplayCount(prev => Math.min(prev + BATCH_SIZE, tweets.length));
  };
  
  return (
    <Container>
      <Title>{title || 'Top Tweets'}</Title>
      <TweetList>
        {displayedTweets.map(tweet => (
          <Tweet key={tweet.id}>
            <TweetText>{truncateText(tweet.text)}</TweetText>
            <TweetMeta>
              <TweetDate>{formatDate(tweet.createdAt)}</TweetDate>
              <TweetStats>
                <StatItem>
                  ❤️ {tweet.favorites.toLocaleString()}
                </StatItem>
                <StatItem>
                  🔄 {tweet.retweets.toLocaleString()}
                </StatItem>
              </TweetStats>
            </TweetMeta>
          </Tweet>
        ))}
      </TweetList>
      {hasMoreTweets && (
        <ButtonContainer>
          <ShowMoreButton onClick={handleShowMore}>
            Show More
          </ShowMoreButton>
        </ButtonContainer>
      )}
    </Container>
  );
};

export default TopTweets;