import React, { useState, useEffect } from 'react';
import DataLoader from './components/DataLoader';
import Dashboard from './components/Dashboard';
import { filterTweetsByType, filterTweetsByDateRange } from './utils/twitterDataParser';

function App() {
  const [twitterData, setTwitterData] = useState(null);
  const [filteredTweets, setFilteredTweets] = useState(null);
  const [showMainTweetsOnly, setShowMainTweetsOnly] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const handleDataLoaded = (data) => {
    setTwitterData(data);
    setFilteredTweets(data.tweets);
    
    // Set initial date range to the full range of available tweets
    if (data.overallStats) {
      setDateRange({
        start: data.overallStats.firstTweetDate,
        end: data.overallStats.lastTweetDate
      });
    }
  };

  // Apply filters when filter settings change
  useEffect(() => {
    if (!twitterData) return;

    let filtered = [...twitterData.tweets];
    
    // Filter by tweet type if enabled
    if (showMainTweetsOnly) {
      filtered = filterTweetsByType(filtered, 'main');
    }
    
    // Filter by date range if set
    if (dateRange && dateRange.start && dateRange.end) {
      filtered = filterTweetsByDateRange(filtered, dateRange.start, dateRange.end);
    }
    
    setFilteredTweets(filtered);
  }, [twitterData, showMainTweetsOnly, dateRange]);

  return (
    <div className="App">
      {!twitterData ? (
        <DataLoader onDataLoaded={handleDataLoaded} />
      ) : (
        <Dashboard
          tweets={filteredTweets}
          originalTweets={twitterData.tweets}
          timelineData={twitterData.timelineData}
          sources={twitterData.sources}
          overallStats={twitterData.overallStats}
          showMainTweetsOnly={showMainTweetsOnly}
          setShowMainTweetsOnly={setShowMainTweetsOnly}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      )}
    </div>
  );
}

export default App;