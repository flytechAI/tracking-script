// Load the jQuery library
const script = document.createElement('script');
script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
script.onload = function() {
    main();
};
document.head.appendChild(script);

// Function to check if UTM paramet// The rest of your existing code...

async function fetchConfig(clientId) {
    let configURL = `https://cdn.jsdelivr.net/gh/flytechAI/tracking-script@main/configs/${clientId}.json`;
    let response = await fetch(configURL);
    return await response.json();
}

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

// Call the main function on page load
main();
