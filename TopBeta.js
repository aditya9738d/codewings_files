document.addEventListener('DOMContentLoaded', () => {
    function sanitizeString(str) {
        return str.replace(/[.$[\]#\/]/g, '_');
    }

    let apps = [];
    let appListContainer = document.getElementById('app-list');
    let paginationContainer = document.getElementById('pagination-container');
    let currentPage = 0;
    const cardsPerPage = 10;

    // Show the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';

    // Fetch and parse the Markdown file and create app cards
    async function createAppCardsFromMarkdownFile() {
        try {
            apps = [];

            // Fetch and parse the Markdown file
            const response = await fetch('https://raw.githubusercontent.com/aditya9738d/codewings_files/main/topBeta.md');
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
                index++;
            }

            // Display the app cards for the current page
            displayAppCards();
            // Create pagination buttons
            createPaginationButtons();

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

    // Function to display app cards for the current page
    function displayAppCards() {
        const startIndex = currentPage * cardsPerPage;
        const endIndex = Math.min(startIndex + cardsPerPage, apps.length);

        // Clear previous app cards
        appListContainer.innerHTML = '';

        // Display app cards for the current page
        for (let i = startIndex; i < endIndex; i++) {
            const app = apps[i];
            const appCardContainer = createAppCardContainer(app, i + 1);
            appListContainer.appendChild(appCardContainer);
        }
    }

    // Function to create app card container
    function createAppCardContainer(app, index) {
        const container = document.createElement('div');
        container.classList.add('app-card-container');

        // Create serial number element
        const serialNumber = document.createElement('div');
        serialNumber.classList.add('serial-number');
        serialNumber.textContent = index;
        container.appendChild(serialNumber);

        // Create app card
        const card = createAppCard(app);
        container.appendChild(card);

        return container;
    }

    // Function to create a card for each app
    function createAppCard(app) {
        const card = document.createElement('div');
        card.classList.add('app-card');
        card.setAttribute('data-name', app.name);

        card.innerHTML = `
            <div class="logo-container">
                <img src="${app.logo}" alt="${app.name} Logo">
            </div>
            <h2 class="app-name">${app.name}</h2>
            <p class="app-counter"> <span class="click-count">0</span></p>
            <button class="get-button">Get</button>
        `;

        // Fetch and update the click count from Firebase
        async function updateClickCount() {
            try {
                const appRef = database.ref(`card_clicks/${sanitizeString(app.name)}`);
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

        // Handle card click event
        card.addEventListener('click', async () => {
            // Increment the click count and update Firebase
            try {
                const appRef = database.ref(`card_clicks/${sanitizeString(app.name)}`);
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

    // Function to create pagination buttons
    function createPaginationButtons() {
        const totalPages = Math.ceil(apps.length / cardsPerPage);
        paginationContainer.innerHTML = '';

        if (totalPages > 1) {
            const previousButton = document.createElement('button');
            previousButton.textContent = '<';
            previousButton.addEventListener('click', () => {
                if (currentPage > 0) {
                    currentPage--;
                    updatePage();
                }
            });
            paginationContainer.appendChild(previousButton);

            // Determine range of pages to show
            const rangeStart = Math.max(0, currentPage);
            const rangeEnd = Math.min(totalPages, currentPage + 3);

            // Show current, next two pages, and an ellipsis if applicable
            for (let i = rangeStart; i < rangeEnd; i++) {
                const pageButton = createPageButton(i);
                paginationContainer.appendChild(pageButton);
            }

            if (rangeEnd < totalPages) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);

                const lastPageButton = createPageButton(totalPages - 1);
                paginationContainer.appendChild(lastPageButton);
            }

            const nextButton = document.createElement('button');
            nextButton.textContent = '>';
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    updatePage();
                }
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    // Function to create a page button
    function createPageButton(page) {
        const pageButton = document.createElement('button');
        pageButton.textContent = page + 1;
        pageButton.addEventListener('click', () => {
            currentPage = page;
            updatePage();
        });

        if (currentPage === page) {
            pageButton.classList.add('active');
        }

        return pageButton;
    }

    // Function to update the page content and URL
    function updatePage() {
        displayAppCards();
        createPaginationButtons();
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('page', currentPage + 1);
        window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    }

    // Extract page number from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page'));
    if (!isNaN(page) && page > 0) {
        currentPage = page - 1; // Adjust page number to zero-based index
    }

    // Call the function to create initial app cards from the Markdown file
    createAppCardsFromMarkdownFile();
});
