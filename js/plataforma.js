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

// Verificar se o PWA está instalado com base no sistema operacional
if (os === 'iOS') {
    var estaInstalado = onApplePwa();
    alert("PWA instalado no iOS: " + estaInstalado);
} else if (os === 'Android') {
    var estaInstalado = onAndroidPwa();
    alert("PWA instalado no Android: " + estaInstalado);
} else {
    console.log('Usuário está usando outro tipo de dispositivo.');
}

function onAndroidPwa() {
    // Verifica se o PWA está instalado no Android
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    } else {
        return false;
    }
}

function onApplePwa() {
    // Verifica se o PWA está instalado no iOS
    if (window.navigator.standalone) {
        return true;
    } else {
        return false;
    }
}
