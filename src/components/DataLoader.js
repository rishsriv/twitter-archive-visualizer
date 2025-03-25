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

  &:hover {
    background-color: #1a91da;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
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

  return (
    <Container>
      <Title>Twitter Archive Dashboard</Title>
      <Description>
        Upload your Twitter archive's tweets.js file to visualize your Twitter activity and engagement metrics over time.
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
      
      <Button onClick={handleProcessData} disabled={!file || isLoading}>
        {isLoading ? 'Processing...' : 'Generate Dashboard'}
      </Button>
      
      {isLoading && <LoadingText>Processing your Twitter data...</LoadingText>}
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

export default DataLoader;