setTimeout(async function () {
    try {
        const mostClickedContainer = document.getElementById('openstate');

        // Ensure the container exists
        if (!mostClickedContainer) {
            console.error('Container with ID "openstate" not found.');
            return;
        }

        // Create and show the loading animation
        const loadingAnimation = document.createElement('div');
        loadingAnimation.classList.add('loading-circle');
        mostClickedContainer.appendChild(loadingAnimation);

        const titleSection = document.createElement('div');
        titleSection.classList.add('app-text');
    
        const titleWrapper = document.createElement('div');
        titleWrapper.style.width = '100%';
    
        const titleLink = document.createElement('a');
        // titleLink.href = 'Popular.html';
    
        const titleParagraph = document.createElement('p');
        titleParagraph.innerHTML = 'Open Now <span class="custom-arrow">›</span>';

        // Append title elements to the titleSection
        titleLink.appendChild(titleParagraph);
        titleWrapper.appendChild(titleLink);
        titleSection.appendChild(titleWrapper);

        // Append titleSection to the mostClickedContainer
        mostClickedContainer.appendChild(titleSection);

        // Function to sanitize a string by replacing invalid characters with spaces
        function sanitizeString(str) {
            return str.replace(/[^a-zA-Z0-9_]/g, ' ');
        }

        // Function to create a card for each app
        function createAppCard(app, index) {
            const sanitizedAppName = sanitizeString(app.name);
            const userInteractionsRef = firebase.database().ref(`card_clicks/${sanitizedAppName}`);

            const card = document.createElement('div');
            card.classList.add('app-box');
            card.id = `app-box-${index + 1}`;

            // Placeholder image setup
            const placeholderImgSrc = 'placeholder.jpg'; // Replace with your placeholder image path
            const logoContainer = document.createElement('div');
            logoContainer.classList.add('logo-container-box');
            const logoImg = document.createElement('img');
            logoImg.src = placeholderImgSrc;  // Set placeholder image initially
            logoImg.setAttribute('data-src', app.logo);
            logoImg.alt = `${app.name} Logo`;
            logoContainer.appendChild(logoImg);

            // Load actual logo when it enters the viewport
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target.querySelector('img');
                        img.src = img.getAttribute('data-src');
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(logoContainer);

            const appName = document.createElement('h2');
            appName.classList.add('app-name-box');
            appName.textContent = app.name;

            const clickCount = document.createElement('p');
            clickCount.classList.add('app-counter-box');
            const clickCountSpan = document.createElement('span');
            clickCountSpan.classList.add('click-count');
            clickCountSpan.textContent = app.clickCount;
            clickCount.appendChild(clickCountSpan);

            card.appendChild(logoContainer);
            card.appendChild(appName);
            card.appendChild(clickCount);

            // Handle click event
            card.addEventListener('click', async (event) => {
                try {
                    await userInteractionsRef.transaction((currentClicks) => {
                        return (currentClicks || 0) + 1;
                    });

                    const urlParams = new URLSearchParams();
                    urlParams.set('name', app.name);
                    urlParams.set('logo', app.logo);
                    urlParams.set('url', app.link);

                    const detailsPageUrl = `join.html?${urlParams.toString()}`;
                    window.location.href = detailsPageUrl;
                    event.preventDefault();
                } catch (error) {
                    console.error('Error updating click count:', error);
                }
            });

            return card;
        }
        
        const response = await fetch('https://telegram-js-xi.vercel.app/api/check_stat?check=availability');
        let data = await response.json();

        // Sort the data array based on clickCount in descending order
        data.sort((a, b) => b.clickCount - a.clickCount);

        const appCardsContainer = document.createElement('div');
        appCardsContainer.classList.add('app-container-box');

        // Remove the loading animation
        mostClickedContainer.removeChild(loadingAnimation);

        mostClickedContainer.appendChild(appCardsContainer);

        data.forEach((app, index) => {
            const card = createAppCard(app, index);
            appCardsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching and processing app data:', error);
    }

}, 1000);
