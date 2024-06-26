(function () {
    let apps = [];
    const visibleApps = 3; // Number of initially visible apps
    const totalAppsToLoad = 25; // Maximum number of apps to load

    let appLoaderContainer = document.getElementById('app-loader-container');

    // Create a container for the app cards with a class to style
    const appCardsContainer = document.createElement('div');
    appCardsContainer.classList.add('app-cards-container-new');

    // Append the app cards container to the app loader container
    appLoaderContainer.appendChild(appCardsContainer);

    function sanitizeString(str) {
        // Replace any characters that are not letters, numbers, or underscores with spaces
        return str.replace(/[^a-zA-Z0-9_]/g, ' ');
    }

    // Function to create a card for each app
    function createAppCard(app, index) {
        // Sanitize the app name before using it in the database path
        const sanitizedAppName = sanitizeString(app.name);
        const appRef = database.ref(`card_clicks/${sanitizedAppName}`);

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
            const appRef = database.ref(`card_clicks/${sanitizedAppName}`);
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
            // Generate URL parameters for the app details
            const urlParams = new URLSearchParams();
            urlParams.set('name', app.name);
            urlParams.set('logo', app.logo);
            urlParams.set('url', app.url);

            const detailsPageUrl = `join.html?${urlParams.toString()}`;
            

            // Open the details page URL in a new tab
            window.open(detailsPageUrl, '_blank');

            // Update the click count in Firebase
            const appRef = database.ref(`card_clicks/${sanitizedAppName}`);
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


    // Function to fetch and parse the external HTML file
    async function createAppCardsFromMDFile() {
        try {
            apps = [];
    
            // Fetch and parse the Markdown file
            const response = await fetch('https://raw.githubusercontent.com/aditya9738d/codewings_files/main/daily-next.md');
            const markdownText = await response.text();
    
            // Split the text by lines
            const lines = markdownText.split('\n');
    
            // Clear existing cards before appending new ones
            appCardsContainer.innerHTML = '';
    
            // Initialize currentColumn outside the loop
            let currentColumn;
            // Initialize a counter to keep track of app cards in the current column
            let cardsInCurrentColumn = 0;
    
            // Loop through each line
            for (let index = 16; index < lines.length; index++) {
                const line = lines[index].trim();
    
                // Check if the line matches the expected format
                const match = line.match(/\*\*(.*?)\*\*:\s\[!\[App Logo\]\((.*?)\)\]\((.*?)\)/);
    
                if (match && match.length === 4) {
                    const appName = match[1];
                    const appLogo = match[2];
                    const appUrl = match[3];
    
                    // Create app card
                    const appCard = createAppCard({ name: appName, logo: appLogo, url: appUrl }, index);
    
                    // Check if it's time to create a new column
                    if (cardsInCurrentColumn === 0) {
                        currentColumn = document.createElement('div');
                        currentColumn.classList.add('app-column');
                        currentColumn.id = `app-column-${index / visibleApps + 1}`; // Add unique ID for each column
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
                        console.warn('currentColumn is undefined:', line);
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
                } else {
                    console.warn('Invalid data found in this line:', line);
                }
            }

        } catch (error) {
            console.error('Error fetching or parsing Markdown data:', error);
        }
    }
    
    // Call the function to create app cards from the MD file
    createAppCardsFromMDFile();
})();
