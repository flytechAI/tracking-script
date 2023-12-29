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

function sendDataToSheet(ip, googleScriptURL) {
    var utm_source = getUrlParam('utm_source', 'not_found');
    var utm_adname = getUrlParam('utm_adname', 'not_found');
    var utm_campaign = getUrlParam('utm_campaign', 'not_found');
    var referrer = window.location.href;

    var payload = {
        ip: ip,
        utm_source: utm_source,
        utm_adname: utm_adname,
        utm_campaign: utm_campaign,
        referrer: referrer
    };

    return fetch(googleScriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .catch(error => {
        console.error("Error sending data:", error);
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
        if (!config || !config.googleScriptURL || !config.utmParams) {
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
            return sendDataToSheet(data.ip, data.config.googleScriptURL);
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
