import React from 'react';
import styled from 'styled-components';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const ChartContainer = styled.div`
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

const TimePeriodSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
`;

const PeriodButton = styled.button`
  background-color: ${props => props.active ? '#1da1f2' : '#e6ecf0'};
  color: ${props => props.active ? 'white' : '#536471'};
  border: none;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: ${props => props.active ? '#1a91da' : '#d6dce0'};
  }
`;

const chartTypes = {
  tweetCount: {
    title: 'Tweets Over Time',
    dataKey: 'count',
    color: '#1da1f2',
    name: 'Tweets'
  },
  engagement: {
    title: 'Engagement Over Time',
    metrics: [
      { dataKey: 'favorites', color: '#e0245e', name: 'Likes' },
      { dataKey: 'retweets', color: '#17bf63', name: 'Retweets' }
    ]
  },
  tweetTypes: {
    title: 'Tweet Types Over Time',
    metrics: [
      { dataKey: 'originalTweets', color: '#1da1f2', name: 'Original Tweets' },
      { dataKey: 'replies', color: '#794bc4', name: 'Replies' },
      { dataKey: 'retweetCount', color: '#17bf63', name: 'Retweets' }
    ]
  }
};

const formatXAxis = (tickItem, period) => {
  if (period === 'year') return tickItem.toString();
  
  if (period === 'month') {
    const [year, month] = tickItem.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  }
  
  if (period === 'day') {
    const date = new Date(tickItem);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  
  if (period === 'week') {
    // Format: 2023-W01 (ISO week format)
    const [year, week] = tickItem.split('-W');
    return `${year} Week ${week}`;
  }
  
  return tickItem;
};

const TweetChart = ({ data, type, title }) => {
  const [timePeriod, setTimePeriod] = React.useState('month');
  
  const chartConfig = chartTypes[type] || chartTypes.tweetCount;
  const chartTitle = title || chartConfig.title;
  
  // Store the filtered data for each time period
  const [filteredData, setFilteredData] = React.useState([]);
  
  // Effect to update the chart when the time period or data changes
  React.useEffect(() => {
    if (data && data.length > 0) {
      // Create separate datasets for each time period
      let periodData = [];
      
      // Filter data for the selected time period
      if (timePeriod === 'year') {
        // Find year entries (no dash in period)
        periodData = data.filter(item => 
          typeof item.period === 'string' && 
          !item.period.includes('-')
        );
        console.log('Yearly data:', periodData);
      } else if (timePeriod === 'week') {
        // Find week entries (contains 'W')
        periodData = data.filter(item => 
          typeof item.period === 'string' && 
          item.period.includes('W')
        );
        console.log('Weekly data:', periodData);
      } else {
        // Default to monthly view (contains dash but no 'W')
        periodData = data.filter(item => 
          typeof item.period === 'string' && 
          item.period.includes('-') && 
          !item.period.includes('W')
        );
        console.log('Monthly data:', periodData);
      }
      
      // Ensure we have data to display
      if (periodData.length === 0) {
        console.warn(`No data found for time period: ${timePeriod}`);
        
        // If no data was found for the selected period, show a message or fallback
        // For now, we'll just set an empty array which will show an empty chart
      }
      
      setFilteredData(periodData);
    } else {
      setFilteredData([]);
    }
  }, [timePeriod, data]);
  
  return (
    <ChartContainer>
      <Title>{chartTitle}</Title>
      
      <TimePeriodSelector>
        <PeriodButton
          active={timePeriod === 'week'}
          onClick={() => setTimePeriod('week')}
        >
          Weekly
        </PeriodButton>
        <PeriodButton
          active={timePeriod === 'month'}
          onClick={() => setTimePeriod('month')}
        >
          Monthly
        </PeriodButton>
        <PeriodButton
          active={timePeriod === 'year'}
          onClick={() => setTimePeriod('year')}
        >
          Yearly
        </PeriodButton>
      </TimePeriodSelector>
      
      <ResponsiveContainer width="100%" height="85%">
        {type === 'tweetCount' ? (
          <BarChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="period" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tickFormatter={(tick) => formatXAxis(tick, timePeriod)}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name]} 
              labelFormatter={(label) => formatXAxis(label, timePeriod)} 
            />
            <Bar 
              dataKey={chartConfig.dataKey} 
              fill={chartConfig.color} 
              name={chartConfig.name} 
            />
          </BarChart>
        ) : (
          <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="period" 
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tickFormatter={(tick) => formatXAxis(tick, timePeriod)}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name]} 
              labelFormatter={(label) => formatXAxis(label, timePeriod)} 
            />
            <Legend />
            {chartConfig.metrics && chartConfig.metrics.map((metric, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={metric.dataKey}
                stroke={metric.color}
                name={metric.name}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default TweetChart;