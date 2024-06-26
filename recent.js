document.addEventListener('DOMContentLoaded', () => {
    let apps = [];
    let appListContainer = document.getElementById('app-list');
    let observer;

    // Show the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';

    // Fetch and parse the Markdown file and create app cards
    async function createAppCardsFromMarkdownFile() {
        try {
            apps = [];

            // Fetch and parse the Markdown file
            const response = await fetch('https://raw.githubusercontent.com/aditya9738d/codewings_files/main/daily-next.md');
            const markdownText = await response.text();

            // Regular expression to match app name, logo URL, and app URL
            const regex = /- \*\*(.*?)\*\*: \[!\[App Logo\]\((.*?)\)\]\((.*?)\)/g;

            let match;
            let index = 0;
            while ((match = regex.exec(markdownText)) !== null) {
                const appName = match[1];
                const appLogo = match[2];
                const appUrl = match[3];

                const app = { name: appName, logo: appLogo, url: appUrl };
                apps.push(app);

                // Create container for the app card and append it to the container
                const appCardContainer = createAppCardContainer(app, index);
                appListContainer.appendChild(appCardContainer);
                index++;
            }

            // Initialize Intersection Observer after all cards are loaded
            observer = new IntersectionObserver(onIntersection, { root: null, rootMargin: '0px', threshold: 0.1 });
            const appCards = document.querySelectorAll('.app-card');
            appCards.forEach(card => {
                observer.observe(card);
            });

            // Delay hiding the loading screen for at least 1.5 seconds
            setTimeout(() => {
                // Show the website content and hide the loading screen after loading all app cards
                document.querySelector('.app-container_list').classList.remove('hidden');
                loadingScreen.style.display = 'none'; // Hide the loading screen
            }, 600);
        } catch (error) {
            console.error('Error fetching or parsing Markdown data:', error);
        }
    }

    // Function to create app card container
    function createAppCardContainer(app, index) {
        const container = document.createElement('div');
        container.classList.add('app-card-container');

        // Create serial number element
        const serialNumber = document.createElement('div');
        serialNumber.classList.add('serial-number');
        serialNumber.textContent = index + 1;
        container.appendChild(serialNumber);

        // Create app card
        const card = createAppCard(app);
        container.appendChild(card);

        return container;
    }

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
    card.classList.add('app-card');

    card.innerHTML = `
        <div class="logo-container">
            <!-- Add a placeholder image -->
            <img class="lazy" data-src="${app.logo}" alt="${app.name} Logo">
        </div>
        <h2 class="app-name">${app.name}</h2>
        <p class="app-counter"> <span class="click-count">0</span></p>
        <button class="get-button">Get</button>
    `;

    // Function to fetch and update the click count from Firebase
    async function updateClickCount() {
        try {
        const appRef = database.ref(`card_clicks/${sanitizedAppName}`);
        const snapshot = await appRef.once('value');
        const currentCount = snapshot.val() || 0;

            // Update the counter text in the card
            const clickCountElement = card.querySelector('.click-count');
            if (clickCountElement) {
                clickCountElement.textContent = currentCount;
            }
        } catch (error) {
            console.error('Error updating click count:', error);
        }
    }

    // Fetch and update the initial click count when the card is created
    updateClickCount();

    card.addEventListener('click', async () => {
        // Increment the click count and update Firebase
        try {
            const appRef = database.ref(`card_clicks/${app.name}`);
            const snapshot = await appRef.once('value');
            let currentCount = snapshot.val() || 0;

            // Increment the click count
            currentCount++;

            // Update the click count in Firebase
            await appRef.set(currentCount);

            // Update the UI with the new click count
            const clickCountElement = card.querySelector('.click-count');
            if (clickCountElement) {
                clickCountElement.textContent = currentCount;
            }
        } catch (error) {
            console.error('Error updating click count:', error);
        }

        // Generate URL parameters for the app details
        const urlParams = new URLSearchParams();
        urlParams.set('name', app.name);
        urlParams.set('logo', app.logo);
        urlParams.set('url', app.url);

        const detailsPageUrl = `join.html?${urlParams.toString()}`;
        window.open(detailsPageUrl, '_blank');
    });

    return card;
}


    // Intersection Observer callback
    function onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Load the image when it comes into view
                const image = entry.target.querySelector('.lazy');
                if (image) {
                    image.src = image.dataset.src;
                    image.classList.remove('lazy');
                    observer.unobserve(entry.target);
                }
            }
        });
    }

    // Function to toggle the 'active' class on the search bar
    function toggleSearchBar() {
        const searchBar = document.querySelector('.search-bar');
        searchBar.classList.toggle('active');
    }

    // Function to generate a unique identifier for an app
    function generateAppId(app) {
        const randomId = Math.floor(Math.random() * 1000000);
        return `app_${randomId}`;
    }

    // Call the function to create initial app cards from the Markdown file
    createAppCardsFromMarkdownFile();
});
