// Início função validar login
async function validarToken() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    if (userAuthToken) {
      const apiServerUrl = "https://vitatop.tecskill.com.br/rest.php";
  
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAuthToken,
      };
  
      const body = JSON.stringify({
        class: "ProdutoCategoriaRest",
        method: "loadAll",
        limit: "1",
      });
  
      const options = {
        method: "POST",
        headers: headers,
        body: body,
      };
  
      try {
        const response = await fetch(apiServerUrl, options);
        const data = await response.json();
        if (data.status == "success") {
          // Token válido, continua na página atual
          return true;
        } else {
          // Token inválido, redireciona para a página de login
          return false;
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        return false;
      }
    } else {
      // Token não existe, redireciona para a página de login
      return false;
    }
  }
  // Função para verificar se o token JWT expirou
  
  //Inicio Funçao listar categorias
  function listarCategorias() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "ProdutoCategoriaRest",
      method: "listarCategorias",
      limit: 10,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de categorias
        if (
          responseJson.status === "success" &&
          responseJson.data &&
          responseJson.data.data
        ) {
          const categorias = responseJson.data.data;
  
          // Adiciona a opção Todas ao inicio
          var opcaoTodasHTML =
            '<div class="swiper-slide"><button class="filter-btn active">TODAS</button></div>';
          $("#container-categorias").append(opcaoTodasHTML);
  
          categorias.forEach((categoria) => {
            var categoriaHTML = `
                      <!-- CATEGORIA ITEM-->
                      <div class="swiper-slide">
                          <button class="filter-btn" data-id="${categoria.id}">${categoria.nome}</button>
                      </div>
                      `;
  
            $("#container-categorias").append(categoriaHTML);
          });
          // Adiciona o swiper-pagination ao final
          var swiperPaginationHTML = '<div class="swiper-pagination"></div>';
          $("#container-categorias").append(swiperPaginationHTML);
  
          $(".filter-btn").on("click", function () {
            // Remove a classe active de todos os botões
            $(".filter-btn").removeClass("active");
            // Adiciona a classe active ao botão clicado
            $(this).addClass("active");
            // Pega o id da categoria clicada
            var categoriaId = $(this).data("id");
            // Chama a função listarProdutos com o id da categoria
            listarProdutos("", categoriaId);
          });
  
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar categorias: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar categorias: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Lista categorias
  
  //Inicio Funçao listar produtos tela Home
  function listarProdutos(searchQuery = "", categoriaId, compra) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
  
    var imgUrl = "https://vitatop.tecskill.com.br/";
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "ProdutoVariacaoRest",
      method: "listarProdutos",
      categoria_id: categoriaId,
      search: searchQuery,
      limit: 30,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de pedidos
        if (
          responseJson.status === "success" &&
          responseJson.data &&
          responseJson.data.data
        ) {
          const produtos = responseJson.data.data;
          $("#container-produtos").empty();
  
          produtos.forEach((produto) => {
            var produtoPreco = "";
            if (compra == "compra") {
              produtoPreco = formatarMoeda(produto.preco);
            } else {
              produtoPreco = formatarMoeda(produto.preco_lojavirtual);
            }
            var imgUrl = "https://vitatop.tecskill.com.br/";
            const imagemProduto = produto.foto
              ? imgUrl + produto.foto
              : "img/default.png";
            const nomeProduto = truncarNome(produto.nome, 18);
            const rating = 5;
  
            var produtoHTML = `
                      <!-- ITEM CARD-->
                      <div class="item-card">
                          <a data-id="${produto.id}" 
                          data-nome="${produto.nome}" 
                          data-preco="${produto.preco}"
                          data-preco2="${produto.preco2}"
                          data-preco_lojavirtual="${produto.preco_lojavirtual}"
                          data-imagem="${imagemProduto}"
                          href="#" class="item">
                              <div class="img-container">
                                  <img src="${imagemProduto}">
                              </div>
                              <div class="nome-rating">
                                      <span class="color-gray">${nomeProduto.toLocaleUpperCase()}</span>                     
                                  <div class="star-rating">
                                      <span class="star"></span>
                                      <span class="star"></span>
                                      <span class="star"></span>
                                      <span class="star"></span>
                                      <span class="star"></span>
                                  </div>
                                  <div class="price">${produtoPreco}</div>
                              </div> 
                          </a>
                      </div>
                      `;
            $("#container-produtos").append(produtoHTML);
            // Selecionar as estrelas apenas do produto atual
            const stars = $("#container-produtos")
              .children()
              .last()
              .find(".star-rating .star");
  
            // Preencher as estrelas conforme o rating do produto atual
            for (let i = 0; i < rating; i++) {
              stars[i].classList.add("filled");
            }
          });
          $(".item").on("click", function () {
            var id = $(this).attr("data-id");
            var nomeProduto = $(this).attr("data-nome");
            var preco = $(this).attr("data-preco");
            var preco2 = $(this).attr("data-preco2");
            var preco_lojavirtual = $(this).attr("data-preco_lojavirtual");
            var imagem = $(this).attr("data-imagem");
            localStorage.setItem("produtoId", id);
            const produto = {
              id: id,
              imagem: imagem,
              nome: nomeProduto,
              rating: 5,
              likes: 5,
              reviews: 5,
              preco: preco,
              preco2: preco2,
              preco_lojavirtual: preco_lojavirtual,
            };
            localStorage.setItem("produto", JSON.stringify(produto));
            app.views.main.router.navigate("/detalhes/");
          });
  
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar pedidos: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar pedidos: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Lista produtos
  
//Inicio Função Detalhes Produto
function buscarProduto(produtoId) {
  var userAuthToken = localStorage.getItem("userAuthToken");
  var operacao = localStorage.getItem("operacao");
  app.dialog.preloader("Carregando...");

  var imgUrl = "https://vitatop.tecskill.com.br/";

  // Cabeçalhos da requisição
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "ProdutoVariacaoRest",
    method: "obterProdutoCompleto",
    produto_id: produtoId,
  });

  // Opções da requisição
  const options = {
    method: "POST",
    headers: headers,
    body: body,
  };

  // Fazendo a requisição
  fetch(apiServerUrl, options)
    .then((response) => response.json())
    .then((responseJson) => {
      // Verifica se o status é 'success' e se há dados de pedidos
      if (responseJson.status === "success" && responseJson.data.status === "success") {
        const detalhes = responseJson.data.data;             
        var produtoPreco = "";
        if (operacao == "compra") {
          produtoPreco = formatarMoeda(detalhes.preco);
        } else {
          produtoPreco = formatarMoeda(detalhes.preco_lojavirtual);
        }
        
        // Inicializar o carrossel de imagens
        initProductCarousel(detalhes, imgUrl);
        
        // Resto do código existente
        $("#imagemShare").attr('src', imgUrl + detalhes.foto);
        $("#nome-detalhe").html(detalhes.nome.toUpperCase());
        $("#nomeShare").html(detalhes.nome.toUpperCase());
        //$("#rating-detalhe").html(produto.rating);
        //$("#like-detalhe").html(produto.likes);
        //$("#reviews-detalhe").html(produto.reviews + ' reviews');
        $("#descricao-detalhe").html(detalhes.descricao_app);
        $("#preco-detalhe").html(produtoPreco);
        $("#precoTotal").html(produtoPreco);
        $("#precoShare").html(produtoPreco);
        $("#precopromo-detalhe").html(produtoPreco);
        
        // Selecione a div onde você quer adicionar o link
        const $container = $('#containerBtnCarrinho');
        // Crie o link e configure os atributos
        const $btnAddCarrinho = $('<button></button>')
            .text('Adicionar Carrinho')
            .attr('data-produto-id', '123')
            .attr('id', 'botaoCarrinho')
            .addClass('add-cart');
    
        // Anexe o link ao container
        $container.append($btnAddCarrinho);
        produtoId = detalhes.id;
    
        //CLICOU NO ADICIONAR CARRINHO
        $("#addCarrinho").on('click', function () {
            //ADICIONAR AO CARRINHO
            adicionarItemCarrinho(produtoId);
        });
        
        //CLICOU NO ADICIONAR CARRINHO
        $("#comprarAgora").on('click', function () {
            //ADICIONAR AO CARRINHO
            adicionarItemCarrinho(produtoId);
        });
        
        // Adicionar CSS para os cards de benefícios
        const style = `
        <style>
            .benefit-card {
                transition: all 0.3s ease;
                border: 1px solid transparent;
                margin-bottom: 15px;
                position: relative;
                overflow: hidden;
                background-color: #f8f9fa;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .benefit-card:active {
                transform: scale(0.98);
                background-color: #f3f4f6;
            }
            .benefit-icon {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 10px auto;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .benefit-name {
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 8px;
                color: #333;
            }
            .saiba-mais-btn {
                transition: all 0.2s ease;
                background: linear-gradient(45deg, #3B82F6, #2563EB);
                color: white;
                padding: 6px 14px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 500;
                border: none;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
                margin-top: 5px;
            }
            .saiba-mais-btn:active {
                transform: translateY(2px);
                box-shadow: 0 1px 2px rgba(59, 130, 246, 0.2);
            }
            .popup-beneficio {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .popup-beneficio.ativo {
                opacity: 1;
                pointer-events: auto;
            }
            .popup-beneficio-conteudo {
                background-color: white;
                border-radius: 16px;
                padding: 20px;
                width: 90%;
                max-width: 320px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                transform: translateY(20px);
                transition: transform 0.3s ease;
            }
            .popup-beneficio.ativo .popup-beneficio-conteudo {
                transform: translateY(0);
            }
            .popup-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
            }
            .popup-icone {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
            }
            .popup-fechar {
                position: absolute;
                right: 15px;
                top: 15px;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background-color: #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 18px;
                color: #6b7280;
            }
            .popup-titulo {
                font-weight: 600;
                font-size: 18px;
                margin: 0;
            }
            .popup-descricao {
                font-size: 16px;
                line-height: 1.5;
                color: #4b5563;
            }
            /* Animação de pulsar para o botão */
            .animate-pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.8;
                }
            }
        </style>
        `;

        // Adicionar o CSS à página se ainda não existir
        if ($('#beneficio-style').length === 0) {
            $('head').append(`<div id="beneficio-style">${style}</div>`);
        }

        // Limpa os benefícios antes de adicionar novos
        $(".benefits-grid").empty();

        // Percorre a lista de benefícios e adiciona ao HTML com botão "Saiba mais"
        detalhes.beneficios.forEach((beneficio, index) => {
            $(".benefits-grid").append(`
                <div class="p-4 benefit-card text-center">
                    <div class="benefit-icon" style="background-color: ${beneficio.cor_icone};">
                        <i class="${beneficio.icone} text-white text-lg"></i>
                    </div>
                    <h4 class="benefit-name">${beneficio.nome}</h4>
                    <button class="saiba-mais-btn animate-pulse" data-beneficio-id="${index}">
                        Saiba mais
                    </button>
                </div>
            `);
        });

        // Remover popup anterior se existir
        $('#popupBeneficio').remove();

        // Criar o elemento do popup
        const popupElement = `
        <div class="popup-beneficio" id="popupBeneficio">
            <div class="popup-beneficio-conteudo">
                <div class="popup-fechar">×</div>
                <div class="popup-header">
                    <div class="popup-icone" id="popupIcone">
                        <i class="icon" id="popupIconeClass"></i>
                    </div>
                    <h3 class="popup-titulo" id="popupTitulo"></h3>
                </div>
                <div class="popup-descricao" id="popupDescricao"></div>
            </div>
        </div>
        `;

        // Adicionar o popup ao final do body
        $('body').append(popupElement);

        // Configurar eventos de clique para os botões "Saiba mais"
        $(document).off('click', '.saiba-mais-btn').on('click', '.saiba-mais-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const beneficioId = $(this).data('beneficio-id');
            const beneficio = detalhes.beneficios[beneficioId];
            
            // Configurar o conteúdo do popup
            $('#popupIcone').css('background-color', beneficio.cor_icone);
            $('#popupIconeClass').removeClass().addClass(beneficio.icone + ' text-white');
            $('#popupTitulo').text(beneficio.nome);
            $('#popupDescricao').html(beneficio.descricao);
            
            // Mostrar o popup com animação
            $('#popupBeneficio').addClass('ativo');
            
            // Adicionar um pequeno feedback tátil se disponível
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });

        // Fechar o popup ao clicar no botão de fechar ou fora do conteúdo
        $(document).off('click', '.popup-fechar, .popup-beneficio').on('click', '.popup-fechar, .popup-beneficio', function(e) {
            if (e.target === this) {
                $('#popupBeneficio').removeClass('ativo');
            }
        });

        // Impedir que cliques dentro do conteúdo do popup o fechem
        $(document).off('click', '.popup-beneficio-conteudo').on('click', '.popup-beneficio-conteudo', function(e) {
            e.stopPropagation();
        });

        // Limpa os dados nutricionais antes de adicionar novos
        $(".space-y-4").empty();

        // Verificar se a tabela nutricional existe e tem conteúdo
        if (detalhes.tabela_nutricional && detalhes.tabela_nutricional.length > 0) {
            // Função para extrair apenas o valor numérico
            function extrairNumero(texto) {
                // Verifica se o texto é null ou undefined
                if (texto === null || texto === undefined) {
                    return 0;
                }
                // Converte para string para garantir que match funcione
                texto = String(texto);
                // Extrai apenas os dígitos do texto (incluindo decimais)
                const match = texto.match(/(\d+[.,]?\d*)/);
                return match ? parseFloat(match[0].replace(',', '.')) : 0;
            }

            // Encontrar o valor máximo na tabela para usar como referência
            let valorMaximo = 1; // Valor padrão mínimo
            detalhes.tabela_nutricional.forEach((item) => {
                const valor = extrairNumero(item.quantidade);
                if (valor > valorMaximo) {
                    valorMaximo = valor;
                }
            });

            // Percorre a lista da tabela nutricional e adiciona ao HTML
            detalhes.tabela_nutricional.forEach((item) => {
                // Verifica se o item ou item.quantidade é null
                if (!item || item.quantidade === null || item.quantidade === undefined) {
                    return; // Pula este item
                }
                
                // Extrair o valor numérico
                const valorNumerico = extrairNumero(item.quantidade);
                
                // Calcular a largura proporcional (máximo 85% para manter visual)
                const larguraBarra = Math.min(85, (valorNumerico / valorMaximo) * 85);
                
                // Nome do item com verificação
                const nomeItem = item.nome || "Informação nutricional";
                
                // Quantidade com verificação (mostra "Não disponível" se for null)
                const quantidadeDisplay = (item.quantidade === null || item.quantidade === undefined) 
                    ? "Não disponível" 
                    : item.quantidade;
                
                $(".space-y-4").append(`
                    <div>
                        <div class="flex justify-between mb-1">
                            <span class="text-gray-700">${nomeItem}</span>
                            <span class="text-gray-900 font-medium">${quantidadeDisplay}</span>
                        </div>
                        <div class="progress-bar" style="width: ${larguraBarra}%;"></div>
                    </div>
                `);
            });
        } else {
            // Se não houver tabela nutricional, adicione uma mensagem informativa (opcional)
            $(".space-y-4").append(`
                <div class="text-center text-gray-500 py-4">
                    Informações nutricionais não disponíveis para este produto.
                </div>
            `);
        }

        localStorage.setItem('produtoDetalhes', JSON.stringify({detalhes}));
        app.dialog.close();
      } else {
        app.dialog.close();
        // Verifica se há uma mensagem de erro definida
        const errorMessage =
          responseJson.message || "Formato de dados inválido";
        app.dialog.alert(
          "Erro ao carregar produtos: " + errorMessage,
          "Falha na requisição!"
        );
      }
    })
    .catch((error) => {
      app.dialog.close();
      console.error("Erro:", error);
      app.dialog.alert(
        "Erro ao carregar produtos: " + error.message,
        "Falha na requisição!"
      );
    });
}

