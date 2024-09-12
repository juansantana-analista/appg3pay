document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o elemento está presente
    var conteudoInstall = document.getElementById('conteudoInstall');
    if (!conteudoInstall) {
      console.error('Elemento "conteudoInstall" não encontrado.');
      return;
    }
  
    // Verifica se o app está rodando em modo standalone ou fullscreen
    if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
      console.log('O app está rodando em modo standalone ou fullscreen');
    } else {
      console.log('O app não está rodando em modo standalone nem fullscreen');
    }
    
    if (window.navigator.standalone) {
      console.log('O app está rodando em modo standalone (fixado na tela inicial no iOS)');
    } else {
      console.log('O app não está rodando em modo standalone no iOS');
    }
  
    function detectPlatform() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
      // Detecta iOS (iPhone, iPad, etc.)
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'iOS';
      }
    
      // Detecta Android
      if (/android/i.test(userAgent)) {
        return 'Android';
      }
    
      // Detecta Windows (desktop)
      if (/Win/.test(userAgent)) {
        return 'Windows';
      }
    
      // Detecta macOS (desktop)
      if (/Mac/.test(userAgent)) {
        return 'MacOS';
      }
    
      // Detecta Linux (desktop)
      if (/Linux/.test(userAgent)) {
        return 'Linux';
      }
    
      // Fallback se não for detectado
      return 'Unknown';
    }
    
    // Usa essa função para tomar ações com base na plataforma
    const platform = detectPlatform();
  
    // Adiciona um pequeno atraso para garantir que o DOM esteja pronto
    setTimeout(function() {
      if (platform === 'iOS') {
        // Ações específicas para iOS
        conteudoInstall.innerHTML = `
            <p>Adicione <strong>o aplicativo G3 Pay</strong> à sua tela inicial para obter atualizações regulares. Toque em Compartilhar 
            <span class="mdi mdi-export-variant"></span> e depois <strong>Adicionar à <br>tela inicial </strong><span class="mdi mdi-plus-box-outline"></span>
            </p>`;    
      } else if (platform === 'Android') {
        // Ações específicas para Android
        conteudoInstall.innerHTML = `
        <p>Instale <strong>o aplicativo G3 Pay</strong> para obter atualizações regulares. É rápido e ocupa menos armazenamento</p>
        <div class="display-flex flex-direction-row justify-content-space-between">
        <button class="button margin-right text-color-black">Depois</button>
        <button class="button button-fill color-red"><span class="mdi mdi-cellphone-arrow-down-variant"></span> Instalar</button>
        </div>`;
      } else {
        // Ações para desktop ou plataformas desconhecidas
      }
    }, 100); // Atraso de 100 milissegundos (ajuste conforme necessário)
  });
  