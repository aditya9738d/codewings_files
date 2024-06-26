(function () {
    let apps = [];
    const visibleApps = 3; // Number of initially visible apps
    const totalAppsToLoad = 25; // Maximum number of apps to load

    const appLoaderContainer = document.getElementById('open_beta');

    // Create a container for the toggle buttons with a class to style
    const toggleContainer = document.createElement('div');
    toggleContainer.classList.add('toggle-container');

    // Append the toggle container to the app loader container
    appLoaderContainer.appendChild(toggleContainer);

    // Create a container for the app cards with a class to style
    const appCardsContainer = document.createElement('div');
    appCardsContainer.classList.add('app-cards-container-open');

    // Append the app cards container to the app loader container
    appLoaderContainer.appendChild(appCardsContainer);

    // Create and append loading circle element
    const loadingCircle = document.createElement('div');
    loadingCircle.classList.add('loading-open');
    loadingCircle.style.display = 'none'; // Hide initially
    appLoaderContainer.appendChild(loadingCircle);

    // Define API endpoints for different toggles
    const endpoints = [
        'https://telegram-js-xi.vercel.app/api/availableBetaApps',
        'https://telegram-js-xi.vercel.app/api/fullBetaApps',
        'https://telegram-js-xi.vercel.app/api/notAcceptingBetaApps'
    ];

    // Initialize current endpoint index and a flag to prevent multiple API calls
    let currentEndpointIndex = 0;
    let isFetching = false;

    // Function to toggle API endpoint
    function toggleEndpoint(endpointIndex) {
        if (!isFetching) {
            // Update current endpoint index
            currentEndpointIndex = endpointIndex;
            // Reload app cards with the new endpoint
            createAppCardsFromAPI();

            // Remove 'active' class from all toggle buttons
            document.querySelectorAll('.toggle-button').forEach(button => {
                button.classList.remove('active');
            });
            // Add 'active' class to the selected toggle button
            document.querySelectorAll('.toggle-button')[endpointIndex].classList.add('active');
        }
    }

    function createToggleButtons() {
        // Define an array of text for toggle buttons
        const toggleTexts = ['Open', 'Full', 'Closed'];

        // Create toggle buttons
        for (let i = 0; i < endpoints.length; i++) {
            const toggleButton = document.createElement('button');
            // Set text content of each toggle button using the array
            toggleButton.textContent = toggleTexts[i];
            toggleButton.classList.add('toggle-button');
            toggleButton.addEventListener('click', () => toggleEndpoint(i));
            toggleContainer.appendChild(toggleButton);

            // Make the first toggle button active initially
            if (i === 0) {
                toggleButton.classList.add('active');
            }
        }
    }

    function sanitizeString(str) {
        // Replace any characters that are not letters, numbers, or underscores with spaces
        return str.replace(/[^a-zA-Z0-9_]/g, ' ');
    }

    // Function to create a card for each app
    function createAppCard(app, index) {
        // Sanitize the app name before using it in the database path
        const sanitizedAppName = sanitizeString(app.name);
        const appRef = firebase.database().ref(`card_clicks/${sanitizedAppName}`);

        const card = document.createElement('div');
        card.classList.add('app-card-new');
        card.id = `app-card-${index + 1}`; // Add unique ID for each card

        card.innerHTML = `
            <div class="logo-container">
                <img src="placeholder.jpg" data-src="${app.logo}" alt="${app.name} Logo">
            </div>
            <h2 class="app-name">${app.name}</h2>
            <p class="app-counter1"> <span class="click-count">0</span></p>
        `;

        // Function to fetch and update the click count from Firebase
        async function updateClickCount() {
            // Use sanitized app name for database reference
            const snapshot = await appRef.once('value');
            const currentCount = snapshot.val() || 0;

            // Update the counter text in the card
            const clickCountElement = card.querySelector('.click-count');
            if (clickCountElement) {
                clickCountElement.textContent = currentCount;
            }
        }

        // Click event listener for the card
        card.addEventListener('click', async (event) => {
            const urlParams = new URLSearchParams();
            urlParams.set('name', app.name);
            urlParams.set('logo', app.logo);
            urlParams.set('url', app.link);

            const detailsPageUrl = `join.html?${urlParams.toString()}`;

            // Open the details page URL in a new tab
            window.open(detailsPageUrl, '_blank');

            // Update the click count in Firebase
            await appRef.transaction((currentCount) => {
                // Increment the current count by 1
                return (currentCount || 0) + 1;
            });

            // Update the UI with the new click count
            await updateClickCount();

            // Prevent the default action of the click event
            event.preventDefault();
        });

        // Fetch and update the initial click count
        updateClickCount();

        return card;
    }

    // Function to fetch and parse the data from API
    async function createAppCardsFromAPI() {
        if (isFetching) return;

        try {
            isFetching = true;
            // Show loading circle
            loadingCircle.style.display = 'block';
            apps = [];

            // Clear existing cards before fetching new ones
            appCardsContainer.innerHTML = '';

            // Fetch data from the API using the current endpoint
            const response = await fetch(endpoints[currentEndpointIndex]);
            const data = await response.json();

            // Initialize currentColumn outside the loop
            let currentColumn;
            // Initialize a counter to keep track of app cards in the current column
            let cardsInCurrentColumn = 0;

            // Loop through each app in the data
            data.forEach((app, index) => {
                // Create app card
                const appCard = createAppCard(app, index);

                // Check if it's time to create a new column
                if (cardsInCurrentColumn === 0) {
                    currentColumn = document.createElement('div');
                    currentColumn.classList.add('app-column');
                    currentColumn.id = `app-column-${Math.floor(index / visibleApps) + 1}`; // Add unique ID for each column
                    appCardsContainer.appendChild(currentColumn);
                }

                // Increment the counter
                cardsInCurrentColumn++;

                // Reset the counter and create a new column if necessary
                if (cardsInCurrentColumn === visibleApps) {
                    cardsInCurrentColumn = 0;
                }

                // Append app card to the current column
                if (currentColumn) {
                    currentColumn.appendChild(appCard);
                } else {
                    console.warn('currentColumn is undefined:', app.name);
                }

                // Observe when the image enters the viewport
                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target.querySelector('img');
                            if (img) {
                                img.src = img.dataset.src; // Load the image
                                observer.unobserve(entry.target);
                            }
                        }
                    });
                }, { root: null, rootMargin: '0px', threshold: 0 });

                observer.observe(appCard);
            });

        } catch (error) {
            console.error('Error fetching or parsing API data:', error);
        } finally {
            isFetching = false;
            // Hide loading circle
            loadingCircle.style.display = 'none';
        }
    }

    // Call the function to create toggle buttons
    createToggleButtons();

    // Call the function to create app cards from the API
    createAppCardsFromAPI();
})();
