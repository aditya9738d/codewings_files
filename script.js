let apps = [];
let visibleApps = 5; // Number of initially visible apps
let loadedCards = 0; // Counter for the loaded cards
const cardsToLoadInitially = 5;
const cardsToLoadMore = 5;

let loadMoreButton = document.getElementById('load-more-button');
let appListContainer = document.getElementById('app-list');

// Function to create a card for each app
function createAppCard(app) {
    const card = document.createElement('div');
    card.classList.add('app-card');

    card.innerHTML = `
        <div class="logo-container">
            <img src="${app.logo}" alt="${app.name} Logo">
        </div>
        <h2 class="app-name">${app.name}</h2>
        <p class="app-counter"> <span class="click-count">0</span></p>
        <button class="get-button">Get</button>
    `;

    const getButton = card.querySelector('.get-button');

    getButton.addEventListener('click', (event) => {
        card.click();
        event.stopPropagation(); // Stop the event from propagating to the card
    });

    card.addEventListener('click', () => {
        updateClickCount(app, card);
    });

    card.addEventListener('click', () => {
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

// Function to update click count in Firebase
function updateClickCount(app, card) {
    const appRef = database.ref(`card_clicks/${app.name}`);
    appRef.transaction((currentCount) => {
        const newCount = (currentCount || 0) + 1;
        // Update the counter text in the card
        card.querySelector('.click-count').textContent = newCount;
        return newCount;
    });
}



// Function to fetch and parse the external HTML file
async function createAppCardsFromTableFile() {
    try {
        apps = [];

        // Fetch and parse the HTML file
        const response = await fetch('https://raw.githubusercontent.com/aditya9738d/codewings_files/main/output.html');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const rows = doc.querySelectorAll('tr');

        rows.forEach(row => {
            const appNameElement = row.querySelector('td[data-heading="Beta App"]');
            if (appNameElement) {
                const appName = appNameElement.textContent;
                const appLogoElement = row.querySelector('td[data-heading="Logo"] img');
                const appLogo = appLogoElement ? appLogoElement.src : 'default_logo_url';
                const appUrl = row.querySelector('td[data-heading="Url"] a').href;

                apps.push({ name: appName, logo: appLogo, url: appUrl });
            }
        });

        shuffleArray(apps);

        // Update the number of initially visible apps
        visibleApps = Math.min(visibleApps, apps.length);

        // Create cards for each app and append them to the container
        apps.slice(0, visibleApps).forEach(app => {
            const appCard = createAppCard(app);
            appListContainer.appendChild(appCard);
        });

        // Show or hide the "Load More" button based on remaining apps
        loadMoreButton.style.display = visibleApps < apps.length ? 'block' : 'none';
    } catch (error) {
        console.error('Error fetching or parsing table data:', error);
    }
}

// Call the function to create app cards from the external HTML file
createAppCardsFromTableFile();

// Load more apps when the "Load More" button is clicked
loadMoreButton.addEventListener('click', function () {
    visibleApps += cardsToLoadMore;
    createAppCardsFromTableFile();
});

// Function to toggle the 'active' class on the search bar
function toggleSearchBar() {
    const searchBar = document.querySelector('.search-bar');
    searchBar.classList.toggle('active');
}

// Function to shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}



// Get the elements
const appLoaderContainer = document.getElementById('app-loader-container-2');


        // JavaScript function to scroll to a section when clicking on a list item
        function scrollToSection(sectionId) {
            var section = document.getElementById(sectionId);
            if (section) {
                // Remove highlight from all sections
                var allSections = document.querySelectorAll('.section');
                allSections.forEach(function(sec) {
                    sec.classList.remove('highlighted', 'blink');
                });

                // Scroll to the section and add highlight
                section.scrollIntoView({ behavior: 'smooth' });
                section.classList.add('highlighted', 'blink');

                // Remove the blink class and highlighted class after 2 seconds
                setTimeout(function() {
                    section.classList.remove('blink');
                    setTimeout(function() {
                        section.classList.remove('highlighted');
                    }, 500); // Wait for the blink animation to complete before removing highlighted class
                }, 2000);
            }
        }

        // JavaScript function to add margin to header container when scrolling down
        window.addEventListener('scroll', function() {
            var headerContainer = document.getElementById('header-container');
            if (window.scrollY > 0) {
                headerContainer.classList.add('scrolled-down');
            } else {
                headerContainer.classList.remove('scrolled-down');
            }
        });



        document.addEventListener("DOMContentLoaded", function() {
            const toggleButtons = document.querySelectorAll('.toggle-container button');
          
            // Add event listener to each toggle button
            toggleButtons.forEach(function(button, index) {
              button.addEventListener('click', function() {
                // Remove active class from all buttons
                toggleButtons.forEach(function(btn) {
                  btn.classList.remove('active');
                });
          
                // Add active class to the clicked button
                button.classList.add('active');
              });
              
              // Highlight the first button when page loads
              if (index === 0) {
                button.classList.add('active');
              }
            });
          });
          