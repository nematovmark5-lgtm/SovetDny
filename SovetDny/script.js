// App state
let currentCategory = 'advice';
let currentItems = [];
let currentIndex = 0;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let touchStartY = 0;
let touchEndY = 0;

// DOM elements
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuToggle = document.getElementById('menuToggle');
const closeSidebar = document.getElementById('closeSidebar');
const categoryItems = document.querySelectorAll('.category-item');
const mainContent = document.getElementById('mainContent');
const favoritesBtn = document.getElementById('favoritesBtn');
const favoritesPage = document.getElementById('favoritesPage');
const backBtn = document.getElementById('backBtn');
const favoritesContainer = document.getElementById('favoritesContainer');

// Initialize the app
function init() {
    // Generate items for default category
    generateCategoryItems('advice');
    
    // Display first item
    displayCurrentItem();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load favorites if any
    if (favorites.length > 0) {
        updateFavoritesButton();
    }
}

// Generate items for selected category
function generateCategoryItems(category) {
    currentItems = [];
    currentCategory = category;
    
    if (category === 'quotes') {
        programmingQuotes.forEach(cat => {
            cat.quotes.forEach(quote => {
                currentItems.push({
                    type: 'quote',
                    category: cat.category,
                    content: quote.quote,
                    author: quote.author
                });
            });
        });
    } else if (category === 'motivation') {
        motivationalQuotes.forEach(cat => {
            cat.quotes.forEach(quote => {
                currentItems.push({
                    type: 'motivation',
                    category: cat.category,
                    content: quote.quote,
                    author: quote.author
                });
            });
        });
    } else if (category === 'advice') {
        programmingAdvice.forEach(cat => {
            cat.advices.forEach(advice => {
                currentItems.push({
                    type: 'advice',
                    category: cat.category,
                    content: advice
                });
            });
        });
    } else if (category === 'facts') {
        factsAboutProgrammers.forEach(cat => {
            cat.items.forEach(item => {
                currentItems.push({
                    type: 'fact',
                    category: cat.category,
                    content: item.fact
                });
            });
        });
    }
    
    // Shuffle items for variety
    shuffleArray(currentItems);
    currentIndex = 0;
}

// Display current item based on index
function displayCurrentItem() {
    if (currentItems.length === 0) return;
    
    const item = currentItems[currentIndex];
    const isFavorite = favorites.some(fav => 
        fav.type === item.type && 
        fav.content === item.content && 
        fav.category === item.category
    );
    
    let cardHTML = '';
    
    if (item.type === 'quote' || item.type === 'motivation') {
        cardHTML = `
            <div class="card">
                <div class="card-content">
                    <span class="card-category">${item.category}</span>
                    <p class="quote-text">"${item.content}"</p>
                    <p class="quote-author">— ${item.author}</p>
                </div>
                <div class="card-actions">
                    <span class="card-counter">${currentIndex + 1} / ${currentItems.length}</span>
                    <button class="save-btn" data-index="${currentIndex}">
                        <span>💾</span> Сохранить PNG
                    </button>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-index="${currentIndex}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
            <div class="navigation-hint">Используйте свайп вверх/вниз или стрелки для навигации</div>
        `;
    } else if (item.type === 'advice') {
        cardHTML = `
            <div class="card">
                <div class="card-content">
                    <span class="card-category">${item.category}</span>
                    <p class="advice-text">${item.content}</p>
                </div>
                <div class="card-actions">
                    <span class="card-counter">${currentIndex + 1} / ${currentItems.length}</span>
                    <button class="save-btn" data-index="${currentIndex}">
                        <span>💾</span> Сохранить PNG
                    </button>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-index="${currentIndex}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
            <div class="navigation-hint">Используйте свайп вверх/вниз или стрелки для навигации</div>
        `;
    } else if (item.type === 'fact') {
        cardHTML = `
            <div class="card">
                <div class="card-content">
                    <span class="card-category">${item.category}</span>
                    <p class="fact-text">${item.content}</p>
                </div>
                <div class="card-actions">
                    <span class="card-counter">${currentIndex + 1} / ${currentItems.length}</span>
                    <button class="save-btn" data-index="${currentIndex}">
                        <span>💾</span> Сохранить PNG
                    </button>
                    <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-index="${currentIndex}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
            <div class="navigation-hint">Используйте свайп вверх/вниз или стрелки для навигации</div>
        `;
    }
    
    mainContent.innerHTML = cardHTML;
    
    // Add event listeners to buttons
    const favoriteBtn = document.querySelector('.favorite-btn');
    const saveBtn = document.querySelector('.save-btn');
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAsPNG);
    }
}

