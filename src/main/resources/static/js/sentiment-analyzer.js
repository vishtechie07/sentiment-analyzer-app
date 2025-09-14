/**
 * Frontend for the Sentiment Analyzer App
 * 
 * Handles the UI, makes API calls to the backend,
 * and manages results display and history.
 * 
 * @author Vishnu
 */

/**
 * Main class that manages the frontend.
 * 
 * Handles text input, API calls, result display,
 * history management, and user interactions.
 */
class SentimentAnalyzer {
    
    /**
     * Sets up the app with default values.
     */
    constructor() {
        // API endpoint for sentiment analysis
        this.apiUrl = '/api/analyze';
        
        // App state
        this.analysisCount = 0;        // Total analyses done
        this.textHistory = [];         // Analysis history
        this.positiveCount = 0;        // Positive sentiment count
        this.negativeCount = 0;        // Negative sentiment count
        this.neutralCount = 0;         // Neutral sentiment count
        
        // Start the app
        this.init();
    }

    /**
     * Sets up the app by binding events, loading saved data,
     * and updating the display.
     */
    init() {
        this.bindEvents();
        this.updateCharCount();
        this.updateAnalysisCounter();
        this.updateSentimentCounters();
        this.loadFromLocalStorage();
    }

    /**
     * Connects event listeners to DOM elements.
     */
    bindEvents() {
        // Text input events
        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.addEventListener('input', () => this.updateCharCount());
        }

