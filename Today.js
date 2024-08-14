(function () {
    let apps = [];
    const visibleApps = 3; // Number of initially visible apps
    const totalAppsToLoad = 12; // Maximum number of apps to load

    let appLoaderContainer = document.getElementById('app-loader-container-2');

    const titleSection = document.createElement('div');
    titleSection.classList.add('app-text');

    const titleWrapper = document.createElement('div');
    titleWrapper.style.width = '100%';

    const titleLink = document.createElement('a');
    titleLink.href = 'recent.html';

    const titleParagraph = document.createElement('p');
    titleParagraph.innerHTML = '<span><img src="https://raw.githubusercontent.com/aditya9738d/codewings_files/main/icon/logo.png" alt="Arrow" style="width: 15px;margin-right: 10px;">Today on TestFlight </span><span class="custom-arrow">›</span>';
    // 

    titleLink.appendChild(titleParagraph);
    titleWrapper.appendChild(titleLink);
    titleSection.appendChild(titleWrapper);
    appLoaderContainer.appendChild(titleSection);

    // Create a container for the app cards with a class to style
    const appCardsContainer = document.createElement('div');
    appCardsContainer.classList.add('app-cards-container-today');

    // Append the app cards container to the app loader container
    appLoaderContainer.appendChild(appCardsContainer);

    // Function to create a card for each app
    function createAppCard(app, index) {
        const card = document.createElement('div');
        card.classList.add('app-card-today');
        card.id = `app-card-${index + 1}`; // Add unique ID for each card

        card.innerHTML = `
            <div class="logo-container">
                <img src="placeholder.jpg" data-src="${app.logo}" alt="${app.name} Logo">
            </div>
            <h2 class="app-name">${app.name}</h2>
            <p class="app-counter"> <span class="click-count">0</span></p>
                <button class="get-button">
        <img src="arrow.png" alt="Arrow">
    </button>
        `;

        // Function to fetch and update the click count from Firebase
        async function updateClickCount() {
            const appRef = database.ref(`card_clicks/${app.name}`);
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
                urlParams.set('url', app.url);

                const detailsPageUrl = `join.html?${urlParams.toString()}`;
                window.open(detailsPageUrl, '_blank');

                // Update click count in Firebase when the card is clicked
                const appRef = database.ref(`card_clicks/${app.name}`);
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

    // Function to handle image lazy loading with Intersection Observer
    function lazyLoadImages() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        observer.unobserve(image);
                    }
                }
            });
        });

        const images = document.querySelectorAll('.logo-container img');
        images.forEach(image => {
            imageObserver.observe(image);
        });
    }

    // Function to fetch and parse the external HTML file
    async function createAppCardsFromMDFile() {
        try {
            apps = [];
    
            // Fetch the MD file
            const response = await fetch('https://raw.githubusercontent.com/aditya9738d/codewings_files/main/daily-next.md');
            const mdText = await response.text();
    
            // Extract app data using regular expressions
            const regex = /-\s+\*\*(.+?)\*\*:\s+\[!\[App Logo\]\((.+?)\)\]\((.+?)\)/g;
            let match;
            const appData = [];
    
            while ((match = regex.exec(mdText)) !== null) {
                const appName = match[1];
                const appLogo = match[2];
                const appUrl = match[3];
                appData.push({ name: appName, logo: appLogo, url: appUrl });
            }
    
            // Clear existing cards before appending new ones
            appCardsContainer.innerHTML = '';
    
            // Create app cards from extracted data
            for (let i = 0; i < appData.length && i < totalAppsToLoad; i++) {
                const { name, logo, url } = appData[i];
                const appCard = createAppCard({ name, logo, url }, i);
                const columnIdx = Math.floor(i / visibleApps) + 1;
                let currentColumn = document.getElementById(`app-column-${columnIdx}`);
                if (!currentColumn) {
                    currentColumn = document.createElement('div');
                    currentColumn.classList.add('app-column');
                    currentColumn.id = `app-column-${columnIdx}`;
                    appCardsContainer.appendChild(currentColumn);
                }
                currentColumn.appendChild(appCard);
            }
    
            // After adding all cards, start lazy loading images
            lazyLoadImages();
        } catch (error) {
            console.error('Error fetching or parsing MD file:', error);
        }
    }
    
    // Call the function to create app cards from the external MD file
    createAppCardsFromMDFile();
    

})();
