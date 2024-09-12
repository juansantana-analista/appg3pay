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

    // Se o PWA não estiver instalado, sugerir ao usuário instalar no iOS
    if (!estaInstalado) {
        alert('Para instalar o PWA, toque no ícone de compartilhamento e depois em "Adicionar à Tela de Início".');
    }
} else if (os === 'Android') {
    var estaInstalado = onAndroidPwa();
    alert("PWA instalado no Android: " + estaInstalado);
} else {
    console.log('Usuário está usando outro tipo de dispositivo.');
}

// Função para verificar se o PWA está instalado no Android
function onAndroidPwa() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    } else {
        return false;
    }
}

// Função para verificar se o PWA está instalado no iOS
function onApplePwa() {
    if (window.navigator.standalone) {
        return true;
    } else {
        return false;
    }
}

// Exibir um botão customizado para instalação do PWA (Android) e lidar com a instalação
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Previne o prompt automático de instalação
    e.preventDefault();
    deferredPrompt = e;

    // Mostrar o botão de instalação personalizado
    const installButton = document.getElementById('installButton');
    if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', () => {
            // Mostrar o prompt de instalação
            deferredPrompt.prompt();

            // Verifica a resposta do usuário
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuário aceitou a instalação do PWA');
                } else {
                    console.log('Usuário recusou a instalação do PWA');
                }
                deferredPrompt = null;
            });
        });
    }
});

// Detectar quando o PWA for instalado no Android
window.addEventListener('appinstalled', () => {
    console.log('PWA foi instalado');
    // Recarrega a página após a instalação do PWA
    window.location.reload();
});

// Verificação contínua no Android para saber se o PWA está rodando em modo standalone
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('PWA está rodando em modo standalone');
            alert('O PWA foi instalado e está rodando');
        } else {
            console.log('PWA não está rodando em modo standalone');
        }
    }
});
