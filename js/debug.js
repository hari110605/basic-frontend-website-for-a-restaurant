// Debug script to test API functionality
console.log('Debug script loaded');

// Test API connection
async function testAPI() {
  console.log('Testing API connection...');
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test menu endpoint
    console.log('Testing menu endpoint...');
    const response = await fetch(`${API_BASE_URL}/menu/`);
    console.log('Menu response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Menu data:', data);
      console.log('Menu items count:', Array.isArray(data) ? data.length : 'Not an array');
    } else {
      console.error('Menu request failed:', response.statusText);
    }
  } catch (error) {
    console.error('Menu request error:', error);
  }
  
  try {
    // Test reviews endpoint
    console.log('Testing reviews endpoint...');
    const response = await fetch(`${API_BASE_URL}/reviews/`);
    console.log('Reviews response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Reviews data:', data);
    } else {
      console.error('Reviews request failed:', response.statusText);
    }
  } catch (error) {
    console.error('Reviews request error:', error);
  }
}

// Test when page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, testing API...');
  setTimeout(testAPI, 1000);
});

// Manual test function
window.testAPI = testAPI;
