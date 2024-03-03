console.log("Script start");

function checkUtmParam(utmValues) {
    var urlParams = new URLSearchParams(window.location.search);
    var currentUtmValue = urlParams.get('utm_campaign');
    return utmValues.includes(currentUtmValue);
}

function getUserIP() {
    return fetch('https://api64.ipify.org?format=json')
        .then(response => response.json())
        .then(data => data.ip)
        .catch(error => {
            console.error('Error fetching IP:', error);
        });
}

function getUrlParam(paramName, defaultValue) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName) || defaultValue;
}

function sendDataToBubble(ip, config) {
    var utm_source = getUrlParam('utm_source', 'not_found');
    var utm_campaign = getUrlParam('utm_campaign', 'not_found');
    var utm_adname = getUrlParam('utm_adname', 'not_found');
    var utm_ft = getUrlParam('utm_ft', 'not_provided'); // Extract utm_ft for audienceId
    var referrer = window.location.href;

    var payload = {
        ipAddress: ip,
        source: utm_source,
        campaign: utm_campaign,
        creative: utm_adname,
        url: referrer,
        audienceId: utm_ft, // Use utm_ft for audienceId
        // Assuming visitorId and submissionId are either not required or will be generated/handled on the Bubble side
        visitorId: 'not_provided',
        submissionId: 'not_provided'
    };

    return fetch('https://flytech-platform.bubbleapps.io/version-test/api/1.1/wf/new_web_visit/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .catch(error => {
        console.error("Error sending data to Bubble:", error);
    });
}

function fetchConfig(clientId) {
    var configURL = 'https://flytech-tracking.s3.amazonaws.com/configs/' + clientId + '.json';
    return fetch(configURL)
        .then(response => response.json());
}

function main() {
    var clientId = window.trackingClientId;

    if (!clientId) {
        console.error("Client ID not found. Exiting...");
        return;
    }

    fetchConfig(clientId)
    .then(config => {
        if (!config || !config.utmParams) {
            console.error("Incomplete configuration fetched. Exiting...");
            return;
        }

        if (!checkUtmParam(config.utmParams)) {
            return;
        }

        return getUserIP().then(ip => {
            return { ip: ip, config: config };
        });
    })
    .then(data => {
        if (data.ip) {
            return sendDataToBubble(data.ip, data.config);
        }
    })
    .catch(error => {
        console.error("Error in main function:", error);
    });
}

// Run main function after the document has fully loaded
if (document.readyState === 'loading') {  
    document.addEventListener('DOMContentLoaded', main);
} else {  
    main();
}
