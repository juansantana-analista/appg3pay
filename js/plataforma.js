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