// Toggle favorite status
function toggleFavorite(e) {
    const index = parseInt(e.target.getAttribute('data-index'));
    const item = currentItems[index];
    
    const favoriteIndex = favorites.findIndex(fav => 
        fav.type === item.type && 
        fav.content === item.content && 
        fav.category === item.category
    );
    
    if (favoriteIndex === -1) {
        // Add to favorites
        favorites.push(item);
        e.target.classList.add('active');
        e.target.innerHTML = '❤️';
    } else {
        // Remove from favorites
        favorites.splice(favoriteIndex, 1);
        e.target.classList.remove('active');
        e.target.innerHTML = '🤍';
    }
    
    // Save to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesButton();
}

// Save quote as PNG
function saveAsPNG(e) {
    const index = parseInt(e.target.getAttribute('data-index'));
    const item = currentItems[index];
    
    // Create a temporary div for the PNG with optimized settings
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '1920px';
    tempDiv.style.height = '1080px';
    tempDiv.style.background = '#000000';
    tempDiv.style.display = 'flex';
    tempDiv.style.flexDirection = 'column';
    tempDiv.style.justifyContent = 'center';
    tempDiv.style.alignItems = 'center';
    tempDiv.style.padding = '100px';
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '-10000px';
    tempDiv.style.left = '-10000px';
    tempDiv.style.zIndex = '10000';
    
    let contentHTML = '';
    if (item.type === 'quote' || item.type === 'motivation') {
        contentHTML = `
            <div style="color: #ffffff; font-size: 1rem; margin-bottom: 40px; background: rgba(0, 217, 255, 0.2); padding: 12px 30px; border-radius: 25px; border: 2px solid rgba(0, 217, 255, 0.4); font-weight: 600; letter-spacing: 1px;">
                ${item.category}
            </div>
            <div style="color: #ffffff; font-size: 3.5rem; line-height: 1.4; text-align: center; margin-bottom: 60px; font-weight: 300; max-width: 1400px;">
                "${item.content}"
            </div>
            <div style="color: #00d9ff; font-size: 2rem; text-align: center; font-style: italic; font-weight: 500; margin-top: 30px;">
                — ${item.author}
            </div>
        `;
    } else if (item.type === 'advice') {
        contentHTML = `
            <div style="color: #ffffff; font-size: 1rem; margin-bottom: 40px; background: rgba(0, 217, 255, 0.2); padding: 12px 30px; border-radius: 25px; border: 2px solid rgba(0, 217, 255, 0.4); font-weight: 600; letter-spacing: 1px;">
                ${item.category}
            </div>
            <div style="color: #ffffff; font-size: 3rem; line-height: 1.5; text-align: center; margin-bottom: 60px; max-width: 1400px;">
                ${item.content}
            </div>
        `;
    } else if (item.type === 'fact') {
        contentHTML = `
            <div style="color: #ffffff; font-size: 1rem; margin-bottom: 40px; background: rgba(0, 217, 255, 0.2); padding: 12px 30px; border-radius: 25px; border: 2px solid rgba(0, 217, 255, 0.4); font-weight: 600; letter-spacing: 1px;">
                ${item.category}
            </div>
            <div style="color: #ffffff; font-size: 3rem; line-height: 1.5; text-align: center; margin-bottom: 60px; max-width: 1400px;">
                ${item.content}
            </div>
        `;
    }
    
    tempDiv.innerHTML = contentHTML;
    document.body.appendChild(tempDiv);
    
    // Use html2canvas with optimized settings for better quality
    html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#000000',
        logging: false,
        width: 1920,
        height: 1080
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `code-inspire-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        // Remove temporary div
        document.body.removeChild(tempDiv);
    });
}

// Update favorites button with count
function updateFavoritesButton() {
    const favoritesText = document.querySelector('.favorites-text');
    favoritesBtn.innerHTML = `<span>❤️</span> <span class="favorites-text">Избранные (${favorites.length})</span>`;
}

// Show favorites page
function showFavorites() {
    mainContent.style.display = 'none';
    favoritesPage.style.display = 'block';
    
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🤍</div>
                <h3>Пока ничего нет в избранном</h3>
                <p>Добавляйте понравившиеся цитаты, советы и факты, нажимая на сердечко</p>
            </div>
        `;
    } else {
        let favoritesHTML = '<div class="favorites-grid">';
        favorites.forEach((item, index) => {
            if (item.type === 'quote' || item.type === 'motivation') {
                favoritesHTML += `
                    <div class="favorite-card">
                        <div class="favorite-card-content">
                            <span class="card-category">${item.category}</span>
                            <p class="quote-text">"${item.content}"</p>
                            <p class="quote-author">— ${item.author}</p>
                        </div>
                        <div class="favorite-card-actions">
                            <button class="favorite-btn active" data-fav-index="${index}">
                                ❤️
                            </button>
                        </div>
                    </div>
                `;
            } else if (item.type === 'advice') {
                favoritesHTML += `
                    <div class="favorite-card">
                        <div class="favorite-card-content">
                            <span class="card-category">${item.category}</span>
                            <p class="advice-text">${item.content}</p>
                        </div>
                        <div class="favorite-card-actions">
                            <button class="favorite-btn active" data-fav-index="${index}">
                                ❤️
                            </button>
                        </div>
                    </div>
                `;
            } else if (item.type === 'fact') {
                favoritesHTML += `
                    <div class="favorite-card">
                        <div class="favorite-card-content">
                            <span class="card-category">${item.category}</span>
                            <p class="fact-text">${item.content}</p>
                        </div>
                        <div class="favorite-card-actions">
                            <button class="favorite-btn active" data-fav-index="${index}">
                                ❤️
                            </button>
                        </div>
                    </div>
                `;
            }
        });
        favoritesHTML += '</div>';
        
        favoritesContainer.innerHTML = favoritesHTML;
        
        // Add event listeners to favorite buttons in favorites page
        document.querySelectorAll('.favorite-btn[data-fav-index]').forEach(btn => {
            btn.addEventListener('click', removeFromFavorites);
        });
    }
}

