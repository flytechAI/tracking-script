// Load the jQuery library
const script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
script.onload = function() {
    main();
};
document.head.appendChild(script);

// Function to check if a specific UTM parameter exists with the given value in the URL
function checkUtmParam(utmValue) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('utm_campaign') === utmValue;
}

// Function to get the user's IP address
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
async function sendDataToSheet(ip, googleScriptURL) {
    try {
        await fetch(googleScriptURL, {
            method: 'POST',
            mode: 'no-cors',
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

// Fetch the specific client's configuration
async function fetchConfig(clientId) {
    let configURL = `https://cdn.jsdelivr.net/gh/flytechAI/tracking-script@main/configs/${clientId}.json`;
    let response = await fetch(configURL);
    return await response.json();
}

// Main function to run on page load
async function main() {
    // Fetch client ID from script tag
    let scripts = document.getElementsByTagName('script');
    let currentScript = [...scripts].filter(script => script.src.includes('tracking.js'))[0];
    let clientId = currentScript.getAttribute('data-client-id');

    // Fetch configuration based on client ID
    let config;
    try {
        config = await fetchConfig(clientId);
    } catch (error) {
        console.error("Error fetching configuration:", error);
        return;
    }

    // Check if the URL contains the required UTM parameter and value from config
    if (!checkUtmParam(config.utmParam)) {
        console.log("UTM condition not met. Exiting...");
        return;
    }

    let userIP = await getUserIP();
    if (userIP) {
        sendDataToSheet(userIP, config.googleScriptURL);
    } else {
        console.error("Could not retrieve user IP.");
    }
}

// Call the main function once the jQuery library is loaded
