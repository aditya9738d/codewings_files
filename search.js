document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission behavior
        searchApps();
    }
});

async function searchApps() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm === '') {
        alert('Please enter a search term.');
        return;
    }

    try {
        // Check if the search term already exists in the database
        const searchRef = database.ref('search_history').child(searchTerm);
        const snapshot = await searchRef.once('value');
        const existingTerm = snapshot.val();

        // If the search term exists, update the count
        if (existingTerm) {
            await searchRef.update({ count: existingTerm.count + 1 });
        } else {
            // Save searched app name to Firebase
            await searchRef.set({ count: 1 });
        }

        // Show loading screen
        showLoadingScreen();

        const response = await fetch(`https://nextjs-search-lovat.vercel.app/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch search results.');
        }
        const searchResults = await response.json();
        displaySearchResults(searchResults);

        // Hide the "Top Searches" title and list
        const topSearchTitle = document.getElementById('topSearchTerms').querySelector('h2');
        const topSearchList = document.getElementById('topSearchTerms');
        topSearchTitle.style.display = 'none';
        topSearchList.style.display = 'none';

    } catch (error) {
        console.error('Error searching apps:', error.message);
        alert('An error occurred while searching apps. Please try again later.');
    } finally {
        // Hide loading screen regardless of success or failure
        hideLoadingScreen();
    }
}


function showLoadingScreen() {
    // Show loading spinner or message
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'block';
}

function hideLoadingScreen() {
    // Hide loading spinner or message
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'none';
}

function displaySearchResults(results) {
    const searchResultsList = document.getElementById('searchResults');
    searchResultsList.innerHTML = '';

    if (results.length === 0) {
        searchResultsList.innerHTML = '<li>No results found.</li>';
    } else {
        results.forEach((app, index) => {
            const appCard = createAppCard(app, index);
            searchResultsList.appendChild(appCard);
        });
    }
}

function createAppCard(app, index) {
    const card = document.createElement('div');
    card.classList.add('app-card-today');
    card.id = `app-card-${index + 1}`; // Add unique ID for each card

    card.innerHTML = `
        <div class="logo-container">
            <img src="${app.logo}" alt="${app.name} Logo">
        </div>
        <h2 class="app-name">${app.name}</h2>
        <p class="app-counter"> <span class="click-count">0</span></p>
    `;

    // Function to fetch and update the click count from Firebase
    async function updateClickCount() {
        const appRef = database.ref(`card_clicks/${app.title}`);
        const snapshot = await appRef.once('value');
        const currentCount = snapshot.val() || 0;

        // Update the counter text in the card
        const clickCountElement = card.querySelector('.click-count');
        if (clickCountElement) {
            clickCountElement.textContent = currentCount;
        }
    }

    // Click event listener for the card
    card.addEventListener('click', (event) => {
        if (!card.classList.contains('overlay-active')) {
            // Generate URL parameters for the app details
            const urlParams = new URLSearchParams();
            urlParams.set('name', app.name);
            urlParams.set('logo', app.logo);
            urlParams.set('url', app.link);

            const detailsPageUrl = `join.html?${urlParams.toString()}`;
            window.open(detailsPageUrl, '_blank');

            // Update click count in Firebase when the card is clicked
            const appRef = database.ref(`card_clicks/${app.title}`);
            appRef.transaction((currentCount) => {
                const newCount = (currentCount || 0) + 1;
                // Update the counter text in the card
                const clickCountElement = card.querySelector('.click-count');
                if (clickCountElement) {
                    clickCountElement.textContent = newCount;
                }
                return newCount;
            });
        }

        event.stopPropagation();
    });

    // Fetch and update the initial click count
    updateClickCount();

    return card;
}


// Call this function when the page loads to fetch and display the top searched terms
window.onload = async function() {
    await displayTopSearchTerms();
}

async function displayTopSearchTerms() {
    try {
        // Fetch the top searched terms from Firebase
        const topSearchRef = database.ref('search_history').orderByChild('count').limitToLast(5);
        const snapshot = await topSearchRef.once('value');
        const topSearchTerms = [];
        snapshot.forEach((childSnapshot) => {
            topSearchTerms.push({
                term: childSnapshot.key,
                count: childSnapshot.val().count
            });
        });

        // Sort the terms based on their click counts (most clicked first)
        topSearchTerms.sort((a, b) => b.count - a.count);

        // Display the "Top Searched" title
        const topSearchTitle = document.createElement('h2');
        topSearchTitle.textContent = 'Top Searches';
        const topSearchTermsList = document.getElementById('topSearchTerms');
        topSearchTermsList.appendChild(topSearchTitle);

        // Display the top searched terms in the HTML
        topSearchTerms.forEach((termObj, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `➜  &nbsp; ${termObj.term}`;
            listItem.addEventListener('click', () => {
                searchForTerm(termObj.term);
                updateClickCount(termObj.term);
                // Hide the "Top Searches" title
                topSearchTitle.style.display = 'none';
                // Hide all list items
                const listItems = topSearchTermsList.querySelectorAll('li');
                listItems.forEach(item => {
                    item.style.display = 'none';
                });
                // Write the clicked text into the search bar
                document.getElementById('searchInput').value = termObj.term;
            });
            
            topSearchTermsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error displaying top search terms:', error.message);
        alert('An error occurred while fetching top search terms. Please try again later.');
    }
}

async function searchForTerm(searchTerm) {
    try {
        // Show loading screen
        showLoadingScreen();

        const response = await fetch(`https://nextjs-search-lovat.vercel.app/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch search results.');
        }
        const searchResults = await response.json();
        displaySearchResults(searchResults);
    } catch (error) {
        console.error('Error searching apps:', error.message);
        alert('An error occurred while searching apps. Please try again later.');
    } finally {
        // Hide loading screen regardless of success or failure
        hideLoadingScreen();
    }
}

async function updateClickCount(searchTerm) {
    try {
        const searchRef = database.ref('search_history').child(searchTerm);
        const snapshot = await searchRef.once('value');
        const existingTerm = snapshot.val();

        if (existingTerm) {
            await searchRef.update({ count: existingTerm.count + 1 });
        } else {
            await searchRef.set({ count: 1 });
        }
    } catch (error) {
        console.error('Error updating click count:', error.message);
        alert('An error occurred while updating click count. Please try again later.');
    }
}
