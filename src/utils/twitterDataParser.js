/**
 * This file contains utilities for parsing Twitter archive data
 */

// Function to parse tweets data
export const parseTweets = (data) => {
  if (!data || !data.length) return [];
  
  const tweets = data.map(item => {
    const tweet = item.tweet;
    
    // Parse the creation date
    const createdAt = new Date(tweet.created_at);
    
    return {
      id: tweet.id_str,
      text: tweet.full_text,
      createdAt,
      year: createdAt.getFullYear(),
      month: createdAt.getMonth(),
      date: createdAt.toISOString().split('T')[0], // YYYY-MM-DD format
      favorites: parseInt(tweet.favorite_count) || 0,
      retweets: parseInt(tweet.retweet_count) || 0,
      isRetweet: tweet.retweeted || false,
      isReply: !!tweet.in_reply_to_status_id_str,
      hasMedia: !!(tweet.entities && tweet.entities.media && tweet.entities.media.length > 0),
      hasUrls: !!(tweet.entities && tweet.entities.urls && tweet.entities.urls.length > 0),
      source: tweet.source ? 
        tweet.source.replace(/<[^>]*>/g, '').trim() : 
        'Unknown Source',
    };
  });
  
  return tweets;
};

// Function to filter tweets by type
export const filterTweetsByType = (tweets, type) => {
  if (!tweets || !tweets.length) return [];
  
  switch (type) {
    case 'main': // Only original tweets (not replies, not retweets)
      return tweets.filter(tweet => !tweet.isRetweet && !tweet.isReply);
    case 'replies':
      return tweets.filter(tweet => tweet.isReply);
    case 'retweets':
      return tweets.filter(tweet => tweet.isRetweet);
    default:
      return tweets;
  }
};

// Function to filter tweets by date range
export const filterTweetsByDateRange = (tweets, startDate, endDate) => {
  if (!tweets || !tweets.length) return [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set end date to the end of the day
  end.setHours(23, 59, 59, 999);
  
  return tweets.filter(tweet => {
    const tweetDate = new Date(tweet.createdAt);
    return tweetDate >= start && tweetDate <= end;
  });
};

// Helper function to get ISO week number
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); // Thursday in current week
  const week1 = new Date(d.getFullYear(), 0, 4); // Jan 4 is always in week 1
  const weekNum = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return {
    year: d.getFullYear(),
    week: weekNum
  };
};

// Function to aggregate tweet stats by time period
export const aggregateTweetsByTimePeriod = (tweets, period = 'month') => {
  if (!tweets || !tweets.length) return [];
  
  const aggregated = {};
  
  tweets.forEach(tweet => {
    let key;
    if (period === 'day') {
      key = tweet.date;
    } else if (period === 'week') {
      const { year, week } = getWeekNumber(tweet.createdAt);
      key = `${year}-W${String(week).padStart(2, '0')}`;
    } else if (period === 'month') {
      key = `${tweet.year}-${String(tweet.month + 1).padStart(2, '0')}`;
    } else if (period === 'year') {
      key = tweet.year.toString();
    }
    
    if (!aggregated[key]) {
      aggregated[key] = {
        period: key,
        count: 0,
        favorites: 0,
        retweets: 0,
        replies: 0,
        originalTweets: 0,
        retweetCount: 0,
        withMedia: 0,
        withUrls: 0,
      };
    }
    
    aggregated[key].count++;
    aggregated[key].favorites += tweet.favorites;
    aggregated[key].retweets += tweet.retweets;
    
    if (tweet.isReply) aggregated[key].replies++;
    if (!tweet.isRetweet && !tweet.isReply) aggregated[key].originalTweets++;
    if (tweet.isRetweet) aggregated[key].retweetCount++;
    if (tweet.hasMedia) aggregated[key].withMedia++;
    if (tweet.hasUrls) aggregated[key].withUrls++;
  });
  
  // Convert to array and sort by period
  return Object.values(aggregated).sort((a, b) => a.period.localeCompare(b.period));
};

// Function to get stats about tweet sources
export const getTweetSourceStats = (tweets) => {
  if (!tweets || !tweets.length) return [];
  
  const sources = {};
  
  tweets.forEach(tweet => {
    if (!sources[tweet.source]) {
      sources[tweet.source] = {
        name: tweet.source,
        count: 0,
      };
    }
    
    sources[tweet.source].count++;
  });
  
  // Convert to array and sort by count (descending)
  return Object.values(sources)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Only return top 10 sources
};

// Function to get overall stats
export const getOverallStats = (tweets) => {
  if (!tweets || !tweets.length) return null;
  
  const stats = {
    totalTweets: tweets.length,
    totalFavorites: tweets.reduce((sum, tweet) => sum + tweet.favorites, 0),
    totalRetweets: tweets.reduce((sum, tweet) => sum + tweet.retweets, 0),
    originalTweets: tweets.filter(t => !t.isRetweet && !t.isReply).length,
    replies: tweets.filter(t => t.isReply).length,
    retweets: tweets.filter(t => t.isRetweet).length,
    withMedia: tweets.filter(t => t.hasMedia).length,
    withUrls: tweets.filter(t => t.hasUrls).length,
    firstTweetDate: new Date(Math.min(...tweets.map(t => t.createdAt))),
    lastTweetDate: new Date(Math.max(...tweets.map(t => t.createdAt))),
  };
  
  // Get most popular tweets
  stats.mostLikedTweets = [...tweets]
    .sort((a, b) => b.favorites - a.favorites)
    .slice(0, 20);
    
  stats.mostRetweetedTweets = [...tweets]
    .sort((a, b) => b.retweets - a.retweets)
    .slice(0, 20);
  
  return stats;
};