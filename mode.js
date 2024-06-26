// Function to set the theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('theme', theme);
    } catch (err) {
        console.error('Failed to save theme to localStorage:', err);
    }
}

// Function to toggle between dark and light mode
function switchTheme(theme) {
    setTheme(theme);
}

// Function to detect preferred theme
function detectPreferredTheme() {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    // Set theme to light if no theme is saved
    setTheme(savedTheme || 'light');

    // Update toggle switch state based on saved or detected theme
    updateToggleSwitch(savedTheme || (prefersDarkMode ? 'dark' : 'light'));
}


// Function to update toggle switch state
function updateToggleSwitch(theme) {
    const toggleSwitch = document.querySelector('#toggle');
    if (toggleSwitch) {
        toggleSwitch.checked = theme === 'light';
    }
}

// Event listener for the toggle switch
document.addEventListener('change', function(event) {
    if (event.target.id === 'toggle') {
        switchTheme(event.target.checked ? 'light' : 'dark');
    }
});

// Initialize theme and listen for system theme changes on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    detectPreferredTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectPreferredTheme);
});
