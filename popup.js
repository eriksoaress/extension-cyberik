function calcularPontuacao() {
  let totalPontos = 100;

  chrome.runtime.sendMessage({ message: 'check_cookies' }, function (response) {
    const numCookies = response.thirdPartySessionCookies.length +
                      response.thirdPartyPersistentCookies.length;

    totalPontos -= numCookies; // Subtrai o número de cookies de terceiros

    // Subtrai o número de conexões de terceiros
    chrome.runtime.sendMessage({ message: 'check_connections' }, function (connectionResponse) {
      const numConexoesTerceiras = connectionResponse.domains.length;
      totalPontos -= numConexoesTerceiras;

      // Subtrai 20 se hijacking for detectado
      chrome.runtime.sendMessage({ message: 'check_hijacking' }, function (hijackingResponse) {
        if (hijackingResponse && hijackingResponse.hijackingDetected) {
          totalPontos -= 20; 
        }

        // Subtrai 10 se fingerprint for detectado
        chrome.runtime.sendMessage({ message: 'check_fingerprint' }, function (fingerprintResponse) {
          if (fingerprintResponse && fingerprintResponse.fingerprintDetected) {
            totalPontos -= 10; 
          }

          classificarPontuacao(totalPontos);
        });
      });
    });
  });
}

function classificarPontuacao(totalPontos) {
  let classificacao = '';

  if (totalPontos > 90) {
    classificacao = 'Ótimo';
  } else if (totalPontos > 70) {
    classificacao = 'Bom';
  } else if (totalPontos > 50) {
    classificacao = 'Médio';
  } else if (totalPontos > 30) {
    classificacao = 'Ruim';
  } else {
    classificacao = 'Péssimo';
  }

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icone.png',
    title: 'Pontuação de Segurança',
    message: `Sua pontuação é: ${totalPontos} - Classificação: ${classificacao}`,
    priority: 2
  });
}

document.getElementById('checkBtn').addEventListener('click', function () {
  chrome.runtime.sendMessage({ message: 'check_connections' }, function (response) {
    let message = '';

    if (response && response.domains) {
      message = `Conexões de terceiros detectadas: ${response.domains.length}`;
    } else {
      message = 'Nenhuma conexão de terceiros detectada.';
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icone.png',
      title: 'Conexões de Terceiros',
      message: message,
      priority: 2
    });
  });
});

document.getElementById('checkCookiesBtn').addEventListener('click', function () {
  chrome.runtime.sendMessage({ message: 'check_cookies' }, function (response) {
    let message = '';
    if (response) {
      const firstPartySessionCount = response.firstPartySessionCookies.length;
      const firstPartyPersistentCount = response.firstPartyPersistentCookies.length;
      const thirdPartySessionCount = response.thirdPartySessionCookies.length;
      const thirdPartyPersistentCount = response.thirdPartyPersistentCookies.length;

      message = `Primeira Parte (Sessão): ${firstPartySessionCount}\n` +
                `Primeira Parte (Persistentes): ${firstPartyPersistentCount}\n` +
                `Terceira Parte (Sessão): ${thirdPartySessionCount}\n` +
                `Terceira Parte (Persistentes): ${thirdPartyPersistentCount}`;
    } else {
      message = 'Nenhum cookie encontrado.';
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icone.png',
      title: 'Informações de Cookies',
      message: message,
      priority: 2
    });
  });
});



document.getElementById('checkHijackingBtn').addEventListener('click', function () {
  chrome.runtime.sendMessage({ message: 'check_hijacking' }, function (response) {
    let message = '';

    if (response && response.hijackingDetected) {
      message = 'Potenciais ameaças de hijacking detectadas!';
    } else {
      message = 'Nenhuma ameaça de hijacking detectada.';
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icone.png', 
      title: 'Detecção de Hijacking',
      message: message,
      priority: 2
    });
  });
});

document.getElementById('checkStorageBtn').addEventListener('click', function () {
  chrome.runtime.sendMessage({ message: 'check_storage' }, function (response) {
    let message = '';
    if (response && response.localStorageData) {
      message = `Armazenamento Local detectado com ${response.localStorageData.length} itens.`;
    } else {
      message = 'Nenhum dado encontrado no Armazenamento Local.';
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icone.png',
      title: 'Armazenamento Local',
      message: message,
      priority: 2
    });
  });
});

document.getElementById('checkCanvasBtn').addEventListener('click', function () {
  chrome.runtime.sendMessage({ message: 'check_canvas_fingerprinting' }, function (response) {
    let message = '';

    if (response && response.canvasFingerprintDetections.length > 0) {
      message = `Canvas Fingerprinting detectado: ${response.canvasFingerprintDetections.join(', ')}`;
    } else {
      message = 'Nenhuma detecção de Canvas Fingerprinting.';
    }

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icone.png',
      title: 'Canvas Fingerprinting',
      message: message,
      priority: 2
    });
  });
});

document.getElementById('calculateScoreBtn').addEventListener('click', function () {
  calcularPontuacao();
});
