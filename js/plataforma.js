if (window.matchMedia('(display-mode: fullscreen)').matches) {
    alert('O app está instalado e rodando em modo standalone');
  } else {
    alert('O app não está instalado.');
  }
  
  if (window.navigator.standalone) {
    alert('O app está instalado e rodando em modo standalone');
  } else {
    alert('O app não está instalado.');
  }