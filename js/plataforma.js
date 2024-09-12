if (window.matchMedia('(display-mode: fullscreen)').matches) {
    alert('O app está instalado e rodando em modo standalone');
  } else {
    alert('O app não está instalado.');
  }
  
  if (window.navigator.fullscreen) {
    alert('O app está instalado e rodando em modo standalone');
  } else {
    alert('O app não está instalado.');
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('O app está instalado e rodando em modo standalone');
  } else {
    console.log('O app não está instalado.');
  }