// Função para inicializar o carrossel de imagens
function initProductCarousel(detalhes, imgUrl) {
    // Verificar se já existem os elementos do carrossel, caso contrário, criar
    if ($('.product-carousel').length === 0) {
        // Substituir a div da imagem única pelo código do carrossel
        const carouselHTML = `
            <div class="swiper-container product-carousel">
                <div class="swiper-wrapper"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-pagination"></div>
            </div>
            <div class="swiper-container product-thumbs mt-3">
                <div class="swiper-wrapper"></div>
            </div>
        `;
        
        // Substituir a imagem única pelo carrossel
        const $imagemContainer = $('#imagem-detalhe').parent().parent();
        $imagemContainer.html(carouselHTML);
        
        // Adicionar o modal de zoom se ainda não existir
        if ($('#zoom-modal').length === 0) {
            const zoomModalHTML = `
                <div class="zoom-modal" id="zoom-modal">
                    <div class="zoom-content">
                        <span class="zoom-close">&times;</span>
                        <div class="zoom-container">
                            <img id="zoom-image" src="" alt="Produto Ampliado">
                        </div>
                    </div>
                </div>
            `;
            $('body').append(zoomModalHTML);
        }
        
        // Adicionar os estilos CSS se ainda não existirem
        if ($('#carousel-style').length === 0) {
            const carouselCSS = `
                <style id="carousel-style">
                    /* Estilos para o carrossel */
                    .product-carousel {
                        width: 100%;
                        border-radius: 1rem;
                        background-color: #f9fafb;
                        overflow: hidden;
                    }
                    
                    .product-carousel .swiper-slide {
                        height: 300px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: zoom-in;
                    }
                    
                    .product-carousel .swiper-slide img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        transition: transform 0.3s ease;
                    }
                    
                    .product-thumbs {
                        height: 80px;
                        margin-top: 10px;
                    }
                    
                    .product-thumbs .swiper-slide {
                        width: 80px;
                        height: 80px;
                        cursor: pointer;
                        opacity: 0.5;
                        border-radius: 0.5rem;
                        overflow: hidden;
                        border: 2px solid transparent;
                        transition: all 0.3s ease;
                    }
                    
                    .product-thumbs .swiper-slide img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    
                    .product-thumbs .swiper-slide-thumb-active {
                        opacity: 1;
                        border-color: #3B82F6;
                    }
                    
                    /* Estilos para o modal de zoom */
                    .zoom-modal {
                        display: none;
                        position: fixed;
                        z-index: 9999;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        overflow: auto;
                        background-color: rgba(0, 0, 0, 0.9);
                        transition: all 0.3s ease;
                    }
                    
                    .zoom-content {
                        position: relative;
                        margin: auto;
                        padding: 20px;
                        width: 90%;
                        height: 90%;
                        max-width: 1200px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .zoom-container {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                    }
                    
                    #zoom-image {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    
                    .zoom-close {
                        position: absolute;
                        top: 15px;
                        right: 20px;
                        color: white;
                        font-size: 32px;
                        font-weight: bold;
                        cursor: pointer;
                        z-index: 1000;
                    }
                    
                    /* Estilos para os controles de navegação */
                    .swiper-button-next, .swiper-button-prev {
                        color: #3B82F6;
                    }
                    
                    .swiper-pagination-bullet-active {
                        background-color: #3B82F6;
                    }
                    
                    /* Animação de carregamento para as imagens */
                    @keyframes shimmer {
                        0% { background-position: -468px 0 }
                        100% { background-position: 468px 0 }
                    }
                    
                    .image-loading {
                        background: #f6f7f8;
                        background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                        background-repeat: no-repeat;
                        background-size: 800px 100%;
                        animation-duration: 1.5s;
                        animation-fill-mode: forwards;
                        animation-iteration-count: infinite;
                        animation-name: shimmer;
                        animation-timing-function: linear;
                    }
                </style>
            `;
            $('head').append(carouselCSS);
        }
    }
    
    // Limpar os slides existentes
    $('.product-carousel .swiper-wrapper').empty();
    $('.product-thumbs .swiper-wrapper').empty();
    
    // Verificar se há imagens extras, se não, usar apenas a imagem principal
    let imagens = [];
    
    // Adicionar a imagem principal primeiro
    if (detalhes.foto) {
        imagens.push(detalhes.foto);
    }
    
    // Verificar se há outras imagens no objeto detalhes
    // Isso depende de como a API retorna as imagens extras (por exemplo, pode ser detalhes.imagens ou outro campo)
    if (detalhes.imagens && Array.isArray(detalhes.imagens)) {
        // Se houver um array de imagens, adicionar todas elas
        imagens = imagens.concat(detalhes.imagens.map(img => img.caminho || img.url || img));
    } else if (detalhes.galeria && Array.isArray(detalhes.galeria)) {
        // Alternativa se o nome da propriedade for galeria
        imagens = imagens.concat(detalhes.galeria.map(img => img.caminho || img.url || img));
    } else {
        // Se não houver imagens extras, adicionar algumas imagens de exemplo (remover em produção)
        // Descomentar se quiser adicionar mais imagens de exemplo para testes
        /*
        if (imagens.length === 1) {
            for (let i = 0; i < 3; i++) {
                imagens.push(detalhes.foto);
            }
        }
        */
    }
    
    // Se não houver nenhuma imagem, usar uma imagem padrão
    if (imagens.length === 0) {
        imagens.push('img/default.png');
    }
    
    // Adicionar os slides ao carrossel principal
    imagens.forEach((imagem, index) => {
        // Determinar o src da imagem (URL completa ou relativa)
        const src = imagem.startsWith('http') ? imagem : 
                 (imagem.startsWith('img/') ? imagem : imgUrl + imagem);
        
        // Adicionar ao carrossel principal
        $('.product-carousel .swiper-wrapper').append(`
            <div class="swiper-slide">
                <img src="${src}" alt="Produto ${index + 1}" class="product-image" loading="lazy">
            </div>
        `);
        
        // Adicionar à galeria de miniaturas
        $('.product-thumbs .swiper-wrapper').append(`
            <div class="swiper-slide">
                <img src="${src}" alt="Miniatura ${index + 1}" loading="lazy">
            </div>
        `);
    });
    
    // Inicializar a galeria de miniaturas primeiro
    const thumbsSwiper = new Swiper('.product-thumbs', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
    });
    
    // Inicializar o carrossel principal
    const mainSwiper = new Swiper('.product-carousel', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        thumbs: {
            swiper: thumbsSwiper,
        },
    });
    
    // Adicionar funcionalidade de zoom ao clicar nas imagens
    $('.product-carousel .swiper-slide img').on('click', function() {
        const imgSrc = $(this).attr('src');
        $('#zoom-image').attr('src', imgSrc);
        $('#zoom-modal').css('display', 'block');
    });
    
    // Fechar o modal de zoom quando clicar no X
    $('.zoom-close').on('click', function() {
        $('#zoom-modal').css('display', 'none');
    });
    
    // Fechar o modal de zoom quando clicar fora da imagem
    $('#zoom-modal').on('click', function(e) {
        if (e.target === this) {
            $(this).css('display', 'none');
        }
    });
    
    // Implementar zoom com pinch-to-zoom para dispositivos móveis
    const zoomImage = document.getElementById('zoom-image');
    
    // Variáveis para controle de zoom com gestos
    let currentScale = 1;
    let posX = 0;
    let posY = 0;
    let startX = 0;
    let startY = 0;
    
    // Adicionar evento de roda do mouse para zoom (desktops)
    zoomImage.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(1, Math.min(3, currentScale + delta));
        
        if (newScale !== currentScale) {
            const rect = zoomImage.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Calcular novas coordenadas
            posX += mouseX * (1 - newScale / currentScale);
            posY += mouseY * (1 - newScale / currentScale);
            
            currentScale = newScale;
            
            // Aplicar transformação
            zoomImage.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
        }
    });
    
    // Eventos para arrastar a imagem quando ampliada
    zoomImage.addEventListener('mousedown', function(e) {
        e.preventDefault();
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        
        // Adicionar eventos de movimento e soltar
        document.addEventListener('mousemove', dragImage);
        document.addEventListener('mouseup', stopDragging);
    });
    
    // Função para arrastar a imagem
    function dragImage(e) {
        e.preventDefault();
        if (currentScale > 1) {
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            zoomImage.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
        }
    }
    
    // Função para parar de arrastar
    function stopDragging() {
        document.removeEventListener('mousemove', dragImage);
        document.removeEventListener('mouseup', stopDragging);
    }
    
    // Resetar zoom quando fechar o modal
    $('.zoom-close, #zoom-modal').on('click', function(e) {
        if (e.target === this || $(e.target).hasClass('zoom-close')) {
            currentScale = 1;
            posX = 0;
            posY = 0;
            zoomImage.style.transform = 'translate(0, 0) scale(1)';
        }
    });
    
    // Inicializar eventos de toque para dispositivos móveis (pinch-to-zoom)
    if (typeof app !== 'undefined' && app.gestures) {
        const zoomGestures = app.gestures.createGesture({
            el: '.zoom-container',
            touchEvents: true,
            disableContextMenu: true,
            touchStartPreventDefault: true,
            touchMovePreventDefault: true,
            touchReleasePreventDefault: true,
            
            // Tratamento de gestos
            onGestureStart: function(e) {
                if (e.type === 'pinchstart') {
                    startScale = currentScale || 1;
                }
            },
            onGestureChange: function(e) {
                if (e.type === 'pinchmove') {
                    const newScale = Math.max(1, Math.min(5, startScale * e.scale));
                    zoomImage.style.transform = `scale(${newScale})`;
                    currentScale = newScale;
                }
            },
            passive: false
        });
    }
}
//Fim Função Detalhes Produto
  
  //Inicio Função obter Links
  function buscarLinks(produtoId) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    var codigo_indicador = localStorage.getItem("codigo_indicador");
    app.dialog.preloader("Carregando...");
  
    var imgUrl = "https://vitatop.tecskill.com.br/";
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "ProdutoLinkRest",
      method: "loadAll",
      filters: [["produto_id", "=", produtoId]],
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de pedidos
        if (responseJson.status === "success") {
          const links = responseJson.data;
          let linkLandingPage = "";
          let linkCheckout = "";
  
          //Limpa o container antes de copular
          $("#qrcode").html("");
          $("#ul-links").html("");
  
          links.forEach((link) => {
            const linkUrl = truncarNome(link.link_url, 40);
  
            // Verifica se o tipo_link é igual a 1 e armazena o link_url
            if (link.tipo_link == "1") {
              linkLandingPage = link.link_url;
              $("#paginaLinkUrl").html(linkUrl);
            } else {
              linkCheckout = link.link_url;
              $("#checkoutLinkUrl").html(linkUrl);
            }
          });
  
          $("#shareLanding").on("click", function () {
            // Pega o url do link clicado em share
            //Abre opção compartilhamento
            onCompartilhar(
              "Link do Produto",
              "Aproveite agora mesmo nosso produto",
              linkLandingPage + codigo_indicador
            );
          });
          $("#linkPaginaUrl").on("click", function () {
            // Pega o url do link clicado em share
            //Abre opção compartilhamento
            onCompartilhar(
              "Link do Produto",
              "Aproveite agora mesmo nosso produto",
              linkLandingPage + codigo_indicador
            );
          });
          $("#linkCheckoutUrl").on("click", function () {
            // Pega o url do link clicado em share
            //Abre opção compartilhamento
            onCompartilhar(
              "Link do Produto",
              "Aproveite agora mesmo nosso produto",
              linkCheckout + codigo_indicador
            );
          });
  
          $(".compartilhar-link").on("click", function () {
            // Pega o url do link clicado em share
            var linkUrl = $(this).data("link");
            //Abre opção compartilhamento
  
            onCompartilhar(
              "Link do Produto",
              "Aproveite agora mesmo nosso produto",
              linkCheckout + codigo_indicador
            );
          });
  
          var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: linkLandingPage,
            width: 130,
            height: 130,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
  
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar links: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar links: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função obter Links
  
  //Inicio Função obter id da Pessoa
  function buscarPessoaId(userId) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PessoaRest",
      method: "loadAll",
      filters: [["user_id", "=", userId]],
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (responseJson.status === "success") {
          const pessoaId = responseJson.data[0].id;
          localStorage.setItem("pessoaId", pessoaId);
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar pessoa: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar pessoa: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função obter id da Pessoa
  
  //Inicio Função obter Link Afiliado
  function buscarLinkAfiliado() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
    app.dialog.preloader("Carregando...");
  
    var imgUrl = "https://vitatop.tecskill.com.br/";
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PessoaRestService",
      method: "LinkIndicador",
      dados: { pessoa_id: pessoaId },
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de pedidos
        if (responseJson.status === "success") {
          const resultado = responseJson;
          var linkUrl = resultado.data.data.link;
          $("#qrcode").html("");
  
          $("#link-indicacao").text(linkUrl);
  
          $("#compartilharLink").on("click", function () {
            // Pega o url do link clicado em share
            //Abre opção compartilhamento.
            onCompartilhar(
              "Link de Afiliado",
              "Faça seu cadastro na plataforma",
              linkUrl
            );
          });
  
          var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: linkUrl,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
  
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar links: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar pessoa: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função obter Link Afiliado
  
  //Inicio Funçao listar pedidos tela Pedidos
  function listarPedidos(searchQuery = "") {
    var userAuthToken = localStorage.getItem("userAuthToken");
    var pessoaId = localStorage.getItem("pessoaId");
    app.dialog.preloader("Carregando...");
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PedidoVendaRest",
      method: "ListarPedidos",
      pessoa_id: pessoaId,
      limit: 15,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de pedidos
        if (
          responseJson.status === "success" &&
          responseJson.data &&
          responseJson.data.data
        ) {
          const pedidos = responseJson.data.data;
          const pedidosContainer = document.getElementById("container-pedidos");
          pedidosContainer.innerHTML = "";
  
          pedidos.forEach((pedido) => {
            const pedidosHTML = `                    
                          <div class="card-list" 
                          data-id-pedido="${pedido.id}">
                             <div class="card-principal">
                                <div class="card-header open header-pago">
                                   <div class="date">${formatarData(
                                     pedido.data_emissao
                                   )}</div>
                                   <div class="status">${
                                     pedido.mensagem_compra
                                   }</div>
                                </div>
                                <div class="card-body">
                                   <div class="name">PEDIDO #${pedido.id}</div>
                                   <div class="details">
                                      <div class="detail">
                                         <span>Nº</span>
                                         <span>${pedido.id}</span>
                                      </div>
                                      <div class="detail">
                                         <span class="mdi mdi-cash-multiple"></span>
                                         <span>${pedido.forma_pagamento}</span>
                                      </div>
                                      <div class="detail">
                                         <span>Total</span>
                                         <span>${formatarMoeda(
                                           pedido.valor_total
                                         )}</span>
                                      </div>
                                      <div class="detail">
                                         <span>A pagar</span>
                                         <span>${formatarMoeda(
                                           pedido.valor_total
                                         )}</span>
                                      </div>
                                      <div class="items">${
                                        pedido.quantidade_itens
                                      }</div>
                                   </div>
                                </div>
                             </div>
                          </div>
                      `;
            pedidosContainer.innerHTML += pedidosHTML;
          });
  
          $(".card-list").click(function () {
            // Atualiza o ícone de seleção
            var pedidoId = $(this).data("id-pedido");
            localStorage.setItem("pedidoId", pedidoId);
            app.views.main.router.navigate("/resumo-pedido/");
          });
  
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar pedidos: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar pedidos: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Lista tela Pedidos
  
  //Inicio Funçao listar Vendas
  function listarVendas(searchQuery = "") {
    var userAuthToken = localStorage.getItem("userAuthToken");
    var pessoaId = localStorage.getItem("pessoaId");
    app.dialog.preloader("Carregando...");
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    // Cabeçalhos da requisição
    const dados = {
      vendedor: pessoaId,
    };
  
    const body = JSON.stringify({
      class: "PedidoDigitalRest",
      method: "MinhasVendasDigitais",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de pedidos
        if (
          responseJson.status === "success" &&
          responseJson.data.status === "success"
        ) {
          const vendas = responseJson.data.data;
          const vendasContainer = document.getElementById("container-vendas");
          vendasContainer.innerHTML = "";
  
          vendas.forEach((venda) => {

            const vendasHTML = `                    
                          <div class="card-list" 
                          data-id-venda="${venda.venda_id}">
                             <div class="card-principal">
                                <div class="card-header open header-pago">
                                   <div class="date">${formatarData(
                                     venda.data_criacao
                                   )}</div>
                                   <div class="status">${
                                     venda.status_compra
                                   }</div>
                                </div>
                                <div class="card-body">
                                   <div class="name">PEDIDO #${
                                     venda.venda_id
                                   }</div>
                                   <div class="details">
                                      <div class="detail">
                                         <span>Nº</span>
                                         <span>${venda.venda_id}</span>
                                      </div>
                                      <div class="detail">
                                         <span class="mdi mdi-cash-multiple"></span>
                                         <span>${
                                           venda.forma_pagamento.forma
                                         }</span>
                                      </div>
                                      <div class="detail">
                                         <span>Total</span>
                                         <span>${formatarMoeda(
                                           venda.valor_total
                                         )}</span>
                                      </div>
                                      <div class="detail">
                                         <span>A pagar</span>
                                         <span>${formatarMoeda(
                                           venda.valor_total
                                         )}</span>
                                      </div>
                                      <div class="items">${venda.quantidade_itens}</div>
                                   </div>
                                </div>
                             </div>
                          </div>
                      `;
            vendasContainer.innerHTML += vendasHTML;
          });
  
          $(".card-list").click(function () {
            // Atualiza o ícone de seleção
            var vendaId = $(this).data("id-venda");
            localStorage.setItem("vendaId", vendaId);
            app.views.main.router.navigate("/resumo-venda/");
          });
  
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar vendas: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar vendas: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Lista Vendas
  
  // Início da função detalhesVendas
  function detalhesVenda() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    var vendaId = localStorage.getItem("vendaId");
    var pessoaId = localStorage.getItem("pessoaId");
    app.dialog.preloader("Carregando...");
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
    const dados = {
      vendedor: pessoaId,
      venda_id: vendaId,
    };
  
    const body = JSON.stringify({
      class: "PedidoDigitalRest",
      method: "MinhasVendasDigitais",
      dados: dados
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de pedidos
        if (
          responseJson.status === "success" &&
          responseJson.data &&
          responseJson.data.data
        ) {
          const detalhes = responseJson.data.data[0];
          const detalhesContainer = document.getElementById("detalhesVenda");
          detalhesContainer.innerHTML = "";
  
          // Formata a data e moeda
          const formatarData = (data) => new Date(data).toLocaleString();
          const formatarMoeda = (valor) =>
            `R$ ${parseFloat(valor).toFixed(2).replace(".", ",")}`;
  
          // Monta o HTML dos itens do pedido
          const itensHTML = detalhes.itens
            .map(
              (item) => `
                      <li>
                          <img src="https://vitatop.tecskill.com.br/${
                            item.foto
                          }" alt="${
                item.descricao
              }" style="width: 50px; height: 50px;"/>
                          <span class="item-name">${item.descricao}</span>
                          <span class="item-quantity">${item.qtde}x</span>
                          <span class="item-price">${formatarMoeda(
                            item.preco
                          )}</span>
                      </li>
                  `
            )
            .join("");
  
          // Monta o HTML completo
          const detalhesHTML = `
                      <div class="order-summary">
                          <div class="order-details">
                              <p><h3>Número do Pedido: #${detalhes.venda_id}</h3></p>
                              <p><strong>Data do Pedido:</strong> ${formatarData(
                                detalhes.data_criacao
                              )}</p>
                          </div>
                          <div class="order-items">
                              <h3>Itens do Pedido</h3>
                              <ul>${itensHTML}</ul>
                          </div>
                          <div class="order-payment">
                              <h3>Forma de Pagamento</h3>
                              <p><strong>Método:</strong> ${
                                detalhes.forma_pagamento.forma
                              }</p>
                              <p><strong>Status:</strong> ${
                                detalhes.forma_pagamento.transacao_mensagem
                              }</p>
                              <!-- Seção de pagamento -->
                              <div class="payment-method-a display-none" id="pagamentoPix">
                                  <div class="payment-center">
                                      <img src="https://vitatop.tecskill.com.br/${
                                        detalhes.forma_pagamento.pix_qrcode
                                      }" width="250px" alt="QR Code">
                                      <span class="pix-key" id="pixKey">${
                                        detalhes.forma_pagamento.pix_key
                                      }</span>
                                      <button class="copy-button" id="copiarPix">Copiar Código Pix</button>
                                  </div>
                              </div>
                              <!-- Seção de pagamento -->
                              <div class="payment-method-a display-none" id="pagamentoBoleto">
                                  <div class="payment-center">
                                      <span class="pix-key" id="linhaBoleto">${
                                        detalhes.forma_pagamento.boleto_linhadigitavel
                                      }</span>
                                      <button class="copy-button" id="copiarBoleto">Copiar Linha Digitável</button>
                                      <button class="copy-button" id="baixarBoleto">Baixar Boleto PDF</button>
                                  </div>
                              </div>
                              <!-- Seção de pagamento -->
                              <div class="payment-method-a display-none" id="pagamentoCartao">
                                  <div class="payment-center">
                                  </div>
                              </div>
                          </div>
                          <div class="order-total">
                              <h3>Resumo</h3>
                              <p><strong>Total dos Itens:</strong> ${formatarMoeda(
                                detalhes.valor_produto
                              )}</p>
                              <p><strong>Frete:</strong> ${formatarMoeda(
                                detalhes.frete
                              )}</p>
                              <p><strong>Total:</strong> ${formatarMoeda(
                                detalhes.valor_total
                              )}</p>
                          </div>
                      </div>
                  `;
  
          detalhesContainer.innerHTML = detalhesHTML;
          if (detalhes.status_compra != 3) {
            $(".pagamento-display").removeClass("display-none");
          }
          if (detalhes.forma_pagamento == "PIX") {
            $("#pagamentoPix").removeClass("display-none");
          } else if (detalhes.forma_pagamento == "BOLETO") {
            $("#pagamentoBoleto").removeClass("display-none");
          } else {
            $("#pagamentoCartao").removeClass("display-none");
          }
  
          $("#copiarPix").on("click", function () {
            copiarParaAreaDeTransferencia(detalhes.pix_key);
          });
  
          $("#copiarBoleto").on("click", function () {
            copiarParaAreaDeTransferencia(detalhes.boleto_linhadigitavel);
          });
  
          // Baixar boleto
          $("#baixarBoleto").on("click", function () {
            app.dialog.confirm(
              "Deseja baixar o boleto no navegador?",
              function () {
                var ref = cordova.InAppBrowser.open(
                  detalhes.boleto_impressao,
                  "_system",
                  "location=no,zoom=no"
                );
                ref.show();
              }
            );
          });
  
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar pedidos: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar pedidos: " + error.message,
          "Falha na requisição!"
        );
      });
  
    localStorage.removeItem("pedidoId");
  }
  // Fim da função detalhesVendas

  // Início da função detalhesPedido
  function detalhesPedido() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    var pedidoId = localStorage.getItem("pedidoId");
    app.dialog.preloader("Carregando...");
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PedidoVendaRest",
      method: "ListarPedidos",
      id: pedidoId,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de pedidos
        if (
          responseJson.status === "success" &&
          responseJson.data &&
          responseJson.data.data
        ) {
          const detalhes = responseJson.data.data[0];
          const detalhesContainer = document.getElementById("detalhesPedidos");
          detalhesContainer.innerHTML = "";
  
          // Formata a data e moeda
          const formatarData = (data) => new Date(data).toLocaleString();
          const formatarMoeda = (valor) =>
            `R$ ${parseFloat(valor).toFixed(2).replace(".", ",")}`;
  
          // Monta o HTML dos itens do pedido
          const itensHTML = detalhes.itens
            .map(
              (item) => `
                      <li>
                          <img src="https://vitatop.tecskill.com.br/${
                            item.foto
                          }" alt="${
                item.descricao
              }" style="width: 50px; height: 50px;"/>
                          <span class="item-name">${item.descricao}</span>
                          <span class="item-quantity">${item.quantidade}x</span>
                          <span class="item-price">${formatarMoeda(
                            item.preco_total
                          )}</span>
                      </li>
                  `
            )
            .join("");
  
          // Monta o HTML completo
          const detalhesHTML = `
                      <div class="order-summary">
                          <div class="order-details">
                              <p><h3>Número do Pedido: #${detalhes.id}</h3></p>
                              <p><strong>Data do Pedido:</strong> ${formatarData(
                                detalhes.data_emissao
                              )}</p>
                          </div>
                          <div class="order-items">
                              <h3>Itens do Pedido</h3>
                              <ul>${itensHTML}</ul>
                          </div>
                          <div class="order-payment">
                              <h3>Forma de Pagamento</h3>
                              <p><strong>Método:</strong> ${
                                detalhes.forma_pagamento
                              } <a href="#" class="pagamento-display display-none">Alterar</a></p>
                              <p><strong>Status:</strong> ${
                                detalhes.mensagem_compra
                              }</p>
                              <!-- Seção de pagamento -->
                              <div class="payment-method-a display-none" id="pagamentoPix">
                                  <div class="payment-center">
                                      <img src="https://vitatop.tecskill.com.br/${
                                        detalhes.pix_qrcode
                                      }" width="250px" alt="QR Code">
                                      <span class="pix-key" id="pixKey">${
                                        detalhes.pix_key
                                      }</span>
                                      <button class="copy-button" id="copiarPix">Copiar Código Pix</button>
                                  </div>
                              </div>
                              <!-- Seção de pagamento -->
                              <div class="payment-method-a display-none" id="pagamentoBoleto">
                                  <div class="payment-center">
                                      <span class="pix-key" id="linhaBoleto">${
                                        detalhes.boleto_linhadigitavel
                                      }</span>
                                      <button class="copy-button" id="copiarBoleto">Copiar Linha Digitável</button>
                                      <button class="copy-button" id="baixarBoleto">Baixar Boleto PDF</button>
                                  </div>
                              </div>
                              <!-- Seção de pagamento -->
                              <div class="payment-method-a display-none" id="pagamentoCartao">
                                  <div class="payment-center">
                                  </div>
                              </div>
                          </div>
                          <div class="order-address">
                              <h3>Endereço de Entrega</h3>
                              <p>${detalhes.endereco_entrega.rua}, ${
            detalhes.endereco_entrega.numero
          }</p>
                              <p>${detalhes.endereco_entrega.bairro}, ${
            detalhes.endereco_entrega.cidade
          } - ${detalhes.endereco_entrega.estado}</p>
                              <p>${detalhes.endereco_entrega.cep}</p>
                          </div>
                          <div class="order-total">
                              <h3>Resumo</h3>
                              <p><strong>Total dos Itens:</strong> ${formatarMoeda(
                                detalhes.valor_total
                              )}</p>
                              <p><strong>Frete:</strong></p>
                              <p><strong>Total:</strong> ${formatarMoeda(
                                detalhes.valor_total
                              )}</p>
                          </div>
                      </div>
                  `;
  
          detalhesContainer.innerHTML = detalhesHTML;
          if (detalhes.status_compra != 3) {
            $(".pagamento-display").removeClass("display-none");
          }
          if (detalhes.forma_pagamento == "PIX") {
            $("#pagamentoPix").removeClass("display-none");
          } else if (detalhes.forma_pagamento == "BOLETO") {
            $("#pagamentoBoleto").removeClass("display-none");
          } else {
            $("#pagamentoCartao").removeClass("display-none");
          }
  
          $("#copiarPix").on("click", function () {
            copiarParaAreaDeTransferencia(detalhes.pix_key);
          });
  
          $("#copiarBoleto").on("click", function () {
            copiarParaAreaDeTransferencia(detalhes.boleto_linhadigitavel);
          });
  
          // Baixar boleto
          $("#baixarBoleto").on("click", function () {
            app.dialog.confirm(
              "Deseja baixar o boleto no navegador?",
              function () {
                var ref = cordova.InAppBrowser.open(
                  detalhes.boleto_impressao,
                  "_system",
                  "location=no,zoom=no"
                );
                ref.show();
              }
            );
          });
  
          app.dialog.close();
        } else {
          app.dialog.close();
          // Verifica se há uma mensagem de erro definida
          const errorMessage =
            responseJson.message || "Formato de dados inválido";
          app.dialog.alert(
            "Erro ao carregar pedidos: " + errorMessage,
            "Falha na requisição!"
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar pedidos: " + error.message,
          "Falha na requisição!"
        );
      });
  
    localStorage.removeItem("pedidoId");
  }
  // Fim da função detalhesPedido
  
  //Inicio Funçao Listar Banners
  function listarBanners() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
    const dados = {
      local: 1,
    };
    const body = JSON.stringify({
      class: "BannerRest",
      method: "ListaBanner",
      dados: dados,
    });
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        app.dialog.close();
        if (responseJson.status === "success") {
          const banners = responseJson.data;
          // Seleciona o wrapper do Swiper
          const swiperWrapper = document.querySelector(".swiper-wrapper");
          // Limpa os slides existentes
          swiperWrapper.innerHTML = "";
          // Adiciona os novos slides
          banners.forEach((banner) => {
            const slide = document.createElement("div");
            slide.classList.add("swiper-slide");
            const img = document.createElement("img");
            img.classList.add("img-fluid");
            img.src = banner.url_arquivo;
            img.alt = banner.titulo;
            slide.appendChild(img);
            swiperWrapper.appendChild(slide);
          });
        } else {
          console.error("Erro ao obter banners:", responseJson.message);
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar banners: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Listar Banners
  
  //Inicio Funçao CEP
  function cepEndereco(cep) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
    const dados = {
      cep: cep,
    };
    const body = JSON.stringify({
      class: "PessoaRestService",
      method: "ConsultaCEP",
      dados: dados,
    });
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        app.dialog.close();
        if (responseJson.status === "success") {
          var dadosEndereco = responseJson.data;
          $("#logradouroEndCliente").val(dadosEndereco.rua);
          $("#bairroEndCliente").val(dadosEndereco.bairro);
          $("#cidadeEndCliente").val(dadosEndereco.cidade);
          $("#estadoEndCliente").val(dadosEndereco.uf);
        } else {
          console.error("Erro ao obter dados do endereço:", responseJson.message);
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao buscar endereço: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função CEP
  
    //Inicio Funçao CEP Editar
    function cepEnderecoEdit(cep) {
      var userAuthToken = localStorage.getItem("userAuthToken");
      app.dialog.preloader("Carregando...");
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAuthToken,
      };
      const dados = {
        cep: cep,
      };
      const body = JSON.stringify({
        class: "PessoaRestService",
        method: "ConsultaCEP",
        dados: dados,
      });
      const options = {
        method: "POST",
        headers: headers,
        body: body,
      };
      fetch(apiServerUrl, options)
        .then((response) => response.json())
        .then((responseJson) => {
          app.dialog.close();
          if (responseJson.status === "success") {
            var dadosEndereco = responseJson.data;
            $("#logradouroEndEdit").val(dadosEndereco.rua);
            $("#bairroEndEdit").val(dadosEndereco.bairro);
            $("#cidadeEndEdit").val(dadosEndereco.cidade);
            $("#estadoEndEdit").val(dadosEndereco.uf);
          } else {
            console.error("Erro ao obter dados do endereço:", responseJson.message);
          }
        })
        .catch((error) => {
          app.dialog.close();
          console.error("Erro:", error);
          app.dialog.alert(
            "Erro ao buscar endereço: " + error.message,
            "Falha na requisição!"
          );
        });
    }
    //Fim Função CEP Editar
    
  //Inicio Funçao Listar Notificações
  function listarNotificacoes() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    var userId = localStorage.getItem("userId");
    app.dialog.preloader("Carregando...");
    
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "NotificacaoAppRest",
      method: "ListarNotificacoes",
      id_usuario: userId,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de notificações
        if (responseJson.status === "success" && responseJson.data.status === "success") {
          const notificacoes = responseJson.data.data; // Aqui acessa a lista de notificações
          // Verifica se a lista está vazia
          if (notificacoes.length === 0) {
            app.dialog.close();
            // Exibe mensagem "Nada por enquanto..."
            $("#container-notificacao").html(`
              <div class="text-align-center">
                <img width="150" src="img/bell.gif">
                <br><span class="color-gray">Nada por enquanto...</span>
              </div>
            `);
            return;
          }
  
          notificacoes.forEach((notificacao) => {
            const isVisto = notificacao.visto === "S"; // Verifica se a notificação foi vista

            const notificacaoHTML = `            
              <div class="notification-item swipeable ${isVisto ? "visto" : "nao-visto"}"
                  data-notification-id="${notificacao.id}">
                <div class="notification-icon">
                  ${notificacao.icone ? notificacao.icone : '<i class="mdi mdi-bell"></i>'}
                </div>
                <div class="notification-content">
                  <h3>${notificacao.titulo}</h3>
                  <p>${truncarNome(notificacao.mensagem, 25)}</p>
                </div>
                <div class="notification-actions">
                  <button class="action-btn" 
                    data-id="${notificacao.id}"
                    data-icone="${notificacao.icone}"
                    data-titulo="${notificacao.titulo}"
                    data-mensagem="${notificacao.mensagem}"
                    data-data="${formatarData(notificacao.data_criacao)}">
                    Detalhes
                  </button>
                </div>
                <div class="notification-time">${timeAgo(notificacao.data_criacao)}</div>
              </div>`;
            
            // Adiciona o HTML da notificação ao container
            $("#container-notificacao").append(notificacaoHTML);
          });       
            // Add swipe-to-delete functionality
            $(".swipeable").on("touchstart", function(e) {
              const startX = e.originalEvent.touches[0].pageX;
              let element = $(this);
              
              $(this).on("touchmove", function(e) {
                const moveX = e.originalEvent.touches[0].pageX;
                const deltaX = moveX - startX;
                
                // Only allow swiping right
                if (deltaX > 0) {
                  element.css('transform', `translateX(${deltaX}px)`);
                }
              });
              
              $(this).on("touchend", function(e) {
                const moveX = e.originalEvent.changedTouches[0].pageX;
                const deltaX = moveX - startX;
                
                // If swiped more than 100 pixels, delete the notification
                if (deltaX > 100) {
                  const notificacaoId = element.data('notification-id');
                  
                  // Call your delete function
                  apagarNotificacao(notificacaoId);
                  
                  // Animate and remove the notification from DOM
                  element.css('transform', 'translateX(100%)');
                  element.fadeOut(300, function() {
                    $(this).remove();
                  });
                } else {
                  // Snap back if not swiped far enough
                  element.css('transform', 'translateX(0)');
                }
                
                // Remove event listeners
                $(this).off('touchmove touchend');
              });
            });   
          // Adiciona o evento de clique ao botao detalhes notificação
          $(".action-btn").on("click", function () {
            const notificacaoId = $(this).data("id"); // Obtém o ID da notificação      
            const iconeNot = $(this).data("icone") || '<i class="mdi mdi-bell"></i>';
            const tituloNot = $(this).data("titulo");
            const descricaoNot = $(this).data("mensagem");     
            const dataNot = $(this).data("data");    

            // Atualiza o conteúdo do popup
            $("#icone-pop").html(iconeNot); // Define o ícone
            $("#title-pop").text(tituloNot); // Define o título
            $("#descricao-pop").text(descricaoNot); // Define a descrição
            $("#data-pop").text(timeAgo(dataNot));
            app.popup.open(".popup-detalhes-notificacao");
        
            // Aqui você pode executar outra ação, como marcar a notificação como lida
            marcarComoLida(notificacaoId);
          });
  
          app.dialog.close(); // Fecha o dialog após sucesso
        } else {
          app.dialog.close();
          // Exibe mensagem de erro caso o status não seja 'success'
          console.error("Erro ao obter notificações:", responseJson.data.message);
          app.dialog.alert(responseJson.data.message, "Erro!");
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar notificações: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Listar Notificações

  //Inicio Função Marcar como Lida a Notificação
  function marcarComoLida(notificacaoId) {
    const userAuthToken = localStorage.getItem("userAuthToken");
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "NotificacaoAppRest",
      method: "NotificacaoLida",
      id_notificacao: notificacaoId,
    });
  
    // Fazendo a requisição
    fetch(apiServerUrl, {
      method: "POST",
      headers: headers,
      body: body,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.status !== "success") {
          app.dialog.alert("Erro ao marcar como lida: " + responseJson.message, "Erro");
        }
      })
      .catch((error) => {
        console.error("Erro:", error);
        app.dialog.alert("Erro ao marcar como lida: " + error.message, "Erro");
      });
  }  
  //Fim Função Marcar como Lida a Notificação

// Inicio da Funçao que apaga a notificação
function apagarNotificacao(notificacaoId) {
  app.dialog.preloader("Apagando...");
  var userAuthToken = localStorage.getItem("userAuthToken");
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "NotificacaoAppRest",
    method: "ApagarNotificacao",
    id_notificacao: notificacaoId,
  });

  const options = {
    method: "POST",
    headers: headers,
    body: body,
  };

  fetch(apiServerUrl, options)
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.status === "success") {
        app.dialog.close();
        console.log("Notificação apagada com sucesso");
      } else {
        app.dialog.close();
        app.dialog.alert("Erro ao apagar notificação:", responseJson.data.message);
        console.error("Erro ao apagar notificação:", responseJson.data.message);
      }
    })
    .catch((error) => {
      console.error("Erro:", error);
    });
}
// Fim da Funçao que apaga a notificação

  //Inicio Funçao Listar Categorias
  function listarCategoriasCurso() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "CursoCategoriaRest",
      method: "loadAll",
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success' e se há dados de pedidos
        if (responseJson.status === "success") {
          const categorias = responseJson.data;
          const cores = ["red", "blue", "green", "yellow", "purple", "orange"];
  
          categorias.forEach((categoria, index) => {
            const cor = cores[index % cores.length];
            var categoriaHTML = `
                      <div class="categoria" data-color="${cor}">
                          <i class="${categoria.icone}"></i>
                          <div class="text">${categoria.nome}</div>
                      </div>
                      `;
  
            $("#categoriaList").append(categoriaHTML);
          });
  
          // Fechar o dialog ou outra ação necessária após preenchimento do select
          app.dialog.close();
        } else {
          app.dialog.close();
          // Tratar caso o status não seja "success"
          console.error(
            "Erro ao obter dados de faixas etárias:",
            responseJson.message
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar pedidos: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Listar Categorias
  
  //Inicio da funçao contagem Notificações
  function buscarQtdeNotif() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    var userId = localStorage.getItem("userId");
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "NotificacaoAppRest",
      method: "QtdeNotificacoes",
      id_usuario: userId,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.status === "success" && responseJson.data.status === "success") {
          const quantidadeNaoVistas = responseJson.data.data.quantidade;
  console.log(quantidadeNaoVistas);
          // Atualizar o atributo data-count
          const $btnNotificacao = $(".btn-notificacao");
          if (quantidadeNaoVistas > 0) {
            $btnNotificacao.attr("data-count", quantidadeNaoVistas);
          } else {
            $btnNotificacao.attr("data-count", "0"); // Define como zero se não houver notificações
          }
        } else {
          console.error("Erro ao contar notificações:", responseJson.message);
        }
      })
      .catch((error) => {
        console.error("Erro na requisição:", error);
      });
  }
  //Fim da funçao contagem Notificações
  
  //Inicio Funçao Selecionar Endereço
  function selecionarEndereco(enderecoSelecionado) {
    app.dialog.preloader("Carregando...");
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
  
    const endereco = enderecoSelecionado;

    const dados = {
      pessoa_id: pessoaId,
      endereco_id: endereco.id,
    };
  
    // Armazena o endereço selecionado no localStorage
    localStorage.setItem("enderecoSelecionado", endereco.id);
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PagamentoSafe2payRest",
      method: "AlterarEndereco",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "success"
        ) {
          app.dialog.close();
          var valorFrete = responseJson.data.data.frete;
  
          // Atualiza o valor do frete na interface
          $("#fretePedido").html(
            valorFrete.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          );
  
          // Destacar o endereço selecionado na interface
          $(".select-address").removeClass("text-blue-700 font-bold");
          $(`.select-address[data-id='${endereco.id}']`).addClass("text-blue-700 font-bold");
    
          if (endereco) {           
          $("#selectedAddress").html(`
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-gray-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-medium">${endereco.nome_endereco || "Residencial"}</h3>
                  ${endereco.principal == "S" ? 
                    `<span class="px-2 py-0.5 text-white text-xs rounded-full" style="background-color: #ff7b39">Principal</span>` : ""}
                </div>
                <p class="text-gray-600 text-sm mt-1">
                  ${endereco.rua}, ${endereco.numero} - ${endereco.bairro}
                </p>
                <p class="text-gray-600 text-sm">
                  ${endereco.municipio.nome}, ${endereco.estado.sigla} - CEP: ${endereco.cep}
                </p>
              </div>
            </div>
          `);
          }
        } else {          
          app.dialog.close();
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
      });
  }  
  //Fim Função Selecionar Endereço

  // Início Função Listar Endereços
