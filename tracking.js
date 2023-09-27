// Load the jQuery library
const script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
script.onload = function() {
    main();
};
document.head.appendChild(script);

// Function to check if UTM parameter and value exist in the URL
function checkUtmParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('utm_campaign') === 'marketing';
}

// Function to get user's IP address
async function getUserIP() {
    try {
        let response = await fetch('https://api64.ipify.org?format=json');
        let data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP:', error);
    }
}

// Function to send data to Google Apps Script
async function sendDataToSheet(ip) {
    try {
        await fetch('https://script.google.com/macros/s/AKfycby5efgyX7DiI-hSACsyyQKjXAw7sP2jjahh4JQ-iYmwDaJG_vyyrA8iEPUx0EhP_L9N/exec', {
            method: 'POST',
            mode: 'no-cors',  // Important for dealing with CORS issues
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip: ip })
        });
        console.log("Data sent successfully");
    } catch (error) {
        console.error("Error sending data:", error);
    }
}

// Main function to run after jQuery loads
async function main() {
    // Check if the URL contains the required UTM parameter and value
    if (!checkUtmParam()) {
        console.log("UTM condition not met. Exiting...");
        return;
    }

    let userIP = await getUserIP();
    if (userIP) {
        sendDataToSheet(userIP);
    } else {
        console.error("Could not retrieve user IP.");
    }
}