// Remove item from favorites
function removeFromFavorites(e) {
    const index = parseInt(e.target.getAttribute('data-fav-index'));
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesButton();
    showFavorites(); // Refresh favorites page
}

// Go back to main content from favorites
function backToMain() {
    favoritesPage.style.display = 'none';
    mainContent.style.display = 'flex';
    displayCurrentItem();
}

// Handle touch events for mobile swipe
function handleTouchStart(e) {
    touchStartY = e.changedTouches[0].screenY;
}

function handleTouchEnd(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}

function handleSwipe() {
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
            // Swipe up - next item
            nextItem();
        } else {
            // Swipe down - previous item
            prevItem();
        }
    }
}

// Set up event listeners
function setupEventListeners() {
    // Menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
    
    // Close sidebar
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Overlay click to close sidebar
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });
    
    // Category selection
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active category
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Get selected category
            const category = item.getAttribute('data-category');
            
            // Generate items for selected category
            generateCategoryItems(category);
            
            // Display first item
            displayCurrentItem();
            
            // Close sidebar
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
    
    // Favorites button
    favoritesBtn.addEventListener('click', showFavorites);
    
    // Back button
    backBtn.addEventListener('click', backToMain);
    
    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            nextItem();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            prevItem();
        }
    });
    
    // Mouse wheel navigation
    mainContent.addEventListener('wheel', e => {
        e.preventDefault();
        if (e.deltaY > 0) {
            nextItem();
        } else {
            prevItem();
        }
    });
    
    // Touch events for mobile swipe
    mainContent.addEventListener('touchstart', handleTouchStart, { passive: true });
    mainContent.addEventListener('touchend', handleTouchEnd, { passive: true });
}

// Show next item
function nextItem() {
    if (currentIndex < currentItems.length - 1) {
        currentIndex++;
        displayCurrentItem();
    }
}

// Show previous item
function prevItem() {
    if (currentIndex > 0) {
        currentIndex--;
        displayCurrentItem();
    }
}

// Utility function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);