document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("dynamicImageContainer");
    let currentIndex = 0;

    // Show skeleton loading state
    showSkeletonLoading();
    const cardData = [
        { src: "https://raw.githubusercontent.com/aditya9738d/codewings_files/main/all banner codewings.jpg", alt: "", text: "", url: "/Popular.html", openInNewTab: false },
        { src: "https://raw.githubusercontent.com/aditya9738d/codewings_files/main/daily banner codewings.jpg", alt: "", text: "", url: "/recent.html", openInNewTab: false },
        { src: "https://raw.githubusercontent.com/aditya9738d/codewings_files/main/yt banner codewings.jpg", alt: "", text: "", url: "https://www.youtube.com/channel/UC6U27WdI-Oi7pFZ-C0W5h1Q", openInNewTab: true },
        { src: "https://raw.githubusercontent.com/aditya9738d/codewings_files/main/telegram banner.jpg", alt: "", text: "", url: "https://t.me/testflight_link", openInNewTab: true },
        
        // { src: "https://raw.githubusercontent.com/aditya9738d/codewings_files/main/SwitchBuddy.jpg", alt: "SwitchBuddy", text: "SwitchBuddy: Switch Companion", url: "https://testflight.apple.com/join/J3HNn9uB", buttonText: "Discover" },
        // Additional banner cards
       
        // { src: "Top-banner-img/banner5.jpg", alt: "Fifth Banner", text: "Check out the Fifth Banner", url: "https://example.com/banner5", buttonText: "Check Now" },
        // { src: "Top-banner-img/banner6.jpg", alt: "Sixth Banner", text: "Discover the Sixth Banner", url: "https://example.com/banner6", buttonText: "Discover More" }
    ];

   // Function to create image placeholders dynamically
   function createImagePlaceholder(data) {
    const imagePlaceholder = document.createElement("div");
    imagePlaceholder.classList.add("image-placeholder");

    const textAndButton = document.createElement("div");
    textAndButton.classList.add("text-and-button");

    const textElement = document.createElement("p");
    textElement.classList.add("text-style");
    textElement.innerText = data.text;

    const imageLink = document.createElement("a");
    imageLink.href = data.url; // Set the URL for the entire banner

    if (data.openInNewTab) {
        imageLink.target = "_blank"; // Open in a new tab if specified
    }

    const image = document.createElement("img");
    image.src = data.src;
    image.alt = data.alt;

    const transparentBar = document.createElement("div");
    transparentBar.classList.add("transparent-bar");

    // Add an event listener to the image to get the color after it's loaded
    image.addEventListener("load", function () {
        const sampledColor = sampleColorFromImage(image);
        transparentBar.style.background = `linear-gradient(to top, ${sampledColor} 20%, rgba(0, 0, 0, 0) 100%)`;
        hideSkeletonLoading(); // Hide skeleton loading when the image is loaded
    });

    textAndButton.appendChild(textElement);
    imageLink.appendChild(image);
    imageLink.appendChild(transparentBar);
    imageLink.appendChild(textAndButton);

    imagePlaceholder.appendChild(imageLink);
    container.appendChild(imagePlaceholder);
}

// Loop through the cardData array and create image placeholders
cardData.forEach((data) => {
    createImagePlaceholder(data);
});

// Function to scroll to the next card horizontally with advanced options
function scrollToNextCard() {
    currentIndex = (currentIndex + 1) % cardData.length;
    const nextCard = container.children[currentIndex];
    
    if (nextCard) {
        const distance = Math.abs(nextCard.offsetLeft - container.scrollLeft);
        const duration = Math.min(1500, distance * 0.5); // Adjust the multiplier as needed

        container.scrollTo({
            left: nextCard.offsetLeft,
            behavior: 'smooth',
            duration: duration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)' // Example cubic bezier easing
        });
    }
}

// Set interval to auto-scroll every 4.5 seconds
setInterval(scrollToNextCard, 6200);


    // Function to sample color from the bottom of the image
    function sampleColorFromImage(image) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
    
        // Set crossOrigin attribute for images loaded from external URLs
        image.crossOrigin = "anonymous";
    
        canvas.width = image.width;
        canvas.height = image.height;
    
        ctx.drawImage(image, 0, 0, image.width, image.height);
    
        const imageData = ctx.getImageData(0, image.height - 1, 1, 1).data;
    
        // Return the RGB color
        return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
    }
    

    // Function to show skeleton loading state
    function showSkeletonLoading() {
        container.innerHTML = ""; // Clear any existing content
        const skeletonLoading = document.createElement("div");
        skeletonLoading.classList.add("skeleton-loading");
        for (let i = 0; i < 3; i++) {
            const skeletonCard = document.createElement("div");
            skeletonCard.classList.add("skeleton-card");
            skeletonLoading.appendChild(skeletonCard);
        }
        container.appendChild(skeletonLoading);
    }

    // Function to hide skeleton loading state
    function hideSkeletonLoading() {
        const skeletonLoading = document.querySelector(".skeleton-loading");
        if (skeletonLoading) {
            container.removeChild(skeletonLoading);
        }
    }

    // Add an event listener to the window for scroll events
    window.addEventListener('scroll', function () {
        // Get the header element
        const header = document.querySelector('header');

        // Check the scroll position
        if (window.scrollY > 180) { // Adjust the scroll position value as needed
            // Add a class to the header when scrolling down
            header.classList.add('hidden');
        } else {
            // Remove the class when scrolling up
            header.classList.remove('hidden');
        }
    });

    
});


