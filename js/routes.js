//DADOS BACKEND SERVER
const apiServerUrl = "https://escritorio.g3pay.com.br/rest.php";
const versionApp = "1.0";

//INICIALIZAÇÃO DO F7 QUANDO DISPOSITIVO ESTÁ PRONTO
document.addEventListener('deviceready', onDeviceReady, false);
var app = new Framework7({
  // App root element
  el: '#app',
  // App Name
  name: 'G3 Pay',
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
      url: 'index.html',
      on: {
        pageBeforeIn: async function (event, page) {       
          clearLocalStorage();
          // chama a função que verifica e valida o token
          var userAuthToken = localStorage.getItem('userAuthToken');
          // Início função validar login
          const isValid = await validarToken(userAuthToken);
          if (!isValid) {
            app.views.main.router.navigate("/login-view/");
          } else {
            // Lógica para continuar usando o token
            app.views.main.router.navigate("/home/");
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
            <p>Adicione <strong>o aplicativo G3 Pay</strong> à sua tela inicial para obter atualizações regulares. Toque em Compartilhar 
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
            <p>Instale <strong>o aplicativo G3 Pay</strong> para obter atualizações regulares. É rápido e ocupa menos armazenamento</p>
            <div class="display-flex flex-direction-row justify-content-space-between">
                <button id="fecharInstall" class="button margin-right text-color-gray">Depois</button>
                <button id="installAppAndroid" class="button button-fill color-red"><span class="mdi mdi-cellphone-arrow-down-variant"></span> Instalar</button>
            </div>`;
          } else {
            // Ações para desktop ou plataformas desconhecidas
            if (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches) {
              conteudoInstall.innerHTML = `
              <p>Instale <strong>o aplicativo G3 Pay</strong> para obter atualizações regulares. É rápido e ocupa menos armazenamento</p>
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
      url: "splash-view.html",
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
      url: "login-view.html",
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

          //START AÇÃO BOTÃO ENTRAR
          $("#signIn").on("click", function () {
            app.dialog.preloader("Carregando...");
            //START OBTER VALORES DO LOGIN
            var userName = $("#userName").val();
            var userPassword = $("#userPassword").val();
            //END OBTER VALORES DO LOGIN

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
              fetch('https://escritorio.g3pay.com.br/api/auth_app.php', {
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
                    const token = data.data;
                    localStorage.setItem('userAuthToken', token);
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

                    setTimeout(function () {
                      app.dialog.close();
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
          //END AÇÃO BOTÃO ENTRAR

          //START BOTÃO RECUPERAR SENHA
          $("#forgotPassword").on("click", function () {
            app.dialog.prompt(
              "Informe o e-mail de login",
              "<b>SEU EMAIL DE LOGIN</b>",
              function (email) {
                app.dialog.preloader("Carregando...");

              //START Fazendo a requisição
                fetch('https://escritorio.g3pay.com.br/api/request_reset.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email
                    })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.status == 'success' && data.data.status == 'success') {
                    localStorage.setItem("emailRecuperacao", email);
                      app.dialog.close();
                      app.views.main.router.navigate("/validar-codigo/");
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
              }
            );
          });
          //END BOTÃO RECUPERAR SENHA

          //START BOTÃO VALIDAR CODIGO
          $("#confirmarCodigo").on("click", function () {
            var emailRecuperacao = localStorage.getItem("emailRecuperacao");

            document.querySelectorAll('.code').forEach((input, index) => {
              input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < 5) {
                  document.querySelector(`.code[data-index="${index + 1}"]`).focus();
                }
              });
        
              input.addEventListener('keydown', (e) => {
                if (e.key === "Backspace" && index > 0 && e.target.value === "") {
                  document.querySelector(`.code[data-index="${index - 1}"]`).focus();
                }
              });
            });
            
            const code = Array.from(document.querySelectorAll('.code')).map(input => input.value).join('');

            if (code.length === 6) {            

              const headers = {
                "Content-Type": "application/json"
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
  
              fetch('https://escritorio.g3pay.com.br/api/validate_code.php', options)
                .then((response) => response.json())
                .then((data) => {
                  app.dialog.close();
                  if (data.status == 'success' && data.data.status == 'success') {
                    localStorage.setItem("codigoRecuperacao", code);
  
                    app.popup.open(".popup-redefinir-senha");
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
              return('Por favor, insira todos os 6 dígitos do código.');
            }


          });
          //END BOTÃO VALIDAR CODIGO

          //START BOTÃO SALVAR SENHA
          $("#salvarSenha").on("click", function () {
            var emailRecuperacao = localStorage.getItem("emailRecuperacao");
            var codigoRecuperacao = localStorage.getItem("codigoRecuperacao");
            // Obtenha os valores dos campos de senha
            var novaSenha = $("#novaSenha").val();
            var reNovaSenha = $("#reNovaSenha").val();

            // Verifique se as senhas conferem
            if (novaSenha !== reNovaSenha) {
              app.dialog.alert('As senhas não conferem. Por favor, verifique.');
              return;
            }

            // Verifique se as senhas têm no mínimo 8 caracteres
            if (novaSenha.length < 8) {
              app.dialog.alert('A senha deve ter no mínimo 8 caracteres.');
              return;
            }

            const apiServerUrl = apiServer + "salvar_senha.php";

            const headers = {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + appId,
            };

            const body = JSON.stringify({
              email: emailRecuperacao,
              codigo: codigoRecuperacao,
              senha: novaSenha,
            });

            const options = {
              method: "POST",
              headers: headers,
              body: body,
            };

            fetch(apiServerUrl, options)
              .then((response) => response.json())
              .then((data) => {
                app.dialog.close();
                if (data.message == true) {
                  app.popup.close(".popup-nova-senha");
                  app.dialog.alert(
                    "Sucesso, Senha alterada com sucesso, faça o Login.",
                    '<i class="mdi mdi-alert"></i> Sucesso'
                  );
                } else {
                  app.dialog.close();
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
                  "Erro, Código informado invalido ou expirado.",
                  '<i class="mdi mdi-alert"></i> Código Inválido'
                );
              });

          });
          localStorage.removeItem("emailRecuperacao");
          localStorage.removeItem("codigoRecuperacao");
          //END BOTÃO SALVAR SENHA

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
      path: '/validar-codigo/',
      url: 'validar-codigo.html',
      animate: false,
      on: {
        pageBeforeIn: async function (event, page) {
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
      path: '/home/',
      url: 'home.html',
      animate: false,
      on: {
        pageBeforeIn: async function (event, page) {
          clearLocalStorage();
          var userAuthToken = localStorage.getItem('userAuthToken');
          // Início função validar login
          const isValid = await validarToken(userAuthToken);
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
          OneSignal.Notifications.requestPermission();

          // fazer algo quando a página for inicializada  
          $.getScript('js/qrcode.min.js');
          onDashboard();

          $('.abrir-popup').on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            app.popup.open('.popup-compartilhar');
            buscarLinkAfiliado();
          });
          $('#updateData').on('click', function () {
            location.reload();
          });
          /*
                    var ctx = document.getElementById('revenueChart').getContext('2d');
                    var revenueChart = new Chart(ctx, {
                      type: 'line',
                      data: {
                        labels: ['Ago. 2021', 'Set. 2021', 'Out. 2021', 'Nov. 2021', 'Dez. 2021', 'Jan. 2022', 'Fev. 2022', 'Mar. 2022', 'Abr. 2022', 'Mai. 2022', 'Jun. 2022', 'Jul. 2022'],
                        datasets: [{
                          label: 'Receita',
                          data: [0, 5000, 10000, 7500, 12500, 15000, 13000, 15000, 16000, 10000, 14000, 15000],
                          borderColor: '#6b46c1',
                          borderWidth: 2,
                          fill: false
                        }]
                      },
                      options: {
                        scales: {
                          x: {
                            display: true
                          },
                          y: {
                            display: true
                          }
                        }
                      }
                    });
                    */
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
              localStorage.clear();
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
          $("#menuPrincipal").show("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          //listarVendas();
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
      url: 'produtos.html',
      animate: false,
      on: {
        pageBeforeIn: async function (event, page) {
          clearLocalStorage();
          var userAuthToken = localStorage.getItem('userAuthToken');
          // Início função validar login
          const isValid = await validarToken(userAuthToken);
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

          $(document).on("input", "#search", function () {
            const searchQuery = $(this).val();
            if (searchQuery.length >= 3) {
              listarProdutos(searchQuery);
            }
            if (searchQuery.length < 1) {
              listarProdutos(searchQuery);
            }
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
      url: 'detalhes.html',
      animate: false,
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
          $.getScript('js/qrcode.min.js');
          $.getScript('js/detalhes.js');
          var produtoId = localStorage.getItem('produtoId');
          // Supondo que o item já esteja salvo no localStorage com a chave 'produto'
          let itemSalvo = localStorage.getItem('produto');
          // Converte o JSON de volta para um objeto JavaScript
          let produto = JSON.parse(itemSalvo);
          let preco = produto.preco;
          let preco_lojavirtual = produto.preco_lojavirtual;

          let isCompra = true;
          let isVenda = true;
          $('#valor-compra').text('R$ ****');    
          $('#valor-venda').text('R$ ****');       
          $('#toggle-compra').click(function() {    
            if (isCompra) {
              $('#valor-compra').text(formatarMoeda(preco));
              $(this).attr('src', 'https://cdn-icons-png.flaticon.com/512/565/565655.png');
            } else {
              $('#valor-compra').text('R$ ****');
              $(this).attr('src', 'https://cdn-icons-png.flaticon.com/512/565/565654.png');
            }
            isCompra = !isCompra;
          });
          $('#toggle-venda').click(function() {    
            if (isVenda) {
              $('#valor-venda').text(formatarMoeda(preco_lojavirtual));
              $(this).attr('src', 'https://cdn-icons-png.flaticon.com/512/565/565655.png');
            } else {
              $('#valor-venda').text('R$ ****');
              $(this).attr('src', 'https://cdn-icons-png.flaticon.com/512/565/565654.png');
            }
            isVenda = !isVenda;
          });
          
          $('#shareButton').on('click', function () {
            // Defina o conteúdo HTML que você deseja converter em PDF
            let htmlContent = `
                
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; }
                        p { font-size: 14px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h1>Resumo do Pedido</h1>
                    <p>Detalhes do pedido...</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantidade</th>
                                <th>Preço</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Produto 1</td>
                                <td>2</td>
                                <td>R$ 50,00</td>
                            </tr>
                            <tr>
                                <td>Produto 2</td>
                                <td>1</td>
                                <td>R$ 30,00</td>
                            </tr>
                        </tbody>
                    </table>
                    <p>Total: R$ 130,00</p>
                </body>
            </html>
            `;

            // Opções para o PDF
            let options = {
              documentSize: 'A4',
              type: 'base64'
            };

            // Gera o PDF a partir do HTML
            pdf.fromData(htmlContent, options)
              .then(function (base64) {
                // Salva o PDF no sistema de arquivos
                let filePath = cordova.file.cacheDirectory + 'order-summary.pdf';
                let pdfBlob = base64ToBlob(base64, 'application/pdf');

                window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function (dir) {
                  dir.getFile('order-summary.pdf', { create: true }, function (file) {
                    file.createWriter(function (fileWriter) {
                      fileWriter.write(pdfBlob);

                      fileWriter.onwriteend = function () {
                        // Compartilha o PDF usando o plugin de compartilhamento
                        window.plugins.socialsharing.share(null, 'Resumo do Pedido', filePath, null);
                      };

                      fileWriter.onerror = function (e) {
                        console.error('Erro ao gravar o arquivo: ' + e.toString());
                      };
                    });
                  });
                });
              })
              .catch(function (err) {
                console.error('Erro ao gerar o PDF: ' + err.toString());
              });
          });
          // Função para converter base64 para Blob
          function base64ToBlob(base64, contentType) {
            const byteCharacters = atob(base64);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
              const slice = byteCharacters.slice(offset, offset + 512);
              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }

            return new Blob(byteArrays, { type: contentType });
          }
          // JavaScript to open popup
          document.querySelector('.abrir-popup').addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            app.popup.open('.popup-compartilhar');
            buscarLinks(produtoId);
          });
          document.querySelector('#compartilharBtn').addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            app.popup.open('.popup-compartilhar');
            buscarLinks(produtoId);
          });

          
          
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/carrinho/',
      url: 'carrinho.html',
      options: {
        transition: 'f7-push',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          $("#menuPrincipal").hide("fast");
          localStorage.removeItem('enderecoDetalhes');
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada    
          listarCarrinho();

          $("#btnSelecionarEndereco").on('click', function () {
            listarEnderecos();
            app.popup.open(".popup-enderecos");
          });

          $("#esvaziar").on('click', function () {
            app.dialog.confirm('Tem certeza que quer esvaziar o carrinho?', '<strong>ESVAZIAR</strong>', function () {
              //Chamar a funçao que limpa o carrinho
              limparCarrinho();
            });
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

          $('#salvarEndereco').on('click', function () {
            console.log('tessdsdte');
            adicionarEndereco();
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
      path: '/offline/',
      url: 'offline.html',
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
      url: 'checkout.html',
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

          // Recupera o valor do localStorage com a chave 'carrinho'
          // Converte o JSON para um objeto JavaScript
          var ulElemento = document.getElementById("listaItensConfirmation");
          /*
          carrinho.forEach((item, index) => {
            const itensHTML = `            
                          <li>
                              <a href="#" class="item-link item-content">
                                 <div class="item-media"><img src="${item.item.imagem}" width="40px" ></i></div>
                                 <div class="item-inner">
                                    <div class="item-title">
                                       <div class="item-header"><b>${item.item.nome}</b></div>
                                       <small>${item.quantidade} x ${formatarMoeda(item.item.preco)}</small>
                                    </div>
                                    <div class="item-after"><b>${formatarMoeda(item.total_item)}</b></div>
                                 </div>
                              </a>
                           </li>
                          `;
            ulElemento.innerHTML += itensHTML;
          });*/

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
      url: 'pagamento.html',
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
      path: '/refazer-pagamento/',
      url: 'refazer-pagamento.html',
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

