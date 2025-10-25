import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAndExtractQuestions } from '../firebase/pdfExtractionService';
import './QuestionExtractor.css';

function QuestionExtractor() {
  const navigate = useNavigate();
  
  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState('math');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ step: '', progress: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Village options
  const villages = [
    { value: 'math', label: '🔢 Math', color: '#667eea' },
    { value: 'reading', label: '📚 Reading', color: '#f093fb' },
    { value: 'finance', label: '💰 Finance', color: '#4facfe' }
  ];

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  // Handle village selection
  const handleVillageChange = (event) => {
    setSelectedVillage(event.target.value);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const result = await uploadAndExtractQuestions(
        selectedFile,
        selectedVillage,
        (progressData) => {
          setProgress(progressData);
        }
      );

      setResult(result);
      setSelectedFile(null);
      // Reset file input
      document.getElementById('pdf-input').value = '';
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.message || 'Failed to extract questions. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress({ step: '', progress: 0 });
    }
  };

  // Get progress message
  const getProgressMessage = () => {
    switch (progress.step) {
      case 'uploading':
        return '📤 Uploading PDF to storage...';
      case 'extracting':
        return '🤖 AI is extracting questions from PDF...';
      case 'fetching':
        return '📥 Loading extracted questions...';
      case 'complete':
        return '✅ Complete!';
      default:
        return 'Processing...';
    }
  };

  return (
    <div
      className="question-extractor"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/hero-background.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Header */}
      <div className="extractor-header">
        <button className="pixel-button secondary" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="retro-title">Question Extractor</h1>
        <p className="retro-sub">Upload a PDF to extract questions with AI</p>
      </div>

      {/* Main Content */}
      <div className="extractor-content">
        {/* Upload Form */}
        <div className="upload-section">
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label htmlFor="village-select" className="form-label">
                Select Village
              </label>
              <div className="village-selector">
                {villages.map((village) => (
                  <label
                    key={village.value}
                    className={`village-option ${selectedVillage === village.value ? 'selected' : ''}`}
                    style={{
                      borderColor: selectedVillage === village.value ? village.color : '#ddd'
                    }}
                  >
                    <input
                      type="radio"
                      name="village"
                      value={village.value}
                      checked={selectedVillage === village.value}
                      onChange={handleVillageChange}
                    />
                    <span>{village.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pdf-input" className="form-label">
                Choose PDF File
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="pdf-input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="file-input"
                />
                <label htmlFor="pdf-input" className="file-input-label">
                  {selectedFile ? (
                    <>
                      <span className="file-icon">📄</span>
                      <span className="file-name">{selectedFile.name}</span>
                      <span className="file-size">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">📤</span>
                      <span>Click to upload PDF</span>
                      <span className="file-hint">(Max 10MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="pixel-button primary submit-button"
              disabled={!selectedFile || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Extract Questions'}
            </button>
          </form>

          {/* Processing Status */}
          {isProcessing && (
            <div className="processing-status">
              <div className="progress-message">{getProgressMessage()}</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <div className="progress-text">{progress.progress}%</div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Display */}
        {result && (
          <div className="results-section">
            <div className="results-section-inner">
            <div className="results-header">
              <h2>✨ Extraction Complete!</h2>
              <div className="results-summary">
                <div className="summary-item">
                  <span className="summary-label">Village:</span>
                  <span className="summary-value">{result.questionSet.village}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Questions:</span>
                  <span className="summary-value">{result.extractionResult?.question_count ?? result.questions.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Set ID:</span>
                  <span className="summary-value code">{result.questionSet.id}</span>
                </div>
              </div>
            </div>

            <div className="questions-list">
              {result.questions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <span className="question-number">Question {index + 1}</span>
                    <span className={`difficulty-badge ${question.difficulty}`}>
                      {question.difficulty}
                    </span>
                  </div>
                  
                  <div className="question-stem">{question.stem}</div>
                  
                  <div className="question-options">
                    {question.labeled_options.map((option) => (
                      <div
                        key={option.label}
                        className={`option ${option.label === question.correct_label ? 'correct' : ''}`}
                      >
                        <span className="option-label">{option.label}.</span>
                        <span className="option-text">{option.text}</span>
                        {option.label === question.correct_label && (
                          <span className="correct-indicator">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {question.explanation && (
                    <div className="question-explanation">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                  
                  <div className="question-meta">
                    <span>Topic: {question.topic}</span>
                    <span>ID: {question.id}</span>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionExtractor;
