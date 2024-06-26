// Check if Firebase is already initialized before reinitializing
if (!firebase.apps.length) {
    var firebaseConfig = {
        apiKey: "AIzaSyB2m_caVPaa_Gg6J62LvECHPYwUG1lTLpk",
        authDomain: "click-count-f19cd.firebaseapp.com",
        projectId: "click-count-f19cd",
        storageBucket: "click-count-f19cd.appspot.com",
        messagingSenderId: "93590705011",
        appId: "1:93590705011:web:f7d6b83f1bddc982cdab06",
        measurementId: "G-27X5EXB0EZ"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
}

// Access the existing Firestore instance
var firestore = firebase.firestore();

// Check authentication state
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in, check payment status
        checkPaymentStatus(user.uid);
    } else {
        // No user is signed in
        console.log('No user signed in.');
    }
});

// Function to check payment status
function checkPaymentStatus(userId) {
    var usersRef = firestore.collection('users').doc(userId);

    usersRef.get().then(function(doc) {
        if (doc.exists) {
            // User document found, check payment status
            var paymentCompleted = doc.data().paymentCompleted;
            if (paymentCompleted) {
                console.log('User has completed payment.');
                // Enable the generate beta code button if payment completed
                document.getElementById('joinTestFlightBtn').disabled = false;
            } else {
                console.log('User has not completed payment.');
            }
        }
    }).catch(function(error) {
        console.error('Error getting user document:', error);
    });
}

// Stripe setup
const joinTestFlightBtn = document.getElementById('joinTestFlightBtn');
if (joinTestFlightBtn) {
    joinTestFlightBtn.addEventListener('click', function (event) {
        // Check if user is authenticated
        var user = firebase.auth().currentUser;
        if (user) {
            // User is authenticated, perform the action
            performJoinAction();
        } else {
            // User is not authenticated, handle skip logic
            // Retrieve skip count from local storage or initialize it to 0 if not present
            let skipCount = parseInt(localStorage.getItem('skipCount')) || 0;

            // Show the popup
            document.getElementById('popup').style.display = 'flex';

            // Update the skip button text with remaining skips
            updateSkipButtonText(skipCount);

            // Login button click event
            document.getElementById('loginBtn').addEventListener('click', function() {
                // Redirect to login page
                window.location.href = '/login_index.html'; // Replace with the URL of your login page
            });

            // Skip button click event
            document.getElementById('skipBtn').addEventListener('click', function() {
                skipCount++; // Increment skipCount
                localStorage.setItem('skipCount', skipCount); // Save skipCount to local storage
                if (skipCount >= 3) {
                    document.getElementById('skipBtn').disabled = true; // Disable skip button after 3 clicks
                } else {
                    // Update the skip button text with remaining skips
                    updateSkipButtonText(skipCount);
                }
                // Hide popup
                document.getElementById('popup').style.display = 'none';

                // Perform the action associated with the "Generate Beta Code" button
                performJoinAction();
            });
        }
    });
}

// Function to update the skip button text with remaining skips
function updateSkipButtonText(skipCount) {
    const remainingSkips = 3 - skipCount;
    const skipBtn = document.getElementById('skipBtn');
    if (remainingSkips > 0) {
        skipBtn.textContent = `Skip (${remainingSkips} remaining)`;
    } else {
        skipBtn.textContent = `Skip (0 remaining)`;
        skipBtn.disabled = true;
    }
}

function checkClickLimitAndPerformAction(userId) {
    // Check if the user has clicked the button less than 2 times today
    var today = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format
    var clickCountRef = firestore.collection('clicks').doc(userId + '_' + today);
    clickCountRef.get().then(function(doc) {
        if (doc.exists) {
            // User has already clicked today
            var clicks = doc.data().clicks;
            if (clicks < 7) {
                // Increment click count and allow generating beta code
                clickCountRef.update({
                    clicks: firebase.firestore.FieldValue.increment(1)
                }).then(function() {
                    console.log('Generating beta code...');
                    performJoinAction(); // Proceed with generating beta code
                }).catch(function(error) {
                    console.error('Error updating click count:', error);
                });
            } else {
                // User has already clicked seven times today, proceed without restriction
                console.log('Generating beta code...');
                performJoinAction(); // Proceed with generating beta code
            }
        } else {
            // User has not clicked today, initialize click count
            clickCountRef.set({
                clicks: 1
            }).then(function() {
                console.log('Generating beta code...');
                performJoinAction(); // Proceed with generating beta code
            }).catch(function(error) {
                console.error('Error setting click count:', error);
            });
        }
    }).catch(function(error) {
        console.error('Error getting click count:', error);
    });
}

function performJoinAction() {
    // Show "Please wait" message
    joinTestFlightBtn.textContent = "Please wait...";

    // Counter before opening the new tab
    let count = 5;
    const countdownInterval = setInterval(() => {
        joinTestFlightBtn.textContent = `Opening in ${count} seconds...`;
        count--;
        if (count < 0) {
            clearInterval(countdownInterval);
            // Open the new tab after countdown
            const newTab = openNewTabWithDetails();
            if (newTab) {
                // Reset button text
                joinTestFlightBtn.textContent = 'Join TestFlight';
                document.getElementById('joinText').style.display = 'block';
            } else {
                // Handle if the new tab was not opened
                console.error('Failed to open new tab.');
            }
        }
    }, 1000);
}

function showClickLimitPopup() {
    const clickLimitPopup = document.getElementById('clickLimitPopup');
    clickLimitPopup.style.display = 'flex';

    const dismissBtn = document.getElementById('dismissBtn');
    dismissBtn.addEventListener('click', function() {
        clickLimitPopup.style.display = 'none';
    });

    const getCreditsBtn = document.getElementById('getCreditsBtn');
    getCreditsBtn.addEventListener('click', function() {
        window.location.href = '/payment.html'; // Replace with the URL of your payment page
    });
}
