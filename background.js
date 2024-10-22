let thirdPartyDomains = [];
let firstPartySessionCookies = [];
let firstPartyPersistentCookies = [];
let thirdPartySessionCookies = [];
let thirdPartyPersistentCookies = [];
let canvasFingerprintDetections = [];
let hijackingDetected = false;

function categorizeCookies(cookies, currentDomain) {
  const now = Date.now();

  cookies.forEach(cookie => {
    const isSessionCookie = !cookie.expirationDate || cookie.expirationDate > now;

    if (cookie.domain.includes(currentDomain)) {
      if (isSessionCookie) {
        if (!firstPartySessionCookies.some(c => c.name === cookie.name && c.domain === cookie.domain)) {
          firstPartySessionCookies.push(cookie);
        }
      } else {
        if (!firstPartyPersistentCookies.some(c => c.name === cookie.name && c.domain === cookie.domain)) {
          firstPartyPersistentCookies.push(cookie);
        }
      }
    } else {
      if (isSessionCookie) {
        if (!thirdPartySessionCookies.some(c => c.name === cookie.name && c.domain === cookie.domain)) {
          thirdPartySessionCookies.push(cookie);
        }
      } else {
        if (!thirdPartyPersistentCookies.some(c => c.name === cookie.name && c.domain === cookie.domain)) {
          thirdPartyPersistentCookies.push(cookie);
        }
      }
    }
  });
}

function checkLocalStorage(sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => Object.keys(localStorage).map(key => ({key, value: localStorage.getItem(key)}))
      },
      (results) => {
        sendResponse({ localStorageData: results && results[0].result ? results[0].result : [] });
      }
    );
  });
}

chrome.webNavigation.onCompleted.addListener(function(details) {
  const currentDomain = new URL(details.url).hostname;
  
  chrome.cookies.getAll({url: details.url}, function(cookies) {
    categorizeCookies(cookies, currentDomain);
  });
}, {url: [{schemes: ['http', 'https']}]});


chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    const url = new URL(details.url);
    const domain = url.hostname;

    if (domain !== location.hostname && !thirdPartyDomains.includes(domain)) {
      thirdPartyDomains.push(domain);
    }

    if (details.type === 'script') {
      if (details.url.includes('suspicious')) {
        hijackingDetected = true;  
      }
    }
  },
  { urls: ["<all_urls>"] }
);



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'check_cookies') {
    sendResponse({
      firstPartySessionCookies: firstPartySessionCookies,
      firstPartyPersistentCookies: firstPartyPersistentCookies,
      thirdPartySessionCookies: thirdPartySessionCookies,
      thirdPartyPersistentCookies: thirdPartyPersistentCookies
    });

    firstPartySessionCookies = [];
    firstPartyPersistentCookies = [];
    thirdPartySessionCookies = [];
    thirdPartyPersistentCookies = [];
  }

  if (request.message === 'check_connections') {
    sendResponse({ domains: thirdPartyDomains });
    thirdPartyDomains = []; 
  }

  if (request.message === 'check_hijacking') {
    sendResponse({ hijackingDetected: hijackingDetected });
    hijackingDetected = false;  
  }

  if (request.message === 'check_storage') {
    checkLocalStorage(sendResponse);
    return true;
  }

  if (request.message === 'canvas_fingerprint_detected') {
    canvasFingerprintDetections.push(request.type);
    console.log('Canvas fingerprinting detected: ' + request.type);

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icone.png',
      title: 'Detecção de Canvas Fingerprinting',
      message: `Método ${request.type} usado no canvas para possível fingerprinting.`,
      priority: 2
    });
  }

  if (request.message === 'check_canvas_fingerprinting') {
    sendResponse({ canvasFingerprintDetections: canvasFingerprintDetections });
    canvasFingerprintDetections = [];
  }

});
