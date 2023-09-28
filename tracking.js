console.log("Script Loaded");

// Load the jQuery library
const script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
script.onload = function() {
    main();
};
document.head.appendChild(script);

// Function to check if UTM paramet
function checkUtmParam(utmValue) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('utm_campaign') === utmValue;
}

// Function to get user's IP address
async function getUserIP() {
    try {
        let response = await fetch('https://api64.ipify.org?format=json');
        let data = await response.json();
        return data.ip;
    } catch (error) {
    }
}

// Function to send data to Google Apps Script
async function sendDataToSheet(ip, googleScriptURL) {
    try {
        await fetch(googleScriptURL, {
            method: 'POST',
            mode: 'no-cors',  // Important for dealing with CORS issues
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip: ip })
        });
    } catch (error) {
        console.error("Error sending data:", error);
    }
}

async function fetchConfig(clientId) {
    
    let configURL = `https://cdn.jsdelivr.net/gh/flytechAI/tracking-script@main/configs/6M6M6ZrR.json`;
    let response = await fetch(configURL);
    return await response.json();
}

async function main() {
    // Fetch client ID from script tag

    let scripts = document.getElementsByTagName('script');
    let currentScript = [...scripts].filter(script => script.src.includes('tracking.js'))[0];
    let clientId = currentScript.getAttribute('data-client-id');


    if (!clientId) {
        console.error("Client ID not found in script tag. Exiting...");
        return;
    }

    // Fetch configuration based on client ID
    let config;
    try {
        config = await fetchConfig(clientId);
        if (!config || !config.googleScriptURL || !config.utmParam) {
            console.error("Incomplete configuration fetched. Exiting...");
            return;
        }
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
        console.error("Could not retrieve user ID.");
    }
}

main();
