import React, { useState } from 'react';
import styled from 'styled-components';
import { parseTweets, aggregateTweetsByTimePeriod, getTweetSourceStats, getOverallStats } from '../utils/twitterDataParser';

const Container = styled.div`
  max-width: 600px;
  margin: 100px auto;
  padding: 2rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #1da1f2;
`;

const Description = styled.p`
  margin-bottom: 2rem;
  color: #536471;
  line-height: 1.5;
`;

const UploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 10px;
  padding: 3rem;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: #1da1f2;
    background-color: #f7f9fa;
  }
  
  ${props => props.isDragging && `
    border-color: #1da1f2;
    background-color: #f7f9fa;
  `}
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #536471;
`;

const UploadText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #0f1419;
`;

const UploadSubtext = styled.p`
  font-size: 0.9rem;
  color: #536471;
`;

const Button = styled.button`
  background-color: #1da1f2;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 0 0.5rem;

  &:hover {
    background-color: #1a91da;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const DemoButton = styled(Button)`
  background-color: #15202b;
  
  &:hover {
    background-color: #273340;
  }
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: #536471;
`;

const ErrorText = styled.p`
  margin-top: 1rem;
  color: #e0245e;
`;

const DataLoader = ({ onDataLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = (file) => {
    if (file) {
      setFile(file);
      setError(null);
      
      // Auto-trigger dashboard generation after file is selected
      setTimeout(() => {
        handleProcessData(file);
      }, 300);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleProcessData = (passedFile = null) => {
    const fileToProcess = passedFile || file;
    
    if (!fileToProcess) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        // Read the content of the file
        const content = e.target.result;
        
        // Need to remove the window assignment part and get only the JSON
        // The format is typically: window.YTD.tweets.part0 = [...]
        const jsonStr = content.replace(/^window\.YTD\.tweets\.part0\s*=\s*/, '');
        const tweetsData = JSON.parse(jsonStr);
        
        // Parse data
        const parsedTweets = parseTweets(tweetsData);
        const timelineData = aggregateTweetsByTimePeriod(parsedTweets, 'month');
        const sourceStats = getTweetSourceStats(parsedTweets);
        const stats = getOverallStats(parsedTweets);
        
        // Call the callback with the processed data
        onDataLoaded({
          tweets: parsedTweets,
          timelineData,
          sources: sourceStats,
          overallStats: stats
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing file:', err);
        setError('There was an error processing the file. Please make sure it is a valid tweets.js file from your Twitter archive.');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('There was an error reading the file');
      setIsLoading(false);
    };

    reader.readAsText(fileToProcess);
  };

  const handleLoadDemoData = () => {
    setIsLoadingDemo(true);
    setError(null);

    // Get the base URL based on the current environment
    const baseUrl = process.env.PUBLIC_URL || '';
    const demoFileUrl = `${baseUrl}/assets/tweets.js`;
    
    console.log('Attempting to load demo data from:', demoFileUrl);
    
    // Fetch the demo tweets.js file
    fetch(demoFileUrl)
      .then(response => {
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to load demo data: ${response.status} ${response.statusText}`);
        }
        
        // Get content type to help with debugging
        const contentType = response.headers.get('content-type');
        console.log('Content type:', contentType);
        
        return response.text().then(text => {
          // Log the first 100 characters to see what we're getting
          console.log('Response preview:', text.substring(0, 100));
          return text;
        });
      })
      .then(content => {
        try {
          // Need to remove the window assignment part and get only the JSON
          // First check if the content seems to be an HTML response (which would indicate an error)
          if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
            throw new Error('Received HTML instead of tweets.js data');
          }
          
          console.log('Processing tweets data...');
          // Try to extract the JSON part
          const jsonStr = content.replace(/^window\.YTD\.tweets\.part0\s*=\s*/, '');
          
          // Log a small sample of the processed string for debugging
          console.log('Processed JSON string preview:', jsonStr.substring(0, 100));
          
          const tweetsData = JSON.parse(jsonStr);
          
          // Parse data
          const parsedTweets = parseTweets(tweetsData);
          const timelineData = aggregateTweetsByTimePeriod(parsedTweets, 'month');
          const sourceStats = getTweetSourceStats(parsedTweets);
          const stats = getOverallStats(parsedTweets);
          
          // Call the callback with the processed data
          onDataLoaded({
            tweets: parsedTweets,
            timelineData,
            sources: sourceStats,
            overallStats: stats
          });
          
          setIsLoadingDemo(false);
        } catch (err) {
          console.error('Error processing demo data:', err);
          setError('There was an error processing the demo data.');
          setIsLoadingDemo(false);
        }
      })
      .catch(err => {
        console.error('Error loading demo data:', err);
        const errorDetails = err.message || 'Unknown error';
        setError(`Failed to load demo data: ${errorDetails}. Check console for details.`);
        setIsLoadingDemo(false);
      });
  };

  return (
    <Container>
      <Title>Twitter Archive Dashboard</Title>
      <Description>
        Upload your Twitter archive's tweets.js file to visualize your Twitter activity and engagement metrics over time. 
        No Twitter archive? Use our demo data to explore the dashboard features.
      </Description>
      
      <UploadArea 
        onClick={handleUploadClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        isDragging={isDragging}
      >
        <UploadIcon>📤</UploadIcon>
        <UploadText>{file ? file.name : 'Select tweets.js file'}</UploadText>
        <UploadSubtext>Click to browse files or drag and drop</UploadSubtext>
        <input
          type="file"
          accept=".js"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
      </UploadArea>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Button onClick={handleProcessData} disabled={!file || isLoading || isLoadingDemo}>
          {isLoading ? 'Processing...' : 'Generate Dashboard'}
        </Button>
        
        <DemoButton onClick={handleLoadDemoData} disabled={isLoading || isLoadingDemo}>
          {isLoadingDemo ? 'Loading demo...' : 'Try Demo Data'}
        </DemoButton>
      </div>
      
      <UploadSubtext style={{ marginTop: '1rem' }}>
        Don't have a tweets.js file? Click "Try Demo Data" to see how it works.
      </UploadSubtext>
      
      {(isLoading || isLoadingDemo) && <LoadingText>Processing Twitter data...</LoadingText>}
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

export default DataLoader;