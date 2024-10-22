function detectDOMChanges(currentDomain) {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.tagName === 'SCRIPT' && node.src && !node.src.includes(currentDomain)) {
            chrome.runtime.sendMessage({ message: 'script_injected', scriptDetails: node.src });
          } else if (node.tagName === 'SCRIPT') {
            chrome.runtime.sendMessage({ message: 'script_injected', scriptDetails: node.innerHTML });
          }
        });
      }
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function detectPotentialHijacking() {
  const suspiciousPatterns = ['hook', 'hijack', 'malicious'];
  const scripts = document.getElementsByTagName('script');
  for (let script of scripts) {
    suspiciousPatterns.forEach(pattern => {
      if (script.src.includes(pattern) || script.innerHTML.includes(pattern)) {
        console.warn('Possível hijacking detectado:', script.src || script.innerHTML);
        chrome.runtime.sendMessage({ message: 'potential_hijacking', scriptDetails: script.src || script.innerHTML });
      }
    });
  }
}

function monitorCanvasFingerprinting() {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    console.log(`Canvas fingerprinting detectado: getContext chamado com tipo ${type}`);
    
    chrome.runtime.sendMessage({ message: 'canvas_fingerprint_detected', type: type });

    return originalGetContext.apply(this, [type, ...args]);
  };

  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;

  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    console.log('Canvas fingerprinting detectado: toDataURL chamado');
    
    chrome.runtime.sendMessage({ message: 'canvas_fingerprint_detected', type: 'toDataURL' });

    return originalToDataURL.apply(this, args);
  };

  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

  CanvasRenderingContext2D.prototype.getImageData = function(...args) {
    console.log('Canvas fingerprinting detectado: getImageData chamado');
    
    chrome.runtime.sendMessage({ message: 'canvas_fingerprint_detected', type: 'getImageData' });

    return originalGetImageData.apply(this, args);
  };
}

monitorCanvasFingerprinting();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'check_hijacking') {
    detectPotentialHijacking(); 
    sendResponse({ status: 'Hijacking check completed' });
  }
});

detectDOMChanges(window.location.hostname);

detectPotentialHijacking();
