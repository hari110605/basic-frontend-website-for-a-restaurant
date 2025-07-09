// ===============================================================================
//                    MENU MODULE
// ===============================================================================

let menuItems = [];

// Load menu items from API
async function loadMenuItems() {
  const loadingElement = document.getElementById('menuLoading');
  const errorElement = document.getElementById('menuError');
  const gridElement = document.getElementById('menuGrid');

  console.log('loadMenuItems called');
  console.log('Elements:', { loadingElement, errorElement, gridElement });

  // Show loading state
  if (loadingElement) loadingElement.style.display = 'block';
  if (errorElement) errorElement.style.display = 'none';
  if (gridElement) gridElement.style.display = 'none';

  try {
    // Direct fetch call to test
    const url = `${API_BASE_URL}/menu/`;
    console.log('Fetching from:', url);

    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Menu data received:', data);

    // Handle both array response and object with results
    menuItems = Array.isArray(data) ? data : (data.results || data.data || []);
    console.log('Processed menu items:', menuItems);

    // Log image URLs for debugging
    menuItems.forEach(item => {
      console.log(`Item: ${item.food_name}, Image: ${item.food_image}, Available: ${item.is_available}`);
    });

    renderMenuItems(menuItems);

    // Show menu grid
    if (loadingElement) loadingElement.style.display = 'none';
    if (gridElement) gridElement.style.display = 'grid';

  } catch (error) {
    console.error('Failed to load menu:', error);

    // Show error state
    if (loadingElement) loadingElement.style.display = 'none';
    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.innerHTML = `
        <p>Failed to load menu items: ${error.message}</p>
        <button class="btn btn-primary" onclick="loadMenuItems()">Retry</button>
      `;
    }
  }
}

// Render menu items in the grid
function renderMenuItems(items) {
  const gridElement = document.getElementById('menuGrid');
  if (!gridElement) return;
  
  if (items.length === 0) {
    gridElement.innerHTML = '<p class="no-menu-items">No menu items available at the moment.</p>';
    return;
  }
  
  gridElement.innerHTML = items.map(item => createMenuItemHTML(item)).join('');
}

// Create HTML for a single menu item
function createMenuItemHTML(item) {
  // Handle image URL - if it's a relative path from backend, make it absolute
  let imageUrl = 'images/default-food.svg'; // Default fallback

  if (item.food_image) {
    if (item.food_image.startsWith('http')) {
      // Already a full URL
      imageUrl = item.food_image;
    } else if (item.food_image.startsWith('/')) {
      // Absolute path from backend - prepend backend base URL
      const backendBase = API_BASE_URL.replace('/api', '');
      imageUrl = `${backendBase}${item.food_image}`;
    } else {
      // Relative path - prepend backend media URL
      const backendBase = API_BASE_URL.replace('/api', '');
      imageUrl = `${backendBase}/media/${item.food_image}`;
    }
  }

  const isAvailable = item.is_available !== false;

  console.log(`Menu item ${item.food_name}: original image = ${item.food_image}, processed = ${imageUrl}`);
  
  return `
    <div class="menu-card ${!isAvailable ? 'unavailable' : ''}" data-id="${item.id}">
      <div class="image-container">
        <img src="${imageUrl}" alt="${item.food_name}" onerror="handleImageError(this, '${item.food_name}')" loading="lazy">
      </div>
      <div class="menu-content">
        <h3>${item.food_name}</h3>
        <p>${item.food_description}</p>
        <div class="price">${formatPrice(item.food_price)}</div>
        ${isAvailable ?
          `<button class="add-to-cart-btn" onclick="addToCart(${item.id})">
            Add to Cart
          </button>` :
          `<button class="add-to-cart-btn" disabled>
            Currently Unavailable
          </button>`
        }
      </div>
      ${!isAvailable ? '<div class="unavailable-overlay">Unavailable</div>' : ''}
    </div>
  `;
}

// Get menu item by ID (for cart integration)
function getMenuItemById(id) {
  return menuItems.find(item => item.id === id);
}