function listarEnderecos() {
  var userAuthToken = localStorage.getItem("userAuthToken");
  app.dialog.preloader("Carregando...");
  const pessoaId = localStorage.getItem("pessoaId");

  // Cabeçalhos da requisição
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "PessoaRestService",
    method: "listarPessoa",
    pessoa_id: pessoaId,
  });

  // Opções da requisição
  const options = {
    method: "POST",
    headers: headers,
    body: body,
  };

  // Fazendo a requisição
  fetch(apiServerUrl, options)
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.data.status === "success") {
        const enderecos = responseJson.data.data.enderecos;
        $("#listaDeEnderecos").html(""); // Limpa a lista

        let enderecoPrincipal = null;
        let ultimoEndereco = null;

        enderecos.forEach((endereco, index) => {
          ultimoEndereco = endereco; // Atualiza o último endereço iterado

          var enderecoHTML = `
            <div class="border rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="font-medium">${endereco.nome_endereco || "Residencial"}</span>
                    ${endereco.principal == "S" ? 
                    `<span class="px-2 py-0.5 text-white text-xs rounded-full" style="background-color: #ff7b39">Principal</span>` : ""}
                  </div>
                  <p class="text-gray-600 text-sm">
                    ${endereco.rua}, ${endereco.numero} - ${endereco.bairro}
                  </p>
                  <p class="text-gray-600 text-sm">
                    ${endereco.municipio.nome}, ${endereco.estado.sigla} - CEP: ${endereco.cep}
                  </p>
                </div>
                <div class="flex items-center space-x-2">
                  <button class="text-gray-400 hover:text-gray-600 edit-address">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                  <button class="text-blue-500 hover:text-blue-700 select-address">
                    Selecionar
                  </button>
                </div>
              </div>
            </div>
          `;

          if (endereco.principal == "S") {
            enderecoPrincipal = endereco;
          }

          $("#listaDeEnderecos").append(enderecoHTML);
          // Atribuindo o objeto endereco ao botão clicado
          $(".edit-address").last().data("editarEndereco", endereco);
          $(".select-address").last().data("endereco", endereco);
        });

        $(".edit-address").on('click', function () {
          let editarEndereco = $(this).data("editarEndereco");
          $("#idEnderecoEdit").val(editarEndereco.id);
          $("#nomeEnderecoEdit").val(editarEndereco.nome_endereco);
          $("#cepEdit").val(editarEndereco.cep);
          $("#logradouroEndEdit").val(editarEndereco.rua);
          $("#numeroEndEdit").val(editarEndereco.numero);
          $("#complementoEndEdit").val(editarEndereco.complemento);
          $("#bairroEndEdit").val(editarEndereco.bairro);
          $("#cidadeEndEdit").val(editarEndereco.cidade);
          $("#estadoEndEdit").val(editarEndereco.estado.sigla);
          // Definir o estado do checkbox baseado no valor de is_principal
          if (editarEndereco.principal == 'S') {
              $("#defaultAddressEdit").prop("checked", true); // Marca o checkbox
          } else {
              $("#defaultAddressEdit").prop("checked", false); // Desmarca o checkbox
          }

          document.getElementById('addressModal').classList.add('hidden');
          document.getElementById('editAddressModal').classList.remove('hidden');

        });
        
        $(".closeEditAddressModal").on('click', function () {
          document.getElementById('editAddressModal').classList.add('hidden');
          document.getElementById('addressModal').classList.remove('hidden');
        });

        // Define o endereço selecionado automaticamente
        let enderecoSelecionado = enderecoPrincipal || ultimoEndereco;
        if (enderecoSelecionado) {
          // Chama a função para selecionar o endereço e recalcular o frete
          selecionarEndereco(enderecoSelecionado);
        }

        // Adiciona evento para recalcular o frete ao trocar o endereço
        $(".select-address").click(function () {
          let endereco = $(this).data("endereco");
          selecionarEndereco(endereco);
          $("#addressModal").addClass("hidden");
        });
        

        app.dialog.close();
      } else {
        app.dialog.close();
        console.error("Erro ao obter dados de endereços:", responseJson.message);
      }
    })
    .catch((error) => {
      app.dialog.close();
      console.error("Erro:", error);
      app.dialog.alert("Erro ao carregar endereços: " + error.message, "Falha na requisição!");
    });
}
// Fim Função Listar Endereços

  
  //Inicio Funçao Listar Categorias
  function finalizarCompra(
    formaPagamento,
    titular,
    numero_cartao,
    data_expiracao,
    cvc
  ) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    const pessoaId = localStorage.getItem("pessoaId");
    const enderecoEntregaId = localStorage.getItem("enderecoSelecionado");
  
    const data = {
      class: "PagamentoSafe2payRest",
      method: "IncluirVenda",
      dados: {
        pessoa_id: pessoaId,
        pagamento: {
          forma_pagamento: formaPagamento,
          titular: titular,
          numero_cartao: numero_cartao,
          data_expiracao: data_expiracao,
          cvc: cvc,
        },
        destinatario: {
          pessoa_id: pessoaId,
          endereco_id: enderecoEntregaId,
          frete: 0,
        },
      },
    };
  
    fetch(apiServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAuthToken,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "success"
        ) {
          // Dados a serem armazenados
          var data = {
            formaSelecionada: formaPagamento,
            linhaDigitavel: responseJson.data.data.boleto_linhadigitavel,
            pixKey: responseJson.data.data.pix_key,
            qrCodePix: responseJson.data.data.pix_qrcode,
            linkBoleto: responseJson.data.data.boleto_impressao,
            dataVencimento: responseJson.data.data.data_vencimento,
            valorTotal: responseJson.data.data.valor_total,
            pedidoId: responseJson.data.data.pedido_id,
            status_compra: responseJson.data.data.status_compra,
            status_mensagem: responseJson.data.data.status_mensagem,
            bandeira: responseJson.data.data.bandeira,
            cartao_numero: responseJson.data.data.cartao_numero,
            nome_cartao: responseJson.data.data.nome_cartao,
          };
  
          // Armazenar no localStorage
          localStorage.setItem("pagamentoData", JSON.stringify(data));
          localStorage.setItem(
            "pedidoIdPagamento",
            responseJson.data.data.pedido_id
          );
  
          app.dialog.close();
          app.views.main.router.navigate("/pagamento/");
  
          /* Abrir navegador para baixar boleto
              var ref = cordova.InAppBrowser.open(linkBoleto, '_system', 'location=no,zoom=no');
              ref.show();*/
        } else {
          app.dialog.close();
          app.dialog.alert(
            "Erro ao finalizar compra: " + responseJson,
            "Falha na requisição!"
          );
        }
        console.log("Success:", responseJson);
      })
      .catch((error) => {
        app.dialog.close();
        app.dialog.alert(
          "Erro ao finalizar compra: " + error,
          "Falha na requisição!"
        );
        console.error("Error:", error);
      });
  }
  //Fim Função Finalizar Compra
  
  //Inicio Função Refazer Pagamento
  function refazerPagamento(
    formaPagamento,
    titular,
    numero_cartao,
    data_expiracao,
    cvc
  ) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    const pedidoId = localStorage.getItem("pedidoIdPagamento");
  
    const data = {
      class: "PagamentoSafe2payRest",
      method: "PagamentoPedido",
      dados: {
        pedido_id: pedidoId,
        pagamento: {
          forma_pagamento: formaPagamento,
          titular: titular,
          numero_cartao: numero_cartao,
          data_expiracao: data_expiracao,
          cvc: cvc,
        },
      },
    };
  
    fetch(apiServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAuthToken,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "success"
        ) {
          // Dados a serem armazenados
          var data = {
            formaSelecionada: formaPagamento,
            linhaDigitavel: responseJson.data.data.boleto_linhadigitavel,
            pixKey: responseJson.data.data.pix_key,
            qrCodePix: responseJson.data.data.pix_qrcode,
            linkBoleto: responseJson.data.data.boleto_impressao,
            dataVencimento: responseJson.data.data.data_vencimento,
            valorTotal: responseJson.data.data.valor_total,
            pedidoId: responseJson.data.data.pedido_id,
            status_compra: responseJson.data.data.status_compra,
            status_mensagem: responseJson.data.data.status_mensagem,
            bandeira: responseJson.data.data.bandeira,
            cartao_numero: responseJson.data.data.cartao_numero,
            nome_cartao: responseJson.data.data.nome_cartao,
          };
  
          // Armazenar no localStorage
          localStorage.setItem("pagamentoData", JSON.stringify(data));
  
          app.dialog.close();
          app.views.main.router.navigate("/pagamento/");
  
          /* Abrir navegador para baixar boleto
              var ref = cordova.InAppBrowser.open(linkBoleto, '_system', 'location=no,zoom=no');
              ref.show();*/
        } else {
          app.dialog.close();
          app.dialog.alert(
            "Erro ao finalizar compra: " + responseJson,
            "Falha na requisição!"
          );
        }
        console.log("Success:", responseJson);
      })
      .catch((error) => {
        app.dialog.close();
        app.dialog.alert(
          "Erro ao finalizar compra: " + error,
          "Falha na requisição!"
        );
        console.error("Error:", error);
      });
  }
  //Fim Função Refazer Pagamento
  
  //Inicio Funçao Listar Carrinho
  function listarCarrinho() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    const pessoaId = localStorage.getItem("pessoaId");
  
    const dados = {
      pessoa_id: pessoaId,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PagamentoSafe2payRest",
      method: "ListarCarrinho",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "sucess"
        ) {
          // Supondo que responseJson seja o objeto que você obteve no console.log
          const quantidadeItens = responseJson.data.data.itens.length;
          const total = responseJson.data.data.total;
          var pessoaIdCarrinho = responseJson.data.data.pessoa_id;
  
          if (quantidadeItens > 0) {
            //TEM ITENS NO CARRINHO
            $("#toolbar-carrinho").removeClass("display-none");
            //ESVAZIAR A ÁREA DOS ITENS
            $("#listaCarrinho").empty();
  
            //PERCORRER O NOSSO CARRINHO E ALIMENTAR A ÁREA
            responseJson.data.data.itens.forEach((item) => {
              var itemDiv = `
              
                  <div class="flex space-x-4" style="margin-bottom: 18px;">
                    <img
                      src="https://vitatop.tecskill.com.br/${
                                    item.foto
                                  }"
                      alt="${item.nome}"
                      class="w-20 h-20 rounded-lg object-cover"
                    />
                    <div class="flex-1">
                      <div class="flex justify-between">
                        <h3 class="font-medium">${item.nome}</h3>
                        <button class="text-red-500 delete-item" style="width: 30px;"
                        data-produto-id="${
                                        item.produto_id
                                      }">
                          <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </div>
                      <p class="text-gray-500 text-sm mb-2">Premium</p>
                      <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                          <button
                            class="minus w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                            data-produto-id="${
                                            item.produto_id
                                          }" data-produto-qtde="${
                                            item.quantidade
                                          }"
                          >
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M20 12H4"
                              ></path>
                            </svg>
                          </button>
                          <span class="w-8 text-center">${
                            item.quantidade
                          }</span>
                          <button
                            class="plus w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                            data-produto-id="${
                                            item.produto_id
                                          }" data-produto-qtde="${
                                            item.quantidade
                                          }"
                          >
                            <svg
                              class="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 4v16m8-8H4"
                              ></path>
                            </svg>
                          </button>
                        </div>
                        <span class="font-semibold">${formatarMoeda(
                          item.preco_unitario
                        )}</span>
                      </div>
                    </div>
                  </div>
                          `;
  
              $("#listaCarrinho").append(itemDiv);
            });
  
            $(".delete-item").on("click", function () {
              var produtoId = $(this).data("produto-id");
              //CONFIRMAR
              app.dialog.confirm(
                "Tem certeza que quer remover este item?",
                "Remover",
                function () {
                  removerItemCarrinho(pessoaIdCarrinho, produtoId);
                }
              );
            });
  
            $(".minus").on("click", function () {
              var produtoId = $(this).data("produto-id");
              var quantidade = $(this).data("produto-qtde");
              var qtdeAtualizada = quantidade - 1;
  
              //SE TEM MAIS DE UM ITEM NA QUANTIDADE
              if (quantidade > 1) {
                alterarCarrinho(pessoaIdCarrinho, produtoId, qtdeAtualizada);
              } else {
                app.dialog.confirm(
                  `Gostaria de remover este item?`,
                  "REMOVER",
                  function () {
                    removerItemCarrinho(pessoaIdCarrinho, produtoId);
                  }
                );
              }
            });
  
            $(".plus").on("click", function () {
              var produtoId = $(this).data("produto-id");
              var quantidade = $(this).data("produto-qtde");
              var qtdeAtualizada = quantidade + 1;
  
              alterarCarrinho(pessoaIdCarrinho, produtoId, qtdeAtualizada);
            });
  
            //MOSTRAR O SUBTOTAL
            $("#subtotal").html(
              total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            );
            //MOSTRAR O SUBTOTAL
            $("#totalCarrinho").html(
              total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            );
          } else {
            //MOSTRAR CARRINHO VAZIO
            //ESVAZIAR LISTA DO CARRINHO
            $("#listaCarrinho").empty();
  
            //SUMIR OS ITENS DE BAIXO BOTÃO E TOTAIS
            $("#toolbar-carrinho").addClass("display-none");
  
            //MOSTRAR SACOLINHA VAZIA
            $("#listaCarrinho").html(`
                          <div class="text-align-center">
                              <img width="300" src="img/empty.gif">
                              <br><span class="color-gray">Nada por enquanto...</span>
                          </div>
                      `);
          }
  
          
          listarEnderecos(); 
          app.dialog.close();          
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao listar carrinho: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Listar Carrinho
  
  //Inicio Funçao Alterar Carrinho
  function alterarCarrinho(pessoaId, produtoId, quantidade) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
  
    const dados = {
      pessoa_id: pessoaId,
      produto_id: produtoId,
      quantidade: quantidade,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PagamentoSafe2payRest",
      method: "AlterarCarrinho",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "sucess"
        ) {
          console.log(responseJson)
          // Sucesso na alteração
          app.views.main.router.refreshPage();
          app.dialog.close();
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao alterar carrinho: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Alterar Carrinho
  
  //Inicio Adicionar Endereço
  function adicionarEndereco() {
    app.dialog.preloader("Carregando...");
  
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
    // Captura os valores dos inputs
    var nomeEndereco = $("#nomeEndereco").val();
    var cep = $("#cepCliente").val();
    var logradouro = $("#logradouroEndCliente").val();
    var numero = $("#numeroEndCliente").val();
    var complemento = $("#complementoEndCliente").val();
    var bairro = $("#bairroEndCliente").val();
    var cidade = $("#cidadeEndCliente").val();
    var estado = $("#estadoEndCliente").val();
    var isPrincipal = $("#defaultAddress").prop("checked") ? "S" : "N";
  
    const dados = {
      pessoa_id: pessoaId,
      nome_endereco: nomeEndereco,
      cep: cep,
      endereco: logradouro,
      numero: numero,
      complemento: complemento,
      bairro: bairro,
      cidade: cidade,
      estado: estado,
      tipo: 1,
      is_principal: isPrincipal
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "EnderecoRest",
      method: "salvarEnderecoEntrega",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "success"
        ) {
          // Sucesso na alteração
          var toastCenter = app.toast.create({
            text: `Endereço adicionado com sucesso`,
            position: "center",
            closeTimeout: 2000,
          });
          listarEnderecos();
          toastCenter.open();
          app.dialog.close();
          $("#newAddressModal").addClass("hidden");
          $("#addressModal").addClass("hidden");
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao alterar carrinho: " + error.message,
          "Falha na requisição!"
        );
        $("#newAddressModal").addClass("hidden");
        $("#addressModal").addClass("hidden");
      });
  }
  //Fim Função Adicionar Endereço
  
  //Inicio Editar Endereço
  function editarEndereco() {
    app.dialog.preloader("Carregando...");
  
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
    // Captura os valores dos inputs
    var enderecoId = $("#idEnderecoEdit").val();
    var nomeEndereco = $("#nomeEnderecoEdit").val();
    var cep = $("#cepEdit").val();
    var logradouro = $("#logradouroEndEdit").val();
    var numero = $("#numeroEndEdit").val();
    var complemento = $("#complementoEndEdit").val();
    var bairro = $("#bairroEndEdit").val();
    var cidade = $("#cidadeEndEdit").val();
    var estado = $("#estadoEndEdit").val();
    var isPrincipal = $("#defaultAddressEdit").prop("checked") ? "S" : "N";
  
    const dados = {
      endereco_id: enderecoId,
      pessoa_id: pessoaId,
      nome_endereco: nomeEndereco,
      cep: cep,
      endereco: logradouro,
      numero: numero,
      complemento: complemento,
      bairro: bairro,
      cidade: cidade,
      estado: estado,
      tipo: 1,
      is_principal: isPrincipal
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "EnderecoRest",
      method: "salvarEnderecoEntrega",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "success"
        ) {
          app.dialog.close();
          // Sucesso na alteração
          var toastCenter = app.toast.create({
            text: `Endereço editado com sucesso`,
            position: "center",
            closeTimeout: 2000,
          });
          listarEnderecos();
          toastCenter.open();
          $("#editAddressModal").addClass("hidden");
          $("#addressModal").addClass("hidden");
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao alterar carrinho: " + error.message,
          "Falha na requisição!"
        );
        $("#editAddressModal").addClass("hidden");
        $("#addressModal").addClass("hidden");
      });
  }
  //Fim Função Editar Endereço

  //Inicio Adicionar Item Carrinho
  function adicionarItemCarrinho(produtoId) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
    app.dialog.preloader("Carregando...");
  
    const dados = {
      pessoa_id: pessoaId,
      produto_id: produtoId,
      quantidade: 1,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PagamentoSafe2payRest",
      method: "IncluirCarrinho",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "sucess"
        ) {
          // Sucesso na alteração
          var toastCenter = app.toast.create({
            text: `Produto adicionado ao carrinho`,
            position: "center",
            closeTimeout: 2000,
          });
  
          toastCenter.open();
          app.dialog.close();
          app.views.main.router.navigate("/produtos/");
        } else {
          app.dialog.close();
          app.dialog.alert(
            "Erro ao alterar carrinho: " + responseJson.data.message,
            responseJson.data.status
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao alterar carrinho: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Adicionar Item Carrinho
  
  //Inicio Remover Item do Carrinho
  function removerItemCarrinho(pessoaId, produtoId) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    console.log(pessoaId);
    console.log(produtoId);
    const dados = {
      pessoa_id: pessoaId,
      produto_id: produtoId,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PagamentoSafe2payRest",
      method: "ExcluirCarrinho",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        app.dialog.close();
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "sucess"
        ) {
          // Sucesso na alteração
          app.views.main.router.refreshPage();
        } else {
          app.dialog.alert(
            "Erro ao alterar carrinho: " + responseJson.data.message,
            responseJson.data.status
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao alterar carrinho: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Remover Item do Carrinho
  
  //Inicio Funçao Esvaziar Carrinho
  function limparCarrinho() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
    app.dialog.preloader("Carregando...");
  
    const dados = {
      pessoa_id: pessoaId,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PagamentoSafe2payRest",
      method: "LimparCarrinho",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "sucess"
        ) {
          // Sucesso na alteração
          app.views.main.router.refreshPage();
          app.dialog.close();
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao alterar carrinho: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Esvaziar Carrinho
  
  //Inicio Funçao contar Carrinho
  function contarCarrinho() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
  
    const dados = {
      pessoa_id: pessoaId,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PagamentoSafe2payRest",
      method: "ListarCarrinho",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "sucess"
        ) {
          // Supondo que responseJson seja o objeto que você obteve no console.log
          const quantidadeItens = responseJson.data.data.itens.length;
          $(".btn-cart").attr("data-count", quantidadeItens);
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao listar carrinho: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função contar Carrinho
  
  //Inicio Funçao Dados Dashboard
  function onDashboard() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
  
    const dados = {
      pessoa_id: pessoaId,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PessoaContadorRest",
      method: "RetornaDados",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "success"
        ) {
          //Desenha o dashboard
          $("#valorVenda").text(responseJson.data.dados.valor_venda_mes);
          $("#qtdeGeral").text(responseJson.data.dados.rede_geral);
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao listar carrinho: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Dados Dashboard
  
  //Inicio Funçao Listar Carrinho Checkout
  function listarCarrinhoCheckout() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    const pessoaId = localStorage.getItem("pessoaId");
  
    const dados = {
      pessoa_id: pessoaId,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PagamentoSafe2payRest",
      method: "ListarCarrinho",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "sucess"
        ) {
          console.log(responseJson);
          // Supondo que responseJson seja o objeto que você obteve no console.log
          const quantidadeItens = responseJson.data.data.itens.length;
          const subtotal = responseJson.data.data.total;
          let valor_frete = responseJson.data.data.valor_frete;
          const total = parseFloat(subtotal) + parseFloat(valor_frete);
  
          var pessoaIdCarrinho = responseJson.data.data.pessoa_id;
  
          if (quantidadeItens > 0) {
            //TEM ITENS NO CARRINHO
            $("#listaItensConfirmation").empty();
  
            //PERCORRER O NOSSO CARRINHO E ALIMENTAR A ÁREA
            responseJson.data.data.itens.forEach((item) => {
              var itemLi = `
                          <!-- ITEM DO CARRINHO-->
                          <li class="item-carrinho">
                                  <img src="https://vitatop.tecskill.com.br/${
                                    item.foto
                                  }" width="40px">
                              <div class="area-details">
                                  <div class="sup">
                                      <span class="name-prod">
                                      ${item.nome}
                                      </span>
                                  </div>
                                  <div class="preco-quantidade">
                                      <span>${formatarMoeda(
                                        item.preco_unitario
                                      )}</span>
                                      <div class="count">
                                          <input readonly class="qtd-item" type="text" value="${
                                            item.quantidade
                                          }">
                                      </div>
                                  </div>
                              </div>
                          </li>
                          `;
  
              $("#listaItensConfirmation").append(itemLi);
            });
  
            //MOSTRAR O SUBTOTAL
            if (valor_frete == 0) {
              $("#freteCheckout").html("GRÁTIS");
            } else {
              $("#freteCheckout").html(formatarMoeda(valor_frete));
            }
            $("#subTotalCheckout").html(formatarMoeda(subtotal));
            $("#totalCheckout").html(formatarMoeda(total));
          }
  
          app.dialog.close();
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao listar carrinho: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Listar Carrinho Checkout
  
  //Inicio Funçao Listar Equipe
  function listarEquipe() {
    var userAuthToken = localStorage.getItem("userAuthToken");
    app.dialog.preloader("Carregando...");
    const pessoaId = localStorage.getItem("pessoaId");
  
    const dados = {
      pessoa_id: pessoaId,
    };
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "PessoaRestService",
      method: "ListaRede",
      dados: dados,
    });
  
    // Opções da requisição
    const options = {
      method: "POST",
      headers: headers,
      body: body,
    };
  
    // Fazendo a requisição
    fetch(apiServerUrl, options)
      .then((response) => response.json())
      .then((responseJson) => {
        // Verifica se o status é 'success'
        if (responseJson.status === "success") {
          const data = responseJson.data;
          app.dialog.close();
  
          // Limpa o container de árvore
          $("#treeContainer").empty();
  
          // Encontra o nó principal
          const root = data.find((member) => member.pid === null);
          if (root) {
            // Insere o nó principal
            $("#treeContainer").append(`
                          <div class="node">
                              <img src="${root.img}" alt="${root.name}">
                              <div class="name">${root.name}</div>
                              <div class="title">${root.title}</div>
                          </div>
                          <div class="branch" id="branch-${root.id}"></div>
                      `);
  
            // Filtra os filhos do nó principal
            const children = data.filter((member) => member.pid === root.id);
  
            // Insere cada filho no branch do nó principal
            children.forEach((child) => {
              $(`#branch-${root.id}`).append(`
                              <div class="node">
                                  <img src="${child.img}" alt="${child.name}">
                                  <div class="name">${child.name}</div>
                                  <div class="title">${child.title}</div>
                              </div>
                          `);
            });
          }
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao listar Equipe: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Listar Equipe
  
  //Inicio da Funçao formatar Moeda
  function formatarMoeda(valor) {
    var precoFormatado = parseFloat(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return precoFormatado;
  }
  //Fim da Funçao formatar Moeda
  
  // Função para truncar o nome do produto
  const truncarNome = (nome, limite) => {
    return nome.length > limite ? nome.substring(0, limite) + "..." : nome;
  };
  // Fim Função para truncar o nome do produto
  
  // Função para limpar o local storage
  function clearLocalStorage() {
    localStorage.removeItem("produtoId");
    localStorage.removeItem("enderecoSelecionado");
    localStorage.removeItem("produto");
    localStorage.removeItem("enderecoDetalhes");
    localStorage.removeItem("emailRecuperacao");
  }
  // Fim Função para limpar o local storage
  
  // Função para limpar o local storage
  function fazerLogout() {
      localStorage.removeItem("userAuthToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("pessoaId");
      localStorage.removeItem("codigo_indicador");
      localStorage.removeItem("validadeToken");
    }
    // Fim Função para limpar o local storage
  
  // Início Função para formatar data e hora
  function formatarData(data) {
    // Converte a string de data para objeto Date
    const dateObj = new Date(data);
  
    // Array com os nomes dos meses em português
    const meses = [
      "JAN",
      "FEV",
      "MAR",
      "ABR",
      "MAI",
      "JUN",
      "JUL",
      "AGO",
      "SET",
      "OUT",
      "NOV",
      "DEZ",
    ];
  
    // Extrai o dia, mês, ano, hora e minuto
    const dia = dateObj.getDate();
    const mes = meses[dateObj.getMonth()];
    const ano = dateObj.getFullYear();
    const horas = dateObj.getHours();
    const minutos = dateObj.getMinutes();
  
    // Formata a hora e minuto com dois dígitos
    const horasFormatadas = horas.toString().padStart(2, "0");
    const minutosFormatados = minutos.toString().padStart(2, "0");
  
    // Retorna a data e hora formatadas
    return `${dia} ${mes} ${ano} ${horasFormatadas}:${minutosFormatados}`;
  }
  // Fim da Função formatar data e hora
  
  //Inicio da função para copiar
  function copiarParaAreaDeTransferencia(texto) {
    // Cria um elemento de texto temporário
    var tempElement = document.createElement("textarea");
    tempElement.value = texto;
    document.body.appendChild(tempElement);
  
    // Seleciona o texto e copia para a área de transferência
    tempElement.select();
    tempElement.setSelectionRange(0, 99999); // Para dispositivos móveis
    document.execCommand("copy");
  
    // Remove o elemento temporário
    document.body.removeChild(tempElement);
  
    // Alerta para informar ao usuário que a linha digitável foi copiada
    app.dialog.alert(
      "Linha digitável copiada para a área de transferência!",
      "Cópia"
    );
  }
  //Fim da função para copiar
  
  //Inicio função compartilhar
  function onCompartilhar(titulo, texto, url) {
    if (navigator.share) {
      navigator
        .share({
          title: titulo,
          text: texto,
          url: url,
        })
        .then(() => {})
        .catch((error) => {
          console.error("Erro ao compartilhar:", error);
        });
    } else {
      alert("Compartilhamento não suportado neste navegador.");
    }
  }
  async function shareLink(shareTitle, shareText, link) {
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: link,
    };
    try {
      await navigator.share(shareData);
    } catch (e) {
      console.error(e);
    }
  }
  //Fim função compartilhar
  
  // Função para validar a data no formato MM/YYYY
  function validarDataExpiracao(data) {
    const regex = /^(0[1-9]|1[0-2])\/\d{4}$/; // Aceita de 01 a 12 para MM e 4 dígitos para o ano
    return regex.test(data);
  }
  
  function timeAgo(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const seconds = Math.floor((now - notificationDate) / 1000);
  
    if (seconds < 60) return "Agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Há ${days} dia${days > 1 ? "s" : ""}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `Há ${months} mês${months > 1 ? "es" : ""}`;
    const years = Math.floor(days / 365);
    return `Há ${years} ano${years > 1 ? "s" : ""}`;
  }

  
  function oneSignalLogin(userId, oneSignalId){          
      if(userId != oneSignalId){
          OneSignal.logout();
          OneSignal.Notifications.requestPermission();   
          // Define o ID externo no OneSignal
          OneSignal.login(userId)
            .then(() => {
              console.log(`ID externo definido com sucesso: ${userId}`);
            })
            .catch((error) => {
              console.error(`Erro ao definir ID externo: ${error}`);
            });
        } else{
          OneSignal.Notifications.requestPermission();   
          OneSignal.login(userId)
            .then(() => {
              console.log(`ID externo definido com sucesso: ${userId}`);
            })
            .catch((error) => {
              console.error(`Erro ao definir ID externo: ${error}`);
            });        
        }
           
  }