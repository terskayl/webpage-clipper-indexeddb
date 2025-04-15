/**
 * Content script for the Webpage Clipper extension
 * Extracts page content and sends it to the background script
 */

// Function to extract text content from the DOM
function extractTextContent(doc) {
  // Get all text nodes from the body
  const bodyText = doc.body.innerText || doc.body.textContent || '';
  
  // Limit to first 100 words
  const words = bodyText.split(/\s+/);
  const firstHundredWords = words.slice(0, 100).join(' ');
  
  return firstHundredWords + (words.length > 100 ? '...' : '');
}

// Function to get total word count
function extractWordCount(doc) {
  // Get all text nodes from the body
  const bodyText = doc.body.innerText || doc.body.textContent || '';
  
  // Limit to first 100 words
  const words = bodyText.split(/\s+/);
  
  return words.length; // Return total word count
}

// Function to get the reading time estimate
function getReadingTime(doc) {
  return extractWordCount(doc) / 150; // Average reading speed is 150 words per minute
}

// Function to clip the current page
function clipCurrentPage() {
  const pageData = {
    title: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    content: extractTextContent(document),
    wordCount: extractWordCount(document),
    readingTime: getReadingTime(document).toFixed(2),
  };
  
  // Send the data to the background script
  chrome.runtime.sendMessage({
    action: 'clipPage',
    data: pageData
  }, response => {
    if (response && response.success) {
      console.log('Page clipped successfully');
    } else {
      console.error('Failed to clip page');
    }
  });
}

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Respond to ping to check if content script is loaded
  if (message.action === 'ping') {
    sendResponse({ success: true });
    return;
  }
  
  if (message.action === 'clipPage') {
    clipCurrentPage();
    sendResponse({ success: true });
  }
});