// Search menu items
function searchMenuItems(query) {
  if (!query.trim()) {
    renderMenuItems(menuItems);
    return;
  }
  
  const filteredItems = menuItems.filter(item => 
    item.food_name.toLowerCase().includes(query.toLowerCase()) ||
    item.food_description.toLowerCase().includes(query.toLowerCase())
  );
  
  renderMenuItems(filteredItems);
}

// Filter menu items by price range
function filterByPriceRange(minPrice, maxPrice) {
  const filteredItems = menuItems.filter(item => 
    item.food_price >= minPrice && item.food_price <= maxPrice
  );
  
  renderMenuItems(filteredItems);
}

// Sort menu items
function sortMenuItems(sortBy) {
  let sortedItems = [...menuItems];
  
  switch (sortBy) {
    case 'name':
      sortedItems.sort((a, b) => a.food_name.localeCompare(b.food_name));
      break;
    case 'price-low':
      sortedItems.sort((a, b) => a.food_price - b.food_price);
      break;
    case 'price-high':
      sortedItems.sort((a, b) => b.food_price - a.food_price);
      break;
    case 'newest':
      sortedItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    default:
      // Keep original order
      break;
  }
  
  renderMenuItems(sortedItems);
}

// Add search and filter functionality to page
function initializeMenuFilters() {
  // Add search bar
  const menuHeader = document.querySelector('.menu-header');
  if (menuHeader) {
    const searchHTML = `
      <div class="menu-filters">
        <div class="search-container">
          <input type="text" id="menuSearch" placeholder="Search menu items..." class="search-input">
          <button onclick="searchMenuItems(document.getElementById('menuSearch').value)" class="search-btn">🔍</button>
        </div>
        <div class="filter-container">
          <select id="sortSelect" onchange="sortMenuItems(this.value)" class="filter-select">
            <option value="">Sort by...</option>
            <option value="name">Name (A-Z)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>
    `;
    
    menuHeader.insertAdjacentHTML('beforeend', searchHTML);
    
    // Add real-time search
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchMenuItems(e.target.value);
      });
    }
  }
}

// Handle image loading errors
function handleImageError(img, itemName) {
  console.log(`Image failed to load for ${itemName}, using fallback`);

  // Try different fallback strategies
  if (img.src.includes('default-food.svg')) {
    // Already using fallback, try a different one
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDxjaXJjbGUgY3g9IjE1MCIgY3k9IjgwIiByPSIyNSIgZmlsbD0iI2U0NTE0ZSIgb3BhY2l0eT0iMC4zIi8+CiAgPHJlY3QgeD0iMTI1IiB5PSIxMTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzMCIgcng9IjUiIGZpbGw9IiNlNDUxNGUiIG9wYWNpdHk9IjAuMyIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiPkZvb2QgSW1hZ2U8L3RleHQ+CiAgPHRleHQgeD0iMTUwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSI+Q29taW5nIFNvb248L3RleHQ+Cjwvc3ZnPg==';
  } else {
    // Try the SVG fallback first
    img.src = 'images/default-food.svg';
  }

  // Remove any error handlers to prevent infinite loops
  img.onerror = null;
}



// Initialize menu page
document.addEventListener('DOMContentLoaded', () => {
  // Only run on menu page
  if (document.getElementById('menuGrid')) {
    // Wait a bit for all scripts to load
    setTimeout(() => {
      loadMenuItems();
      initializeMenuFilters();
    }, 100);
  }
});

// Also try to load when window is fully loaded
window.addEventListener('load', () => {
  if (document.getElementById('menuGrid') && menuItems.length === 0) {
    loadMenuItems();
  }
});

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  window.loadMenuItems = loadMenuItems;
  window.searchMenuItems = searchMenuItems;
  window.sortMenuItems = sortMenuItems;
  window.getMenuItemById = getMenuItemById;
  window.handleImageError = handleImageError;
  window.menuItems = menuItems; // Export menu items for cart access
}