        // Analysis button events
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeSentiment());
        }

        // Clear history button events
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }

        // Retry button events
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.hideError());
        }

        // Enter key support for text input
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.analyzeSentiment();
                }
            });
        }
    }

    /**
     * Updates the character count display.
     */
    updateCharCount() {
        const textInput = document.getElementById('textInput');
        const charCount = document.getElementById('charCount');
        
        if (textInput && charCount) {
            const count = textInput.value.length;
            charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Updates the total analysis counter display.
     */
    updateAnalysisCounter() {
        const counterElement = document.getElementById('analysisCounter');
        if (counterElement) {
            counterElement.textContent = this.analysisCount;
        }
    }

    /**
     * Updates the individual sentiment counter displays.
     */
    updateSentimentCounters() {
        const positiveScoreElement = document.getElementById('positiveScore');
        const negativeScoreElement = document.getElementById('negativeScore');
        const neutralScoreElement = document.getElementById('neutralScore');

        if (positiveScoreElement) positiveScoreElement.textContent = this.positiveCount;
        if (negativeScoreElement) negativeScoreElement.textContent = this.negativeCount;
        if (neutralScoreElement) neutralScoreElement.textContent = this.neutralCount;
    }

    /**
     * Performs sentiment analysis on the input text.
     * 
     * This method sends the text to the backend API, processes the response,
     * and updates the UI with the results. It also manages loading states
     * and error handling.
     */
    async analyzeSentiment() {
        const textInput = document.getElementById('textInput');
        const text = textInput ? textInput.value : '';

        // Enhanced input validation and sanitization
        if (!text) {
            this.showError('Please enter some text to analyze.');
            return;
        }
        
        // Sanitize input to prevent XSS and injection attacks
        const sanitizedText = this.sanitizeInput(text);
        if (!sanitizedText) {
            this.showError('Please enter valid text to analyze.');
            return;
        }
        
        // Check length limits
        if (sanitizedText.length > 10000) {
            this.showError('Text is too long. Please enter text with 10,000 characters or less.');
            return;
        }

        // Show loading state
        this.showLoading();
        this.hideResults();
        this.hideError();

        try {
            // Make API request with sanitized text
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:admin123') // TODO: Replace with proper authentication
                },
                body: JSON.stringify({ text: sanitizedText })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please check your credentials.');
                } else if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData.sentiment || 'Invalid input. Please check your text.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const result = await response.json();

            // Increment counters and add to history
            this.analysisCount++;
            
            // Increment the appropriate sentiment counter based on result
            if (result.sentiment === 'Positive') {
                this.positiveCount++;
            } else if (result.sentiment === 'Negative') {
                this.negativeCount++;
            } else if (result.sentiment === 'Neutral') {
                this.neutralCount++;
            }
            
            // Add to history and update displays
            this.addToHistory(sanitizedText, result.sentiment, result.confidence);
            this.updateAnalysisCounter();
            this.updateSentimentCounters();
            
            // Display results
            this.displayResults(result);
            
            // Save to localStorage
            this.saveToLocalStorage();

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message || 'Failed to analyze text. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Displays the sentiment analysis results in the UI.
     * 
     * @param {Object} result - The sentiment analysis result object
     */
    displayResults(result) {
        // Update sentiment icon and text
        const sentimentIcon = document.getElementById('sentimentIcon');
        const sentimentText = document.getElementById('sentimentText');
        const confidenceText = document.getElementById('confidenceText');
        const originalText = document.getElementById('originalText');

        if (sentimentIcon) {
            sentimentIcon.textContent = this.getSentimentIcon(result.sentiment);
        }

        if (sentimentText) {
            sentimentText.textContent = result.sentiment;
            sentimentText.className = `text-3xl font-bold mb-2 ${this.getSentimentColor(result.sentiment)}`;
        }

        if (confidenceText) {
            const confidencePercent = Math.round(result.confidence * 100);
            confidenceText.textContent = `Confidence: ${confidencePercent}%`;
        }

        if (originalText) {
            originalText.textContent = result.text;
        }

        // Show results section
        this.showResults();
    }

    /**
     * Returns the appropriate emoji icon for a given sentiment.
     * 
     * @param {string} sentiment - The sentiment classification
     * @returns {string} The emoji icon
     */
    getSentimentIcon(sentiment) {
        switch (sentiment.toLowerCase()) {
            case 'positive':
                return '😊';
            case 'negative':
                return '😞';
            case 'neutral':
            default:
                return '😐';
        }
    }

    /**
     * Returns the appropriate CSS color class for a given sentiment.
     * 
     * @param {string} sentiment - The sentiment classification
     * @returns {string} The CSS color class
     */
    getSentimentColor(sentiment) {
        switch (sentiment.toLowerCase()) {
            case 'positive':
                return 'text-green-600';
            case 'negative':
                return 'text-red-600';
            case 'neutral':
            default:
                return 'text-gray-600';
        }
    }

    /**
     * Adds an analysis result to the history.
     * 
     * @param {string} text - The analyzed text
     * @param {string} sentiment - The sentiment result
     * @param {number} confidence - The confidence score
     */
    addToHistory(text, sentiment, confidence) {
        const historyItem = {
            text: text,
            sentiment: sentiment,
            confidence: confidence,
            timestamp: new Date().toLocaleString()
        };

        this.textHistory.unshift(historyItem);
        
        // Limit history to last 50 items
        if (this.textHistory.length > 50) {
            this.textHistory = this.textHistory.slice(0, 50);
        }

        this.updateHistoryDisplay();
    }

    /**
     * Updates the history display in the UI.
     */
    updateHistoryDisplay() {
        const historyContainer = document.getElementById('historyContainer');
        if (!historyContainer) return;

        if (this.textHistory.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No analyses yet. Start by analyzing some text!</p>';
            return;
        }

        const historyHTML = this.textHistory.map(item => `
            <div class="history-item bg-gray-50 p-4 rounded-lg border-l-4 ${this.getHistoryItemBorderColor(item.sentiment)}">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-semibold text-gray-800">${item.sentiment}</span>
                    <span class="text-sm text-gray-500">${item.timestamp}</span>
                </div>
                <p class="text-gray-700 line-clamp-2">${this.escapeHtml(item.text)}</p>
                <div class="mt-2 text-sm text-gray-600">
                    Confidence: ${Math.round(item.confidence * 100)}%
                </div>
            </div>
        `).join('');

        historyContainer.innerHTML = historyHTML;
    }

    /**
     * Returns the appropriate border color class for history items.
     * 
     * @param {string} sentiment - The sentiment classification
     * @returns {string} The CSS border color class
     */
    getHistoryItemBorderColor(sentiment) {
        switch (sentiment.toLowerCase()) {
            case 'positive':
                return 'border-green-500';
            case 'negative':
                return 'border-red-500';
            case 'neutral':
            default:
                return 'border-gray-500';
        }
    }

    /**
     * Escapes HTML content to prevent XSS attacks.
     * 
     * @param {string} text - The text to escape
     * @returns {string} The escaped text
     */
    escapeHtml(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        
        // More comprehensive HTML escaping
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    /**
     * Sanitizes user input to prevent malicious content.
     * 
     * @param {string} text - The text to sanitize
     * @returns {string} The sanitized text
     */
    sanitizeInput(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        
        // Remove potentially dangerous patterns
        let sanitized = text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/data:text\/html/gi, '')
            .replace(/vbscript:/gi, '');
        
        // Limit length
        if (sanitized.length > 10000) {
            sanitized = sanitized.substring(0, 10000);
        }
        
        return sanitized.trim();
    }

    /**
     * Clears the analysis history and resets counters.
     */
    clearHistory() {
        this.textHistory = [];
        this.analysisCount = 0;
        this.positiveCount = 0;
        this.negativeCount = 0;
        this.neutralCount = 0;
        
        this.updateHistoryDisplay();
        this.updateAnalysisCounter();
        this.updateSentimentCounters();
        this.saveToLocalStorage();
    }

    /**
     * Saves application state to localStorage for persistence.
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('sentimentAnalyzerHistory', JSON.stringify(this.textHistory));
            localStorage.setItem('sentimentAnalyzerCount', this.analysisCount.toString());
            localStorage.setItem('sentimentAnalyzerPositiveCount', this.positiveCount.toString());
            localStorage.setItem('sentimentAnalyzerNegativeCount', this.negativeCount.toString());
            localStorage.setItem('sentimentAnalyzerNeutralCount', this.neutralCount.toString());
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    /**
     * Loads application state from localStorage.
     */
    loadFromLocalStorage() {
        try {
            const savedHistory = localStorage.getItem('sentimentAnalyzerHistory');
            const savedCount = localStorage.getItem('sentimentAnalyzerCount');
            const savedPositiveCount = localStorage.getItem('sentimentAnalyzerPositiveCount');
            const savedNegativeCount = localStorage.getItem('sentimentAnalyzerNegativeCount');
            const savedNeutralCount = localStorage.getItem('sentimentAnalyzerNeutralCount');
            
            if (savedHistory) {
                this.textHistory = JSON.parse(savedHistory);
            }
            if (savedCount) {
                this.analysisCount = parseInt(savedCount);
            }
            if (savedPositiveCount) {
                this.positiveCount = parseInt(savedPositiveCount);
            }
            if (savedNegativeCount) {
                this.negativeCount = parseInt(savedNegativeCount);
            }
            if (savedNeutralCount) {
                this.neutralCount = parseInt(savedNeutralCount);
            }
            
            this.updateAnalysisCounter();
            this.updateHistoryDisplay();
            this.updateSentimentCounters();
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
        }
    }

    // UI State Management Methods

    /**
     * Shows the loading section and hides other sections.
     */
    showLoading() {
        this.hideResults();
        this.hideError();
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) loadingSection.classList.remove('hidden');
    }

    /**
     * Hides the loading section.
     */
    hideLoading() {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) loadingSection.classList.add('hidden');
    }

    /**
     * Shows the results section.
     */
    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) resultsSection.classList.remove('hidden');
    }

    /**
     * Hides the results section.
     */
    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) resultsSection.classList.add('hidden');
    }

    /**
     * Shows the error section with a specific message.
     * 
     * @param {string} message - The error message to display
     */
    showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        
        if (errorSection) errorSection.classList.remove('hidden');
        if (errorMessage) errorMessage.textContent = message;
    }

    /**
     * Hides the error section.
     */
    hideError() {
        const errorSection = document.getElementById('errorSection');
        if (errorSection) errorSection.classList.add('hidden');
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SentimentAnalyzer();
});
