import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from './Header';
import StatsCard from './StatsCard';
import TweetChart from './TweetChart';
import TopTweets from './TopTweets';
import SourcesPieChart from './SourcesPieChart';
import TweetTypesPieChart from './TweetTypesPieChart';
import { aggregateTweetsByTimePeriod, getOverallStats, getTweetSourceStats } from '../utils/twitterDataParser';

const DashboardContainer = styled.div`
  min-height: 100vh;
`;

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #0f1419;
  font-weight: 700;
`;

const FilterSection = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const FilterTitle = styled.h3`
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #0f1419;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const DateRangeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`;

const DateInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #cfd9de;
  border-radius: 5px;
  font-size: 0.9rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: #536471;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
  }
`;

const ApplyButton = styled.button`
  background-color: #1da1f2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1a91da;
  }
`;

const ResetButton = styled(ApplyButton)`
  background-color: #e6ecf0;
  color: #536471;
  
  &:hover {
    background-color: #d6dce0;
  }
`;

const Dashboard = ({ 
  tweets, 
  originalTweets,
  timelineData: initialTimelineData, 
  sources: initialSources, 
  overallStats: initialOverallStats,
  showMainTweetsOnly,
  setShowMainTweetsOnly,
  dateRange,
  setDateRange
}) => {
  // Process the initial timeline data into all time periods if needed
  const getInitialTimelineData = () => {
    if (initialTimelineData && initialTimelineData.length) {
      // If the initial data only has one time period (e.g., just monthly data),
      // then regenerate all time periods
      const hasYearlyData = initialTimelineData.some(item => 
        typeof item.period === 'string' && !item.period.includes('-')
      );
      const hasWeeklyData = initialTimelineData.some(item => 
        typeof item.period === 'string' && item.period.includes('W')
      );
      
      // If we're missing data for some time periods, regenerate from raw tweets
      if (tweets && tweets.length && (!hasYearlyData || !hasWeeklyData)) {
        const monthlyData = aggregateTweetsByTimePeriod(tweets, 'month');
        const weeklyData = aggregateTweetsByTimePeriod(tweets, 'week');
        const yearlyData = aggregateTweetsByTimePeriod(tweets, 'year');
        return [...monthlyData, ...weeklyData, ...yearlyData];
      }
    }
    
    return initialTimelineData;
  };
  
  const [filteredTimelineData, setFilteredTimelineData] = useState(getInitialTimelineData());
  const [filteredSources, setFilteredSources] = useState(initialSources);
  const [filteredStats, setFilteredStats] = useState(initialOverallStats);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Initialize date inputs with the current date range
  useEffect(() => {
    if (dateRange && dateRange.start && dateRange.end) {
      setStartDate(new Date(dateRange.start).toISOString().split('T')[0]);
      setEndDate(new Date(dateRange.end).toISOString().split('T')[0]);
    }
  }, [dateRange]);

  // Update stats and charts when tweets are filtered
  useEffect(() => {
    if (tweets && tweets.length) {
      // Generate timeline data for all period types
      const monthlyData = aggregateTweetsByTimePeriod(tweets, 'month');
      const weeklyData = aggregateTweetsByTimePeriod(tweets, 'week');
      const yearlyData = aggregateTweetsByTimePeriod(tweets, 'year');
      
      // Combine all timeline data
      const newTimelineData = [...monthlyData, ...weeklyData, ...yearlyData];
      setFilteredTimelineData(newTimelineData);
      
      // Generate new source stats based on filtered tweets
      const newSources = getTweetSourceStats(tweets);
      setFilteredSources(newSources);
      
      // Generate new overall stats based on filtered tweets
      const newStats = getOverallStats(tweets);
      setFilteredStats(newStats);
    }
  }, [tweets]);

  const handleMainTweetsToggle = () => {
    setShowMainTweetsOnly(!showMainTweetsOnly);
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate) {
      setDateRange({
        start: new Date(startDate),
        end: new Date(endDate)
      });
    }
  };

  const resetFilters = () => {
    setShowMainTweetsOnly(true); // Keep main tweets filter on by default
    // Reset date range to full range
    if (initialOverallStats) {
      setDateRange({
        start: initialOverallStats.firstTweetDate,
        end: initialOverallStats.lastTweetDate
      });
      setStartDate(new Date(initialOverallStats.firstTweetDate).toISOString().split('T')[0]);
      setEndDate(new Date(initialOverallStats.lastTweetDate).toISOString().split('T')[0]);
    }
  };

  if (!tweets || !tweets.length) {
    return (
      <DashboardContainer>
        <Header />
        <Content>
          <p>No tweets found. Please upload your Twitter archive data.</p>
        </Content>
      </DashboardContainer>
    );
  }

  // Format date range for header
  const formattedDateRange = dateRange ? 
    `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}` : 
    '';

  // Calculate filter summary (e.g., "Showing 500 of 1000 tweets")
  const filterSummary = initialOverallStats && filteredStats ? 
    `Showing ${filteredStats.totalTweets.toLocaleString()} of ${initialOverallStats.totalTweets.toLocaleString()} tweets` : 
    '';

  return (
    <DashboardContainer>
      <Header 
        username="rishdotblog" 
        totalTweets={initialOverallStats?.totalTweets || 0} 
        dateRange={formattedDateRange} 
      />
      
      <Content>
        <FilterSection>
          <FilterTitle>Filter Tweets</FilterTitle>
          <FilterRow>
            <Label>
              <input 
                type="checkbox" 
                checked={showMainTweetsOnly} 
                onChange={handleMainTweetsToggle}
              />
              Show only main tweets (exclude replies & retweets)
            </Label>

            <DateRangeContainer>
              <Label>Date Range:</Label>
              <DateInput 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                min={initialOverallStats ? new Date(initialOverallStats.firstTweetDate).toISOString().split('T')[0] : ''}
                max={endDate || (initialOverallStats ? new Date(initialOverallStats.lastTweetDate).toISOString().split('T')[0] : '')}
              />
              <span>to</span>
              <DateInput 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || (initialOverallStats ? new Date(initialOverallStats.firstTweetDate).toISOString().split('T')[0] : '')}
                max={initialOverallStats ? new Date(initialOverallStats.lastTweetDate).toISOString().split('T')[0] : ''}
              />
              <ApplyButton onClick={handleDateRangeChange}>Apply</ApplyButton>
            </DateRangeContainer>
          </FilterRow>
          <FilterRow>
            <div>{filterSummary}</div>
            <ResetButton onClick={resetFilters}>Reset Filters</ResetButton>
          </FilterRow>
        </FilterSection>

        <Section>
          <SectionTitle>Overview</SectionTitle>
          <StatsGrid>
            <StatsCard 
              title="Total Tweets" 
              value={filteredStats?.totalTweets.toLocaleString() || 0} 
            />
            <StatsCard 
              title="Total Likes" 
              value={filteredStats?.totalFavorites.toLocaleString() || 0} 
            />
            <StatsCard 
              title="Total Retweets" 
              value={filteredStats?.totalRetweets.toLocaleString() || 0} 
            />
            <StatsCard 
              title="Media Tweets" 
              value={filteredStats?.withMedia.toLocaleString() || 0} 
              subtitle={filteredStats ? `${((filteredStats.withMedia / filteredStats.totalTweets) * 100).toFixed(1)}%` : '0%'}
            />
          </StatsGrid>
        </Section>
        
        <Section>
          <SectionTitle>Activity Over Time</SectionTitle>
          <TweetChart data={filteredTimelineData} type="tweetCount" />
        </Section>
        
        <Section>
          <SectionTitle>Engagement & Tweet Types</SectionTitle>
          <ChartsGrid>
            <TweetChart data={filteredTimelineData} type="engagement" title="Likes & Retweets Over Time" />
            <TweetTypesPieChart stats={filteredStats} />
          </ChartsGrid>
        </Section>
        
        <Section>
          <SectionTitle>Popular Content</SectionTitle>
          <ChartsGrid>
            <TopTweets 
              tweets={filteredStats?.mostLikedTweets || []} 
              title="Most Liked Tweets" 
              type="likes" 
            />
            <TopTweets 
              tweets={filteredStats?.mostRetweetedTweets || []} 
              title="Most Retweeted Tweets" 
              type="retweets" 
            />
          </ChartsGrid>
        </Section>
        
        <Section>
          <SectionTitle>Tweet Sources</SectionTitle>
          <SourcesPieChart sources={filteredSources} />
        </Section>
      </Content>
    </DashboardContainer>
  );
};

export default Dashboard;