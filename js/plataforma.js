function pedirPermissaoNotificacoes() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Permissão de notificações concedida');
          // Aqui você pode mostrar uma notificação de teste ou iniciar o serviço
          mostrarNotificacaoTeste();
        } else {
          console.log('Permissão de notificações negada');
        }
      });
    }
  }

