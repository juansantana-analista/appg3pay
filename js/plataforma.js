function detectMobileOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
    // Verifica se é um dispositivo iOS (iPhone/iPad)
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return 'iOS';
    }
  
    // Verifica se é um dispositivo Android
    if (/android/i.test(userAgent)) {
      return 'Android';
    }
  
    // Caso não seja iOS nem Android
    return 'Other';
  }
  
  const os = detectMobileOS();
  console.log('Sistema Operacional:', os);
  
  // Você pode usar essa variável `os` para tomar ações específicas
  if (os === 'iOS') {
    alert(onApplePwa ());
  } else if (os === 'Android') {
    alert(onAndroidPwa ());
  } else {
    console.log('Usuário está usando outro tipo de dispositivo.');
  }
  
  let isPWAInstalled = false;

  function onAndroidPwa () {
    // Verifica se o PWA está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
        isPWAInstalled = true;
    }
    return isPWAInstalled;
  }

  function onApplePwa () {
    // Verifica se o PWA está instalado
    if (window.navigator.standalone) {
        isPWAInstalled = true;
    }
    return isPWAInstalled;
  }
