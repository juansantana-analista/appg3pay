//DADOS BACKEND SERVER
const apiServerUrl = "https://escritorio.g3pay.com.br/rest.php";
const appId = "Basic 50119e057567b086d83fe5dd18336042ff2cf7bef3c24807bc55e34dbe5a";
const versionApp = "1.0";
var userAuthToken = '';
//INCLUIR ARQUIVO FUNÇÕES.

$.getScript('js/funcoes.js', function() {

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
          //clearLocalStorage();
          // chama a função que verifica e valida o token
          const userAuthToken = localStorage.getItem('userAuthToken');
          // Início função validar login
          const isValid = await validarToken(userAuthToken);
          if (!isValid) {
            app.views.main.router.navigate("/login-view/");
          } else {
            // Lógica para continuar usando o token
            app.views.main.router.navigate("/home/");
          }
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

            if (userName == "" || userPassword == "") {
              app.dialog.close();
              app.dialog.alert(
                "Por favor, preencha seu Usuário e Senha.",
                '<i class="mdi mdi-alert"></i> Campos Vazios'
              );
            } else {
              // Cabeçalhos da requisição
              const headers = {
                "Content-Type": "application/json",
                "Authorization": appId,
              };

              const body = JSON.stringify({
                class: "ApplicationAuthenticationRestService",
                method: "getToken",
                login: userName,
                password: userPassword
              });

              // Opções da requisição
              const options = {
                method: "POST",
                headers: headers,
                body: body,
              };

              //START Fazendo a requisição
              fetch(apiServerUrl, options)
                .then((response) => response.json())
                .then((data) => {
                  if (data.data) {
                    const token = data.data;
                    localStorage.setItem('userAuthToken', token);
                    userAuthToken = token;
                    const decodedToken = jwt_decode(token);
                    // Navegar para outra página ou realizar outras ações necessárias

                    localStorage.setItem("user", decodedToken.user);
                    localStorage.setItem("userId", decodedToken.userid);
                    localStorage.setItem("userName", decodedToken.username);
                    localStorage.setItem("userEmail", decodedToken.usermail);
                    localStorage.setItem("pessoaId", decodedToken.pessoa_id);
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
                .catch((error) => {
                  app.dialog.close();
                  // Manipule os erros aqui
                  console.error("Erro:", error);
                });
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
                localStorage.setItem("emailRecuperacao", email);

                app.dialog.preloader("Carregando...");

                const apiServerUrl = apiServer + "gerar_codigo.php";

                const headers = {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + appId,
                };

                const body = JSON.stringify({
                  email: email,
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
                      app.popup.open(".popup-recuperar-senha");
                      app.dialog.alert(
                        "Sucesso, um código foi enviado ao email informado.",
                        '<i class="mdi mdi-alert"></i> Código Enviado'
                      );
                    } else {
                      app.dialog.alert(data.message); // Exibe a mensagem da API
                    }
                  })
                  .catch((error) => {
                    console.error("Erro:", error);
                    app.dialog.close();
                    app.dialog.alert(
                      "Erro ao tentar recuperar a senha: " + error.message
                    );
                  });
              }
            );
          });
          //END BOTÃO RECUPERAR SENHA

          //START BOTÃO REDEFINIR SENHA PROXIMO PASSO
          $("#redefinirSenha").on("click", function () {
            var emailRecuperacao = localStorage.getItem("emailRecuperacao");
            var codigoRecebidoInserido = $("#codigoRecebido").val();

            const apiServerUrl = apiServer + "verificar_codigo.php";

            const headers = {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + appId,
            };

            const body = JSON.stringify({
              email: emailRecuperacao,
              codigo: codigoRecebidoInserido,
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
                  localStorage.setItem("codigoRecuperacao", codigoRecebidoInserido);

                  app.popup.open(".popup-nova-senha");
                  app.popup.close(".popup-recuperar-senha");
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

          });
          //END BOTÃO REDEFINIR SENHA PROXIMO PASSO

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
      path: '/home/',
      url: 'home.html',
      animate: false,
      on: {
        pageBeforeIn: async function (event, page) {
          //clearLocalStorage();
          userAuthToken = localStorage.getItem('userAuthToken');
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
          $.getScript('js/qrcode.min.js');

          $('.abrir-popup').on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            app.popup.open('.popup-compartilhar');
            buscarLinkAfiliado();
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
          $.getScript('js/qrcode.min.js');
          // Abrir popup compartilhamento

          $('.abrir-popup').on('click', function (e) {
            e.preventDefault(); // Prevent default link behavior
            app.popup.open('.popup-compartilhar');
            //buscarLinkAfiliado();
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
          //listarPedidos();
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
          ////clearLocalStorage();
          userAuthToken = localStorage.getItem('userAuthToken');
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
          $('#irCheckout').on('click', function () {
            var enderecoSelecionado = localStorage.getItem('enderecoDetalhes');
            if(enderecoSelecionado && enderecoSelecionado != null){              
              app.views.main.router.navigate("/checkout/");
            } else {              
              app.dialog.alert("Por favor selecione um endereço de entrega. ", "Erro!");
            }
          });
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/teste/',
      url: 'teste.html',
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
          $('#irCheckout').on('click', function () {
            app.views.main.router.navigate("/checkout/");
          });
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
                                <input type="text" name="nomeTitular" id="nomeTitular" placeholder="Nome">
                                <input type="text" name="numeroCartao" id="numeroCartao" placeholder="0000 0000 0000 0000">
                                <input type="text" name="dataExpiracao" id="dataExpiracao" placeholder="DD/AAAA">
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
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                  .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                  })
                  .then(data => {
                    if (!data.erro) {
                      logradouroInput.value = data.logradouro;
                      bairroInput.value = data.bairro;
                      cidadeInput.value = data.localidade;
                      estadoInput.value = data.uf;
                      // Remover a classe display-none para exibir os campos preenchidos
                      document.getElementById('divLogradouroCliente').classList.remove('display-none');
                      document.getElementById('divNumeroCliente').classList.remove('display-none');
                      document.getElementById('divBairroCliente').classList.remove('display-none');
                      document.getElementById('divCidadeCliente').classList.remove('display-none');
                      document.getElementById('divEstadoCliente').classList.remove('display-none');
                    } else {
                      app.dialog.alert("Erro ao buscar o CEP: ", "CEP não encontrado!");
                      cepInput.value = "";
                      logradouroInput.value = "";
                      bairroInput.value = "";
                      cidadeInput.value = "";
                      estadoInput.value = "";
                    }
                  })
                  .catch(error => {
                    app.dialog.alert("Erro ao buscar o CEP: " + (error), "CEP Inválido!");
                    cepInput.value = "";
                    logradouroInput.value = "";
                    bairroInput.value = "";
                    cidadeInput.value = "";
                    estadoInput.value = "";
                  });
              } else {
                // Não faz nada se o CEP não estiver completo ou for inválido
              }
            }
          });
          //FIM API CEP PARA ENDEREÇO DE NOVO CLIENTE


          // Clicou em finalizar compra
          $('#finalizarCompra').on('click', function () {
            var formaPagamento = '';
            if (method === "card") {
              formaPagamento = 1;
              var nomeTitular = $("#nomeTitular").val();
              var numeroCartao = $("#numeroCartao").val();
              var dataExpiracao = $("#dataExpiracao").val();
              var cvc = $("#cvc").val();
            } else if (method === "boleto") {
              formaPagamento = 2;

            } else if (method === "pix") {
              formaPagamento = 3;

            } else {
              app.dialog.alert("Forma de pagamento não selecionada. ", "Erro!");
            }

            if (formaPagamento) {
              finalizarCompra(formaPagamento);
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

            // Função para criar o conteúdo dinâmico
            function criarConteudoPagamento(data) {
              var pagamentoBody = document.getElementById('pagamentoBody');
              var pagamentoButtons = document.getElementById('pagamentoButtons');
              var formaSelecionada = data.formaSelecionada;
              var formaPagamento = '';

              pagamentoBody.innerHTML = '';
              pagamentoButtons.innerHTML = '';

              if (formaSelecionada == 1) {
                formaPagamento = 'Cartão';
                pagamentoBody.innerHTML = `
                  <div class="cartao-info">
                    <div class="cartao-info-item">
                      <span class="label">Bandeira:</span>
                      <input type="text" id="bandeiraCartao" />
                    </div>
                    <div class="cartao-info-item">
                      <span class="label">Número do Cartão:</span>
                      <input type="text" id="numeroCartao" />
                    </div>
                    <div class="cartao-info-item">
                      <span class="label">Nome no Titular:</span>
                      <input type="text" id="nomeCartao" />
                    </div>
                    <div class="cartao-info-item">
                      <span class="label">Data de Validade:</span>
                      <input type="text" id="validadeCartao" />
                    </div>
                  </div>
                `;
                pagamentoButtons.innerHTML = `
                  <button class="button button-fill color-green margin-bottom margin-top" id="confirmarCartao"><span class="mdi mdi-credit-card"></span> Confirmar Pagamento</button>
                `;
            
                document.getElementById('confirmarCartao').addEventListener('click', function () {
                  confirmarPagamentoCartao();
                });
            
              } else if (formaSelecionada == 2) {
                formaPagamento = 'Boleto';
                pagamentoBody.innerHTML = `
                <div class="linha-digitavel" id="linhaDigitavel">${data.linhaDigitavel}</div>
                <div class="boleto-info">
                  <div class="boleto-info-item">
                    <span class="label">Vencimento:</span>
                    <span class="value" id="dataVencimento">${data.dataVencimento}</span>
                  </div>
                  <div class="boleto-info-item">
                    <span class="label">Valor:</span>
                    <span class="value" id="valorTotal">${data.valorTotal}</span>
                  </div>
                  <div class="boleto-info-item">
                    <span class="label">Beneficiário:</span>
                    <span class="value">G3 Pay</span>
                  </div>
                  <div class="boleto-info-item">
                    <span class="label">Pagador:</span>
                    <span class="value" id="clienteNome">${clienteNome}</span>
                  </div>
                </div>
              `;
                pagamentoButtons.innerHTML = `
                <button class="button button-fill color-green margin-bottom margin-top" id="copiarLinha"><span class="mdi mdi-content-copy"></span> Copiar Código</button>
                <button class="button button-fill color-blue" id="baixarBoleto"><span class="mdi mdi-file-download-outline"></span> Baixar Boleto</button>
              `;

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
                formaPagamento = 'Pix';
                pagamentoBody.innerHTML = `
                  <div class="pix-info">
                    <div class="pix-info-item">
                      <img src="${data.qrCodePix}" alt="QR Code Pix" id="qrCodePix" />
                    </div>
                    <div class="pix-info-item">
                      <span class="label">Pix Copia e Cola:</span>
                      <span class="value" id="pixCopiaCola">${data.pixCopiaCola}</span>
                    </div>
                    <div class="pix-info-item">
                      <span class="label">Pix Copia e Cola:</span>
                      <span class="value" id="pixCopiaCola">${data.pixCopiaCola}</span>
                    </div>
                  </div>
                `;
                pagamentoButtons.innerHTML = `
                  <button class="button button-fill color-green margin-bottom margin-top" id="copiarPix"><span class="mdi mdi-content-copy"></span> Copiar Código Pix</button>
                `;
            
                // Copiar código Pix
                document.getElementById('copiarPix').addEventListener('click', function () {
                  copiarParaAreaDeTransferencia(data.pixCopiaCola);
                });
              }

              document.getElementById('formaSelecionada').innerText = formaPagamento;
            }

            // Inicializar o conteúdo do pagamento
            criarConteudoPagamento(data);

            
            localStorage.removeItem('pagamentoData');
            // Usar os dados conforme necessário
          }

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