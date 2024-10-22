# Cyberik


## Projeto de Detecção de Hijacking e Monitoramento de Fingerprinting

Este projeto é uma extensão para navegador que visa detectar possíveis vulnerabilidades em páginas da web. 

## Funcionalidades

- **Detecção de Conexões de Terceiros**: Monitora conexões de terceiros.
- **Visualização de Cookies**: Exibe os cookies utilizados no navegador.
- **Armazenamento local**: Exibe quantos itens estão armazenados no local storage.
- **Detecção de Hijacking**: Monitora alterações no DOM e alerta sobre a injeção de scripts suspeitos.
- **Monitoramento de Fingerprinting**: Detecta chamadas aos métodos `getContext`, `toDataURL` e `getImageData` do Canvas, que podem ser utilizados para coletar informações sobre o dispositivo do usuário.
- **Nota de Privacidade**: Exibe uma nota de privacidade para aquele site.

## Como Usar

1. **Instalação**: Clone este repositório e carregue a extensão no seu navegador. (Para o Chrome, acesse `chrome://extensions`, ative o modo de desenvolvedor e carregue a pasta do projeto.)

2. **Uso**: Acesse uma página da web e clique no ícone da extensão para visualizar as informações coletadas.


## Estrutura do Projeto

- `manifest.json`: Configurações da extensão.
- `background.js`: Lógica de background para processar mensagens.
- `content.js`: Lógica de detecção de hijacking e monitoramento de fingerprinting.
- `popup.js`: Lógica para exibir informações no popup da extensão.
- `popup.html`: Estrutura HTML do popup da extensão.
