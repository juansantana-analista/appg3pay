//DADOS BACKEND SERVER
const apiServerUrl = "https://vitatop.tecskill.com.br/rest.php";
const versionApp = "1.2.3";
var userAuthToken = "";

//INICIALIZAÇÃO DO F7 QUANDO DISPOSITIVO ESTÁ PRONTO
document.addEventListener('deviceready', onDeviceReady, false);
var app = new Framework7({
  // App root element
  el: '#app',
  // App Name
  name: 'Vitatop',
  // App id
  id: 'br.com.g3pay',
  // Enable swipe panel
  panel: {
    swipe: false,
  },
  dialog: {
    buttonOk: 'Sim',
    buttonCancel: 'Cancelar',
  },
  // Disable page animations globally
  animate: false,
  // Add default routes
  routes: [
    {
      path: '/index/',
      url: 'index.html?v=' + versionApp,
      on: {
        pageBeforeIn: async function (event, page) {    
          clearLocalStorage();
          
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Obtém a URL atual do navegador
          const currentUrl = window.location.href;

          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500);
          } else {
            // Se a URL contiver "/notificacoes", redireciona
            if (currentUrl.includes('https://appvitatop.tecskill.com.br/#/notificacoes')) {
              app.views.main.router.navigate('/notificacoes/');
            } else {
              // Lógica para continuar usando o token
              app.views.main.router.navigate("/home/");              
            }
          }
          var userName = localStorage.getItem('userName');
          if(userName != '' && userName != null) {
            $("#nomeUsuario").html(userName);
          }
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada  
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

          var conteudoInstall = document.getElementById('conteudoInstall');

          if (platform === 'iOS') {
            // Ações específicas para iOS    
            if (window.navigator.standalone) {
              console.log('O app está rodando em modo standalone (fixado na tela inicial no iOS)');
              $("#installBanner").addClass("display-none");
            } else {
              console.log('O app não está rodando em modo standalone no iOS');
              
              $("#installBanner").removeClass("display-none");
            }
            conteudoInstall.innerHTML = `
            <p>Adicione <strong>o aplicativo Vitatop</strong> à sua tela inicial para obter atualizações regulares. Toque em Compartilhar 
            <span class="mdi mdi-export-variant"></span> e depois <strong>Adicionar à <br>tela inicial </strong><span class="mdi mdi-plus-box-outline"></span>
            </p>`;
          } else if (platform === 'Android') {
            // Ações específicas para Android
            if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
              console.log('O app está rodando em modo standalone ou fullscreen');
              $("#installBanner").addClass("display-none");
            } else {
              $("#installBanner").removeClass("display-none");
            }
            conteudoInstall.innerHTML = `
            <p>Instale <strong>o aplicativo Vitatop</strong> para obter atualizações regulares. É rápido e ocupa menos armazenamento</p>
            <div class="display-flex flex-direction-row justify-content-space-between">
                <button id="fecharInstall" class="button margin-right text-color-gray">Depois</button>
                <button id="installAppAndroid" class="button button-fill color-red"><span class="mdi mdi-cellphone-arrow-down-variant"></span> Instalar</button>
            </div>`;
          } else {
            // Ações para desktop ou plataformas desconhecidas
            if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
              conteudoInstall.innerHTML = `
              <p>Instale <strong>o aplicativo Vitatop</strong> para obter atualizações regulares. É rápido e ocupa menos armazenamento</p>
              <div class="display-flex flex-direction-row justify-content-space-between">
                  <button id="fecharInstallDesktop" class="button margin-right text-color-gray">Depois</button>
                  <button id="installAppDesktop" class="button button-fill color-red"><span class="mdi mdi-cellphone-arrow-down-variant"></span> Instalar</button>
              </div>`;
              console.log('O app está rodando em modo standalone ou fullscreen');
              $("#installBanner").addClass("display-none");
            } else {
              $("#installBanner").removeClass("display-none");
            }
          }
          
          $("#fecharInstall").on("click", function () {
            $("#installBanner").addClass("display-none");
          });
          $("#fecharInstallDesktop").on("click", function () {
            $("#installBanner").addClass("display-none");
          });
          window.addEventListener('beforeinstallprompt', (event) => {
            // Prevenir o comportamento padrão
            event.preventDefault();
            deferredPrompt = event;

            //AÇÃO DOS BOTÕES
            $("#installAppAndroid").on("click", function () {
              $("#installBanner").addClass("display-none");
              // Usuário clicou em "Confirmar"
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                  if (choiceResult.outcome === 'accepted') {
                    console.log('Usuário aceitou a instalação.');
                  } else {
                    console.log('Usuário rejeitou a instalação.');
                  }
                  deferredPrompt = null;
                });
              }
            });
            $("#installAppDesktop").on("click", function () {
              $("#installBanner").addClass("display-none");
              // Usuário clicou em "Confirmar"
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                  if (choiceResult.outcome === 'accepted') {
                    console.log('Usuário aceitou a instalação.');
                  } else {
                    console.log('Usuário rejeitou a instalação.');
                  }
                  deferredPrompt = null;
                });
              }
            });
          });

        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: "/splash-view/",
      url: "splash-view.html?v=" + versionApp,
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          var swiper = app.swiper.create(".swiper", {
            speed: 900,
            pagination: {
              el: ".swiper-pagination",
            },
            spaceBetween: 50,
          });

          //AÇÃO DO BOTÃO SIGNIN
          $("#signInSplash").on("click", function () {
            app.views.main.router.navigate("/login-view/");
          });
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/login-view/",
      url: "login-view.html?v=" + versionApp,
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida          
          localStorage.removeItem("userId");     
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          const oneSignalId = localStorage.getItem('oneSignalId');   
          
        // Form elements
        const loginForm = document.getElementById('loginForm');
        const recoveryEmailForm = document.getElementById('recoveryEmailForm');
        const verificationCodeForm = document.getElementById('verificationCodeForm');
        const newPasswordForm = document.getElementById('newPasswordForm');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        
        // Back to login buttons
        const backToLoginButtons = document.querySelectorAll('.back-to-login');

        // Forgot Password Link
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.add('hidden');
            recoveryEmailForm.classList.remove('hidden');
        });

        // Back to Login Handlers
        backToLoginButtons.forEach(button => {
            button.addEventListener('click', function() {
                loginForm.classList.remove('hidden');
                recoveryEmailForm.classList.add('hidden');
                verificationCodeForm.classList.add('hidden');
                newPasswordForm.classList.add('hidden');
            });
        });

        // Recovery Email Form Submission
        recoveryEmailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailRecuperacao = this.querySelector('input[type="email"]').value;
            
            //START BOTÃO RECUPERAR SENHA     
                app.dialog.preloader("Carregando...");

              //START Fazendo a requisição
                fetch('https://vitatop.tecskill.com.br/api/request_reset.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: emailRecuperacao
                    })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.status == 'success' && data.data.status == 'success') {
                    localStorage.setItem("emailRecuperacao", emailRecuperacao);
                      app.dialog.close();
                      recoveryEmailForm.classList.add('hidden');
                      verificationCodeForm.classList.remove('hidden');
                  } else {
                    app.dialog.close();
                    app.dialog.alert("Erro na requisição: " + (data.message || "Dados inválidos"), "Falha");
                  }
                })
                .catch(error => {
                  app.dialog.close();
                  app.dialog.alert("Erro na requisição: " + (error || "Dados inválidos"), "Falha");
                    console.error('Error:', error);
                })              
              //END Fazendo a requisição
          //END BOTÃO RECUPERAR SENHA
        });

        // Verification Code Input Handling
        const codeInputs = document.querySelectorAll('.code-inputs input');
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', function() {
                if(this.value.length === 1 && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', function(e) {
                if(e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });
        });

        // Verification Code Form Submission
        verificationCodeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            app.dialog.preloader("Carregando...");
            const code = Array.from(codeInputs).map(input => input.value).join('');
            
            // Simulated code validation
            if(code.length === 6) {          
                var emailRecuperacao = localStorage.getItem("emailRecuperacao");
                  // Prepara a requisição
                  const headers = {
                    "Content-Type": "application/json",
                  };
    
                  const body = JSON.stringify({
                    email: emailRecuperacao,
                    code: code,
                  });
    
                  const options = {
                    method: "POST",
                    headers: headers,
                    body: body,
                  };
    
                  // Faz a requisição ao servidor
                  fetch("https://vitatop.tecskill.com.br/api/validate_code.php", options)
                    .then((response) => response.json())
                    .then((data) => {
                      app.dialog.close();
                      if (data.status === "success" && data.data.status === "success") {
                        localStorage.setItem("codigoRecuperacao", code);
                        verificationCodeForm.classList.add('hidden');
                        newPasswordForm.classList.remove('hidden');
                      } else {
                        app.dialog.alert(
                          "Erro, Código informado inválido ou expirado.",
                          '<i class="mdi mdi-alert"></i> Código Inválido'
                        );
                      }
                    })
                    .catch((error) => {
                      console.error("Erro:", error);
                      app.dialog.close();
                      app.dialog.alert(
                        "Erro, Código informado inválido ou expirado.",
                        '<i class="mdi mdi-alert"></i> Código Inválido'
                      );
                    });
            } else {           
              app.dialog.close();   
              return app.dialog.alert(
                "Por favor, insira todos os 6 dígitos do código.",
                '<i class="mdi mdi-alert"></i> Código Incompleto'
              );
            }
        });

        // New Password Form Submission
        newPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            app.dialog.preloader("Carregando...");
            var emailRecuperacao = localStorage.getItem("emailRecuperacao");
            var codigoRecuperacao = localStorage.getItem("codigoRecuperacao");
            const newPassword = this.querySelectorAll('input[type="password"]')[0].value;
            const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
            
            if(newPassword && newPassword === confirmPassword) {            
                const headers = {
                  "Content-Type": "application/json"
                };
    
                const body = JSON.stringify({
                  email: emailRecuperacao,
                  code: codigoRecuperacao,
                  password: newPassword
                });
    
                const options = {
                  method: "POST",
                  headers: headers,
                  body: body,
                };
    
                fetch('https://vitatop.tecskill.com.br/api/reset_password.php', options)
                  .then((response) => response.json())
                  .then((data) => {
                    app.dialog.close();
                    if (data.status == 'success' && data.data.status == 'success') {
                      // Reset all forms
                      newPasswordForm.classList.add('hidden');
                      loginForm.classList.remove('hidden');
                      app.dialog.alert(
                        "Sucesso, Senha alterada.",
                        '<i class="mdi mdi-alert"></i> Sucesso'
                      );                    
                    } else {
                      app.dialog.close();
                      app.dialog.alert(
                        "Erro, Código informado invalido ou expirado.",
                        '<i class="mdi mdi-alert"></i> Código Inválido'
                      );
                    }
                  })
                  .catch((error) => {
                    console.error("Erro:", error);
                    app.dialog.close();
                    app.dialog.alert(
                      "Erro, Código informado invalido ou expirado.",
                      '<i class="mdi mdi-alert"></i> Código Inválido'
                    );
                  });
            } else {
              app.dialog.close();
              app.dialog.alert(
                "As senhas não coincidem. Por favor, tente novamente",
                '<i class="mdi mdi-alert"></i> Erro'
              );
            }
        });
        // Login Form Submission
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            app.dialog.preloader("Carregando...");
            const userName = this.querySelector('input[type="email"]').value;
            const userPassword = this.querySelector('input[type="password"]').value;            
            
            // Função para validar o e-mail usando regex
            function validarEmail(email) {
              var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return regex.test(email);
            }

            if (userName == "" || userPassword == "" || !validarEmail(userName)) {
              app.dialog.close();
              app.dialog.alert(
                "Por favor, verifique seu Email e Senha e tente novamente.",
                '<i class="mdi mdi-alert"></i> Erro!'
              );
            } else {
              //START Fazendo a requisição
              fetch('https://vitatop.tecskill.com.br/api/auth_app.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userName: userName,
                        userPassword: userPassword
                    })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.status == 'success') {
                    app.dialog.close();
                    const token = data.data;
                    setCookie('userAuthToken', token, 5);
                    appId = "Bearer " +  getCookie('userAuthToken');
                    userAuthToken = token;
                    const decodedToken = jwt_decode(token);
                    // Navegar para outra página ou realizar outras ações necessárias

                    localStorage.setItem("user", decodedToken.user);
                    localStorage.setItem("userId", decodedToken.userid);         
                    localStorage.setItem("userName", decodedToken.username);
                    localStorage.setItem("userEmail", decodedToken.usermail);
                    localStorage.setItem("pessoaId", decodedToken.pessoa_id);
                    localStorage.setItem("codigo_indicador", decodedToken.codigo_indicador);
                    localStorage.setItem("validadeToken", decodedToken.expires);
                    //localStorage.setItem("validadeToken", decodedToken.expires);

                    buscarPessoaId(decodedToken.userid);
                    setTimeout(() => {
                        oneSignalLogin(decodedToken.userid, oneSignalId);
                    }, 500); // Atraso de 500ms

                    setTimeout(function () {
                      app.views.main.router.navigate("/home/");
                    }, 300);

                  } else {
                    app.dialog.close();
                    app.dialog.alert("Erro no login: " + (data.message || "Dados inválidos"), "Falha no Login");
                  }
                })
                .catch(error => {
                    console.error('Error:', error);
                })              
              //END Fazendo a requisição
            }
        });
          //START AÇÃO BOTÃO REGISTER
          $("#register").on("click", function () {
            app.views.main.router.navigate("/registerView/");
          });
          //END AÇÃO BOTÃO REGISTER
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: '/gestao/',
      url: 'gestao.html?v=' + versionApp,
      animate: false,
      on: {
        pageBeforeIn: async function (event, page) {
          clearLocalStorage();
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          
          var userIdAtual = localStorage.getItem('userId');
          localStorage.setItem("oneSignalId", userIdAtual);
          // fazer algo antes da página ser exibida
          $("#menuPrincipal").show("fast");
          $("#menuPrincipal").removeClass("display-none");

        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
          // Toggle balance visibility
          const toggleBalance = document.getElementById('toggleBalance');
          const balance = document.getElementById('balance');
          const actualBalance = document.getElementById('actualBalance');
          let isBalanceHidden = true;

          toggleBalance.addEventListener('click', () => {
              isBalanceHidden = !isBalanceHidden;
              if (isBalanceHidden) {
                  balance.style.display = 'block';
                  actualBalance.style.display = 'none';
                  toggleBalance.className = 'far fa-eye';
              } else {
                  balance.style.display = 'none';
                  actualBalance.style.display = 'block';
                  toggleBalance.className = 'far fa-eye-slash';
              }
          });
          // Verifica se o tutorial já foi concluído
          if (!localStorage.getItem('tutorialCompleted')) {
            $("#installBanner").addClass("display-none");            
            // Configuração do Intro.js
            introJs()
                .setOptions({
                    steps: [
                        {
                            element: '.wallet-card',
                            intro: 'Aqui fica sua carteira Digital. Veja seu extrato, adicione ou transfira seu saldo.',
                            position: 'bottom'
                        },
                        {
                            element: '#toggleBalance',
                            intro: 'Clique aqui para visualizar o saldo',
                            position: 'bottom'
                        },
                        {
                            element: '.vendas-mes',
                            intro: 'Esse cartão mostra suas vendas do mês, e o seu desempenho.',
                            position: 'bottom'
                        },
                        {
                            element: '.afiliados-ativos',
                            intro: 'Esse cartão mostra a quandidade  de afiliados',
                            position: 'bottom'
                        },
                        {
                            element: '.referral-card',
                            intro: 'Para expandir sua rede, compartilhe seu link de afiliado aqui!',
                            position: 'bottom'
                        },
                        {
                            element: '.update-button',
                            intro: 'Clique para atualizar a tela!',
                            position: 'bottom'
                        },
                        // Adicionando os passos para a Tabbar
                        {
                            element: '.bottom-nav a:nth-child(1)', // Produtos
                            intro: 'Acesse aqui a página de produtos disponíveis.',
                            position: 'top'
                        },
                        {
                            element: '.bottom-nav a:nth-child(2)', // Carrinho
                            intro: 'Veja aqui os produtos no seu carrinho.',
                            position: 'top'
                        },
                        {
                            element: '.bottom-nav a:nth-child(3)', // Início
                            intro: 'Volte para a página inicial clicando aqui.',
                            position: 'top'
                        },
                        {
                            element: '.bottom-nav a:nth-child(4)', // Vendas
                            intro: 'Confira suas vendas e histórico nesta aba.',
                            position: 'top'
                        },
                        {
                            element: '.bottom-nav a:nth-child(5)', // Carteira
                            intro: 'Gerencie sua carteira e ganhos aqui.',
                            position: 'top'
                        }
                    ],
                    nextLabel: 'Próximo',
                    prevLabel: 'Anterior',
                    doneLabel: 'Concluir',
                    skipLabel: 'x',
                    tooltipPosition: 'auto', // Ajusta a posição da tooltip automaticamente
                    showProgress: true,     // Exibe o progresso do tutorial
                    showBullets: true,      // Mostra os indicadores de passos
                    scrollToElement: true   // Rola a tela para o elemento em destaque
                })
                .oncomplete(function() {
                    // Quando o usuário concluir o tutorial
                    localStorage.setItem('tutorialCompleted', 'true');
                })
                .onexit(function() {
                    // Mesmo se o usuário sair antes de concluir, marcamos como concluído
                    localStorage.setItem('tutorialCompleted', 'true');
                })
                .start();
          }
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada  
          $.getScript('js/qrcode.min.js');
          var nomeUsuario = localStorage.getItem('userName');
          if (nomeUsuario) {
            var nomes = nomeUsuario.trim().split(" ");
            var doisPrimeirosNomes = nomes.slice(0, 2).join(" ");
            $("#nomeUsuarioHome").html(doisPrimeirosNomes);
          }
          
          onDashboard();          
          buscarQtdeNotif();
          contarCarrinho();

          $('.abrir-popup').on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            app.popup.open('.popup-compartilhar');
            buscarLinkAfiliado();
          });
          $('#updateData').on('click', function () {
            location.reload();
          });
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM      
        },
      }
    },
    {
      path: "/equipe/",
      url: "equipe.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          listarEquipe();
          $.getScript('js/qrcode.min.js');
          // Abrir popup compartilhamento

          $('.abrir-popup').on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            app.popup.open('.popup-compartilhar');
            //buscarLinkAfiliado();
          });
          let zoomLevel = 1;
          const maxZoom = 1;  // Define o zoom máximo para o tamanho original da tela
          const minZoom = 0.5;  // Limite de zoom mínimo
          
          // Função para ajustar o nível de zoom
          function applyZoom() {
              $('#treeContainer').css('transform', `scale(${zoomLevel})`);
          }
          
          // Aumentar zoom
          $('#zoomIn').on('click', function () {
              if (zoomLevel < maxZoom) {
                  zoomLevel += 0.1;
                  applyZoom();
              }
          });
          
          // Diminuir zoom
          $('#zoomOut').on('click', function () {
              if (zoomLevel > minZoom) {
                  zoomLevel -= 0.1;
                  applyZoom();
              }
          });
          

        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/perfil/",
      url: "perfil.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          var nomeUsuario = localStorage.getItem('userName');
          var emailUsuario = localStorage.getItem('userEmail');

          $("#usuarioNome").html(nomeUsuario);
          $("#emailUsuario").html(emailUsuario);

          $('#sairAgora').on('click', function () {
            app.dialog.confirm('Deseja sair do aplicativo?', function () {
              fazerLogout();
              $("#menuPrincipal").hide("fast");
              $("#menuPrincipal").addClass("display-none");
              app.views.main.router.navigate("/login-view/");
            });
          });

        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/vendas/",
      url: "vendas.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").show("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          listarVendas();
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/vendas/",
      url: "vendas.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").show("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          listarVendas();
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/resumo-venda/",
      url: "resumo-venda.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada          
          detalhesVenda();
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/carteira/",
      url: "carteira.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          let isHidden = true;
          $('#balance-value').text('*****');        
          $('#toggle-visibility').click(function() {    
            if (isHidden) {
              $('#balance-value').text('0');
              $(this).attr('src', 'https://cdn-icons-png.flaticon.com/512/565/565655.png');
            } else {
              $('#balance-value').text('*****');
              $(this).attr('src', 'https://cdn-icons-png.flaticon.com/512/565/565654.png');
            }
            isHidden = !isHidden;
          });

        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/pedidos/",
      url: "pedidos.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").show("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          listarPedidos();
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/resumo-pedido/",
      url: "resumo-pedido.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").hide("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          detalhesPedido();

          
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: "/curso/",
      url: "curso.html",
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          listarCategoriasCurso();
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      },
    },
    {
      path: '/produtos/',
      url: 'produtos.html?v=' + versionApp,
      animate: false,
      on: {
        pageBeforeIn: async function (event, page) {
          clearLocalStorage();
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          // fazer algo antes da página ser exibida
          $("#menuPrincipal").show("fast");
          $("#menuPrincipal").removeClass("display-none");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          contarCarrinho();
          listarBanners();

          var swiper = new Swiper(".mySwiper", {
            slidesPerView: 1,
            spaceBetween: 30,
            autoplay: true,
            delay: 3000,
            loop: true,
            breakpoints: {
              50: {
                slidesPerView: 1,
                spaceBetween: 30
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 30
              },
              992: {
                slidesPerView: 3,
                spaceBetween: 30
              },
              1200: {
                slidesPerView: 4,
                spaceBetween: 30
              },
            }
          });


          listarCategorias();
          var swiper2 = new Swiper(".categorias", {
            slidesPerView: 3,
            spaceBetween: 10,
            breakpoints: {
              50: {
                slidesPerView: 3,
                spaceBetween: 10
              },
              640: {
                slidesPerView: 6,
                spaceBetween: 10
              },
              992: {
                slidesPerView: 8,
                spaceBetween: 10
              },
              1200: {
                slidesPerView: 12,
                spaceBetween: 10
              },
            }
          });      

          let searchTimeout; // Variável para armazenar o temporizador

          $(document).on("input", "#search", function () {
            clearTimeout(searchTimeout); 
            const searchQuery = $(this).val();
          
            searchTimeout = setTimeout(() => {
              if (searchQuery.length >= 3 || searchQuery.length < 1) {
                listarProdutos(searchQuery, null);
              }
            }, 1000); // Espera 1 segundo após a última digitação
          });
          

          listarProdutos();

        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/detalhes/',
      url: 'detalhes.html?v=' + versionApp,
      animate: false,
      on: {
        pageBeforeIn: function (event, page) {          
          // Adiciona o CSS dinamicamente
          var link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'css/detalhes.css?v=' + versionApp;
          document.head.appendChild(link);
            
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").hide("fast");

        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          $.getScript('js/qrcode.min.js');
          //$.getScript('js/detalhes.js');
          var produtoId = localStorage.getItem('produtoId');
          $("#idProduto").html(produtoId);
          buscarProduto(produtoId);

          $("#compartilharProduto").on('click', function () {
            console.log('teste');
            app.popup.open('.popup-compartilhar');
            buscarLinks(produtoId);
          });


          $("#back-button").on('click', function () {
            app.views.main.router.navigate("/produtos/");
          });
          
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/carrinho/',
      url: 'carrinho.html?v=' + versionApp,
      options: {
        transition: 'f7-push',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").hide("fast");
          localStorage.removeItem('enderecoDetalhes');
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada    
          // Funções para gerenciamento de modais
        $("#openAddressModal").on('click', function () {
          document.getElementById('addressModal').classList.remove('hidden');
        });
        $("#closeAddressModal").on('click', function () {
          document.getElementById('addressModal').classList.add('hidden');
        });
        $("#showNewAddressForm").on('click', function () {
          document.getElementById('addressModal').classList.add('hidden');
          document.getElementById('newAddressModal').classList.remove('hidden');
        });
        $(".closeNewAddressModal").on('click', function () {
          document.getElementById('newAddressModal').classList.add('hidden');
          document.getElementById('addressModal').classList.remove('hidden');
        });
        
          listarCarrinho();

          $("#esvaziar").on('click', function () {
            app.dialog.confirm('Tem certeza que quer esvaziar o carrinho?', '<strong>ESVAZIAR</strong>', function () {
              //Chamar a funçao que limpa o carrinho
              limparCarrinho();
            });
          });

          $("#btnDesconto").on('click', function () {
            var cupomDesconto = $("#cupomDesconto").val();
            if(cupomDesconto) {
              app.dialog.alert("Cupom inválido ou expirado", "Cupom");
            } else {
              app.dialog.alert("Digite um cupom de Desconto", "Cupom");
            }
          });

          //INICIO API CEP PARA ENDEREÇO DE NOVO CLIENTE
          $('#cepCliente').mask('00000-000');
          const cepInput = document.getElementById('cepCliente');
          const logradouroInput = document.getElementById('logradouroEndCliente');
          const bairroInput = document.getElementById('bairroEndCliente');
          const cidadeInput = document.getElementById('cidadeEndCliente');
          const estadoInput = document.getElementById('estadoEndCliente');

          cepInput.addEventListener('input', function () {
            const cep = cepInput.value.replace(/\D/g, '');

            if (cep.length === 8) {
              const validacep = /^[0-9]{8}$/;

              if (validacep.test(cep)) {
                cepEndereco(cep)
              } else {
                // Não faz nada se o CEP não estiver completo ou for inválido
              }
            }
          });
          //FIM API CEP PARA ENDEREÇO DE NOVO CLIENTE

          //INICIO API CEP PARA EDITAR ENDEREÇO
          $('#cepEdit').mask('00000-000');
          const cepEdit = document.getElementById('cepEdit');
          const logradouroEndEdit = document.getElementById('logradouroEndEdit');
          const bairroEndEdit = document.getElementById('bairroEndEdit');
          const cidadeEndEdit = document.getElementById('cidadeEndEdit');
          const estadoEndEdit = document.getElementById('estadoEndEdit');

          cepEdit.addEventListener('input', function () {
            const cep = cepEdit.value.replace(/\D/g, '');

            if (cep.length === 8) {
              const validacep = /^[0-9]{8}$/;

              if (validacep.test(cep)) {
                cepEnderecoEdit(cep)
              } else {
                // Não faz nada se o CEP não estiver completo ou for inválido
              }
            }
          });
          //FIM API CEP PARA EDITAR ENDEREÇO

          $('#salvarEndereco').on('click', function () {
            adicionarEndereco();
          });
          $('#salvarEnderecoEdit').on('click', function () {
            editarEndereco();
          });

          function obterFormaPagamentoSelecionada() {
            var formaPagamento = $("input[name='payment']:checked").val();
            console.log("Forma de pagamento selecionada:", formaPagamento);
            return formaPagamento;
          }

          $('#numeroCartao').mask('0000 0000 0000 0000');
          $('#dataExpiracao').mask('00/0000');
          $('#cvc').mask('000');

          $("#opcaoCartao").on("click", function () {
            document.getElementById('cartaoModal').classList.remove('hidden');
          });

          $("#closeCartaoModal").on("click", function () {
            document.getElementById('cartaoModal').classList.add('hidden');
            $("input[name='payment'][value='3']").prop("checked", true);
          });
          // Exemplo de uso ao clicar em um botão
          $(".finalizar-compra").on("click", function () {
            var formaPagamento = obterFormaPagamentoSelecionada();
            
            if (formaPagamento == 1) {
              var nomeTitular = $("#nomeTitular").val();
              var numeroCartao = $("#numeroCartao").val();
              var dataExpiracao = $("#dataExpiracao").val();
              var cvc = $("#cvc").val();

              // Validações dos campos
              if (!nomeTitular) {
                app.dialog.alert("Por favor, preencha o nome do titular.", "Erro!");
                return;
              }
              if (!numeroCartao || numeroCartao.length < 16) {
                app.dialog.alert("Por favor, insira um número de cartão válido com 16 dígitos.", "Erro!");
                return;
              }
              if (!dataExpiracao || !validarDataExpiracao(dataExpiracao)) {
                app.dialog.alert("Por favor, insira a data de expiração no formato MM/YYYY.", "Erro!");
                return;
              }
              if (!cvc || cvc.length < 3) {
                app.dialog.alert("Por favor, insira um código CVC válido de 3 dígitos.", "Erro!");
                return;
              }
            } else if (formaPagamento == 2) {
              formaPagamento = 2;
            } else if (formaPagamento == 3) {
              formaPagamento = 3;
            } else {
              app.dialog.alert("Forma de pagamento não selecionada.", "Erro!");
              return;
            }

            if (formaPagamento) {
              finalizarCompra(formaPagamento, nomeTitular, numeroCartao, dataExpiracao, cvc);
            }
          });

          $('#irCheckout').on('click', function () {
            var enderecoSelecionado = localStorage.getItem('enderecoDetalhes');
            if (enderecoSelecionado && enderecoSelecionado != null) {
              app.views.main.router.navigate("/checkout/");
            } else {              
              listarEnderecos();
              app.popup.open(".popup-enderecos");
            }
          });
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/notificacoes/',
      url: 'notificacoes.html?v=' + versionApp,
      options: {
        transition: 'f7-push',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").hide("fast");
          $("#menuPrincipal").addClass("display-none");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada   
          listarNotificacoes();   
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/offline/',
      url: 'offline.html?v=' + versionApp,
      options: {
        transition: 'f7-push',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          $("#menuPrincipal").hide("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada      
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/checkout/',
      url: 'checkout.html?v=' + versionApp,
      options: {
        transition: 'f7-push',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").hide("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          var method = '';
          listarCarrinhoCheckout();
          // fazer algo quando a página for inicializada 

          var clienteNome = localStorage.getItem('userName');
          var nomeElemento = document.getElementById("clienteNome");
          nomeElemento.innerHTML = clienteNome;

          var enderecoDetalhes = JSON.parse(localStorage.getItem('enderecoDetalhes'));

          // Atualiza o HTML com o endereço selecionado
          $('#enderecoRua').html(enderecoDetalhes.endEntregaRua);
          $('#enderecoNumero').html(enderecoDetalhes.endEntregaNumero);
          $('#enderecoComplemento').html(enderecoDetalhes.endEntregaComplemento);
          $('#enderecoBairro').html(enderecoDetalhes.endEntregaBairro);
          $('#enderecoCidade').html(enderecoDetalhes.endEntregaCidade);
          $('#enderecoEstado').html(enderecoDetalhes.endEntregaEstado);
          $('#enderecoCep').html(enderecoDetalhes.endEntregaCep);

          // Preselecionar o método de pagamento PIX
          var pixElement = $('.payment-method[data-method="pix"]');
          pixElement.addClass('active');

          // Exibir os detalhes de pagamento para PIX
          showPaymentDetails('pix');

          // Handle payment method selection
          $('.payment-method').on('click', function () {
            $('.payment-method').removeClass('active');
            $(this).addClass('active');

            method = $(this).data('method');
            showPaymentDetails(method);
          });

          function showPaymentDetails(method) {
            var paymentDetails = $('#payment-details');
            paymentDetails.empty();

            if (method === 'pix') {
              paymentDetails.append('<p>Por favor, utilize o QR Code gerado para realizar o pagamento via PIX.</p>');
            } else if (method === 'card') {
              paymentDetails.append(`
                              <div class="payment-container">
                                <input type="text" name="nomeTitular" id="nomeTitular" placeholder="Nome" style="text-transform: uppercase;">
                                <input type="text" name="numeroCartao" id="numeroCartao" placeholder="0000 0000 0000 0000">
                                <input type="text" name="dataExpiracao" id="dataExpiracao" placeholder="MM/AAAA">
                                <input type="text" name="cvc" id="cvc" placeholder="000">
                              </div>
                            `);
              $('#numeroCartao').mask('0000 0000 0000 0000');
              $('#dataExpiracao').mask('00/0000');
              $('#cvc').mask('000');
            } else if (method === 'boleto') {
              paymentDetails.append('<p>O boleto será gerado após a finalização da compra. Utilize-o para realizar o pagamento.</p>');
            }
          }

          // Clicou em finalizar compra
          $('#finalizarCompra').on('click', function () {
            var formaPagamento = '';
            
            if (method === "card") {
              formaPagamento = 1;
              var nomeTitular = $("#nomeTitular").val();
              var numeroCartao = $("#numeroCartao").val();
              var dataExpiracao = $("#dataExpiracao").val();
              var cvc = $("#cvc").val();

              // Validações dos campos
              if (!nomeTitular) {
                app.dialog.alert("Por favor, preencha o nome do titular.", "Erro!");
                return;
              }
              if (!numeroCartao || numeroCartao.length < 16) {
                app.dialog.alert("Por favor, insira um número de cartão válido com 16 dígitos.", "Erro!");
                return;
              }
              if (!dataExpiracao || !validarDataExpiracao(dataExpiracao)) {
                app.dialog.alert("Por favor, insira a data de expiração no formato MM/YYYY.", "Erro!");
                return;
              }
              if (!cvc || cvc.length < 3) {
                app.dialog.alert("Por favor, insira um código CVC válido de 3 dígitos.", "Erro!");
                return;
              }
            } else if (method === "boleto") {
              formaPagamento = 2;
            } else if (method === "pix" || method == '') {
              formaPagamento = 3;
            } else {
              app.dialog.alert("Forma de pagamento não selecionada.", "Erro!");
              return;
            }

            if (formaPagamento) {
              finalizarCompra(formaPagamento, nomeTitular, numeroCartao, dataExpiracao, cvc);
            }
          });

        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/pagamento/',
      url: 'pagamento.html?v=' + versionApp,
      options: {
        transition: 'f7-push',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").hide("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // Recuperar do localStorage
          var pagamentoData = localStorage.getItem('pagamentoData');
          var clienteNome = localStorage.getItem('userName');
          
          if (pagamentoData) {
            // Exemplo de dados JSON para o pagamento
            var data = JSON.parse(pagamentoData);
        
            // Inicializa a variável status
            var status = '';

            // Verifica o valor de status_compra e define o status correspondente
            if (data.status_compra == 3 ) {
              status = 'Autorizado';
            } else {
              status = 'Não Autorizado';
            }
            totalCompra
            // Função para criar o conteúdo dinâmico
            function criarConteudoPagamento(data) {
              var formaSelecionada = data.formaSelecionada;   
              var totalCompra = document.getElementById('totalCompra');
              totalCompra.innerHTML = `${formatarMoeda(data.valorTotal)}`;
              
              if (formaSelecionada == 1) {
                $("#cartao-section").removeClass("display-none");
                var cartaoDetalhes = document.getElementById('cartao-detalhes');
                
                cartaoDetalhes.innerHTML = `
                    <div class="cartao-info-item">
                      <span class="label">Status do Pagamento:</span>
                      <p>${status}</p>
                    </div>
                    <div class="cartao-info-item">
                      <span class="label">Bandeira:</span>
                      <input type="text" id="bandeiraCartao" value="${data.bandeira}" readonly />
                    </div>
                    <div class="cartao-info-item">
                      <span class="label">Número do Cartão:</span>
                      <input type="text" id="numeroCartao" value="${data.cartao_numero}" readonly />
                    </div>
                    <div class="cartao-info-item">
                      <span class="label">Nome no Titular:</span>
                      <input type="text" id="nomeCartao" value="${data.nome_cartao}" readonly />
                    </div>
                    <div class="cartao-info-item">
                      <span class="label">Mensagem:</span>
                      <p>${data.status_mensagem}</p>
                    </div>
                `;
                if (data.status_compra != 3 ) {
                  $("#btnAlterarPagamento").removeClass("display-none");                   
                  $("#instrucao-cartao").removeClass("display-none");              
                  localStorage.setItem('pgtoPedidoId', data.pedidoId);
                } else {
                  localStorage.removeItem('pgtoPedidoId');
                }

                $("#meusPedidos").removeClass("display-none");             
                
                $("#meusPedidos").on("click", function () {
                  app.views.main.router.navigate('/pedidos/');
                });
        
              } else if (formaSelecionada == 2) {
                $("#boleto-section").removeClass("display-none");
                $("#instrucao-boleto").removeClass("display-none");
                $("#btnAlterarPagamento").removeClass("display-none");  
                $("#meusPedidos").removeClass("display-none");             
                
                $("#meusPedidos").on("click", function () {
                  app.views.main.router.navigate('/pedidos/');
                });   
                
                var codigoBoleto = document.getElementById('boleto-code');                
                codigoBoleto.innerHTML = `${data.linhaDigitavel}`;
        
                // Copiar linha digitável
                
              $('#copiarLinha').on('click', function () {                
                copiarParaAreaDeTransferencia(data.linhaDigitavel);
              });
        
                // Baixar boleto
                $('#baixarBoleto').on('click', function () {   
                  app.dialog.confirm('Deseja baixar o boleto no navegador?', function () {
                    var ref = cordova.InAppBrowser.open(data.linkBoleto, '_system', 'location=no,zoom=no');
                    ref.show();
                  });
                });
        
              } else if (formaSelecionada == 3) {
                $("#pix-section").removeClass("display-none");
                $("#instrucao-pix").removeClass("display-none");
                $("#btnAlterarPagamento").removeClass("display-none");   
                $("#meusPedidos").removeClass("display-none");             
                
                $("#meusPedidos").on("click", function () {
                  app.views.main.router.navigate('/pedidos/');
                });  
                var pixQrcode = document.getElementById('pix-qrcode');
                var pixCodigo = document.getElementById('pix-code');

                pixQrcode.innerHTML = `<img src="${data.qrCodePix}" alt="QR Code Pix" id="qrCodePix" width="180px" />`;
                pixCodigo.innerHTML = `${data.pixKey}`;
                       
                // Copiar código Pix
                $('#copiarPix').on('click', function () {   
                  copiarParaAreaDeTransferencia(data.pixKey);
                });
              }
        
            }
        
            // Inicializar o conteúdo do pagamento
            criarConteudoPagamento(data);

          }
          
          $('#btnAlterarPagamento').on('click', function () {   
            app.views.main.router.navigate('/refazer-pagamento/');
          });
          
        },
        
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },    
    {
      path: '/home/',
      url: 'home.html?v=' + versionApp,
      animate: false,
      on: {
        pageBeforeIn: async function (event, page) {
          clearLocalStorage();
          // Início função validar login
          const isValid = await validarToken();
          if (!isValid) {
            window.location.reload(true);
          }
          // fazer algo antes da página ser exibida
          $("#menuPrincipal").show("fast");
          $("#menuPrincipal").removeClass("display-none");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          contarCarrinho();
          carregarCategoriasCampanha();
          listarCampanhas();

          // Adiciona eventos aos filtros de categoria
          $('.category-pill').on('click', function() {
            $('.category-pill').removeClass('active');
            $(this).addClass('active');
            
            const categoria = $(this).attr('data-category');
            listarCampanhas(categoria);
          });
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/refazer-pagamento/',
      url: 'refazer-pagamento.html?v=' + versionApp,
      options: {
        transition: 'f7-push',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          userAuthToken = getCookie('userAuthToken'); // Lê o token do cookie
          // Início função validar login
          const isValid = validarToken();
          if (!isValid) {
            console.warn("Token inválido. Redirecionando para login via fallback.");
            deleteCookie('userAuthToken');
            app.views.main.router.navigate("/login-view/");
            setTimeout(() => {
              app.views.main.router.navigate("/login-view/");
            }, 500); // Adiciona um fallback com pequeno delay
          }
          $("#menuPrincipal").hide("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada 

          // Preselecionar o método de pagamento PIX
          var pixElement = $('.payment-method[data-method="pix"]');
          pixElement.addClass('active');

          // Exibir os detalhes de pagamento para PIX
          onShowPaymentDetails('pix');

          // Handle payment method selection
          $('.payment-method').on('click', function () {
            $('.payment-method').removeClass('active');
            $(this).addClass('active');

            method = $(this).data('method');
            onShowPaymentDetails(method);
          });

          function onShowPaymentDetails(method) {
            var repaymentDetails = $('#repayment-details');
            repaymentDetails.empty();

            if (method === 'pix') {
              repaymentDetails.append('<p>Por favor, utilize o QR Code gerado para realizar o pagamento via PIX.</p>');
            } else if (method === 'card') {
              repaymentDetails.append(`
                              <div class="payment-container">
                                <input type="text" name="nomeTitularRe" id="nomeTitularRe" placeholder="Nome">
                                <input type="text" name="numeroCartaoRe" id="numeroCartaoRe" placeholder="0000 0000 0000 0000">
                                <input type="text" name="dataExpiracaoRe" id="dataExpiracaoRe" placeholder="DD/AAAA">
                                <input type="text" name="cvcRe" id="cvcRe" placeholder="000">
                              </div>
                            `);
              $('#numeroCartaoRe').mask('0000 0000 0000 0000');
              $('#dataExpiracaoRe').mask('00/0000');
              $('#cvcRe').mask('000');
            } else if (method === 'boleto') {
              repaymentDetails.append('<p>O boleto será gerado após a finalização da compra. Utilize-o para realizar o pagamento.</p>');
            }
          }


          // Clicou em finalizar compra
          $('#refazerPagamento').on('click', function () {
            var formaPagamento = '';
            if (method === "card") {
              formaPagamento = 1;
              var nomeTitularRe = $("#nomeTitularRe").val();
              var numeroCartaoRe = $("#numeroCartaoRe").val();
              var dataExpiracaoRe = $("#dataExpiracaoRe").val();
              var cvcRe = $("#cvcRe").val();
            } else if (method === "boleto") {
              formaPagamento = 2;

            } else if (method === "pix" || method == '') {
              formaPagamento = 3;

            } else {
              app.dialog.alert("Forma de pagamento não selecionada. ", "Erro!");
            }

            if (formaPagamento) {
              refazerPagamento(formaPagamento, nomeTitularRe, numeroCartaoRe, dataExpiracaoRe, cvcRe);
            }
          });

        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
  ],
  // Outros parametros aqui

  view: {
    animate: false, // Disable animations for view transitions
    iosDynamicNavbar: false, // Disable dynamic navbar animations for iOS
    stackPages: true, // To prevent reloading pages, useful if still facing issues
  },

});

//Para testes direto no navegador
//var mainView = app.views.create('.view-main', { url: '/index/' });


//EVENTO PARA SABER O ITEM DO MENU ATUAL
app.on('routeChange', function (route) {
  var currentRoute = route.url;
  document.querySelectorAll('.tab-link').forEach(function (el) {
    el.classList.remove('active');
  });
  var targetEl = document.querySelector('.tab-link[href="' + currentRoute + '"]');
  if (targetEl) {
    targetEl.classList.add('active');
  }
});

function onDeviceReady() {
  //Quando estiver rodando no celular
  var mainView = app.views.create('.view-main', { url: '/index/' });

  //COMANDO PARA "OUVIR" O BOTAO VOLTAR NATIVO DO ANDROID 	
  document.addEventListener("backbutton", function (e) {

    if (mainView.router.currentRoute.path === '/index/') {
      e.preventDefault();
      app.dialog.confirm('Deseja sair do aplicativo?', function () {
        navigator.app.exitApp();
      });
    } else {
      e.preventDefault();
      mainView.router.back({ force: true });
    }
  }, false);

  let deferredPrompt;

  /* Capturar o evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (event) => {
      // Prevenir o comportamento padrão
      event.preventDefault();
      deferredPrompt = event;

      
      $("#instalation-app").removeClass("display-none");
    
      //AÇÃO DOS BOTÕES
      $("#btnNaoInstalar").on("click", function () {
        $("#instalation-app").addClass("display-none");
        console.log('Usuário cancelou a instalação.');
      });
      $("#btnInstalar").on("click", function () {
        $("#instalation-app").addClass("display-none");
        // Usuário clicou em "Confirmar"
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuário aceitou a instalação.');
                } else {
                    console.log('Usuário rejeitou a instalação.');
                }
                deferredPrompt = null;
            });
        }
      });
  });

  // Verificar se o PWA já está instalado
  window.addEventListener('appinstalled', () => {
      console.log('PWA instalado.');
      // Esconder a mensagem se o PWA estiver instalado
      $('#installPrompt').hide();
  });
  */
}

// Bloquear o menu de contexto no clique com o botão direito
document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
});
// Bloquear o menu de em imagens e links
document.querySelectorAll('img, a').forEach(function (element) {
  element.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });
});
//Fim dos bloqueios do menu contexto

// Bloqueia Ctrl + Scroll
window.addEventListener('wheel', function(e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// Bloqueia Ctrl + '+' ou '-'
window.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
    e.preventDefault();
  }

  // Também bloqueia Ctrl + 0 (reset zoom)
  if ((e.ctrlKey || e.metaKey) && e.key === '0') {
    e.preventDefault();
  }
});