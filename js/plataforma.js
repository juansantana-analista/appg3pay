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
  
    // Detect iOS (iPhone, iPad, etc.)
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS';
    }
  
    // Detect Android
    if (/android/i.test(userAgent)) {
      return 'Android';
    }
  
    // Detect Windows (desktop)
    if (/Win/.test(userAgent)) {
      return 'Windows';
    }
  
    // Detect macOS (desktop)
    if (/Mac/.test(userAgent)) {
      return 'MacOS';
    }
  
    // Detect Linux (desktop)
    if (/Linux/.test(userAgent)) {
      return 'Linux';
    }
  
    // Fallback if not detected
    return 'Unknown';
  }
  
  // Use this function to take actions based on the platform
  const platform = detectPlatform();
  
  if (platform === 'iOS') {
    // Ações específicas para iOS
    alert('Rodando em iOS');
  } else if (platform === 'Android') {
    // Ações específicas para Android
    alert('Rodando em Android');
  } else {
    // Ações para desktop ou plataformas desconhecidas
    alert('Rodando em ' + platform);
  }
  
  
  document.addEventListener('DOMContentLoaded', function() {
        var conteudoInstall = document.getElementById('conteudoInstall');
        if (conteudoInstall) {
            conteudoInstall.innerHTML = `
                <p>Adicione <strong>o aplicativo G3 Pay</strong> à sua tela inicial para obter atualizações regulares. Toque em Compartilhar 
                <span class="mdi mdi-export-variant"></span> e depois <strong>Adicionar à <br>tela inicial </strong><span class="mdi mdi-plus-box-outline"></span>
                </p>`;
        } else {
            console.error('Elemento com id "conteudoInstall" não encontrado.');
        }

        var conteudoInstall = document.getElementById('conteudoInstall');
        if (conteudoInstall) {
            conteudoInstall.innerHTML = `
                <p>Instale <strong>o aplicativo G3 Pay</strong> para obter atualizações regulares. É rápido e ocupa menos armazenamento</p>
                <div class="display-flex flex-direction-row justify-content-space-between">
                <button class="button margin-right text-color-black">Depois</button>
                <button class="button button-fill color-red"><span class="mdi mdi-cellphone-arrow-down-variant"></span>Instalar</button>
                </div>`;
        } else {
            console.error('Elemento com id "conteudoInstall" não encontrado.');
        }
   });
