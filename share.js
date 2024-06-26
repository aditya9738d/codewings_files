const shareContent = async () => {
    try {
        const shareData = {
            title: document.title,
            text: 'Check out this website!',
            url: window.location.href
        };

        await navigator.share(shareData);
        console.log('Shared successfully');
    } catch (error) {
        console.error('Error sharing:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Select the share button by its ID
    const shareButton = document.getElementById('shareButton');

    // Add click event listener to the share button
    shareButton.addEventListener('click', () => {
        if (navigator.share) {
            shareContent();
        } else {
            // Fallback for browsers that do not support the Web Share API
            alert('Sharing is not supported in your browser. You can manually copy the URL.');
        }
    });
});




// qr code
document.addEventListener('DOMContentLoaded', () => {
    // Select elements by their IDs
    const showQRCodeButton = document.getElementById('showQRCodeButton');
    const qrCodeModal = document.getElementById('qrCodeModal');
    const closeModal = document.getElementById('closeModal');
    const qrcodeContainer = document.getElementById('qrcode');
    const qrcode = new QRCode(qrcodeContainer, {
        width: 200,
        height: 200
    });

    // Function to generate QR code for the current website URL
    const generateQRCode = () => {
        const currentURL = window.location.href;
        qrcode.makeCode(currentURL);
    };

    // Show QR code in modal when icon is clicked
    showQRCodeButton.addEventListener('click', () => {
        generateQRCode();
        qrCodeModal.style.display = 'block';
    });

    // Close modal when close button is clicked
    closeModal.addEventListener('click', () => {
        qrCodeModal.style.display = 'none';
    });

    // Close the modal if the user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === qrCodeModal) {
            qrCodeModal.style.display = 'none';
        }
    });
});
