// Início função validar login
async function validarToken(userAuthToken) {
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
    app.dialog.preloader("Carregando...");
  
    var imgUrl = "https://vitatop.tecskill.com.br/";
  
    // Cabeçalhos da requisição
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
  
    const body = JSON.stringify({
      class: "ProdutoVariacaoRest",
      method: "load",
      id: produtoId,
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
          const detalhes = responseJson.data;
  
          $("#product-name").html(detalhes.nome);
          $("#descricao-detalhe").html(detalhes.descricao_app);
  
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
                          data-id-venda="${venda.pedido_id}">
                             <div class="card-principal">
                                <div class="card-header open header-pago">
                                   <div class="date">${formatarData(
                                     venda.data_criacao
                                   )}</div>
                                   <div class="status">${
                                     venda.cliente.status_compra
                                   }</div>
                                </div>
                                <div class="card-body">
                                   <div class="name">PEDIDO #${
                                     venda.pedido_id
                                   }</div>
                                   <div class="details">
                                      <div class="detail">
                                         <span>Nº</span>
                                         <span>${venda.pedido_id}</span>
                                      </div>
                                      <div class="detail">
                                         <span class="mdi mdi-cash-multiple"></span>
                                         <span>${
                                           venda.forma_pagamento.opcao
                                         }</span>
                                      </div>
                                      <div class="detail">
                                         <span>Total</span>
                                         <span>${formatarMoeda(
                                           venda.cliente.valor_total
                                         )}</span>
                                      </div>
                                      <div class="detail">
                                         <span>A pagar</span>
                                         <span>${formatarMoeda(
                                           venda.cliente.valor_total
                                         )}</span>
                                      </div>
                                      <div class="items">${venda.pedido_id}</div>
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
            localStorage.setItem("pedidoId", vendaId);
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
  
          // Remover a classe display-none para exibir os campos preenchidos
          document
            .getElementById("divLogradouroCliente")
            .classList.remove("display-none");
          document
            .getElementById("divNumeroCliente")
            .classList.remove("display-none");
          document
            .getElementById("divComplementoCliente")
            .classList.remove("display-none");
          document
            .getElementById("divBairroCliente")
            .classList.remove("display-none");
          document
            .getElementById("divCidadeCliente")
            .classList.remove("display-none");
          document
            .getElementById("divEstadoCliente")
            .classList.remove("display-none");
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
  
  //Inicio Funçao Listar Endereços
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
        // Verifica se o status é 'success' e se há dados de pedidos
        if (responseJson.data.status === "success") {
          const enderecos = responseJson.data.data.enderecos;
          $("#listaDeEnderecos").html("");
  
          // Gera a lista de endereços
          enderecos.forEach((endereco, index) => {
            var complemento = endereco.complemento
              ? `<span>${endereco.complemento}</span>`
              : "";
            var enderecoHTML = `
                          <div class="card-content card-content-padding" style="background:#fff; border-radius: 10px;"> 
                              <div class="row" style="display: flex; margin-bottom:8px;">
                                  <div class="col-80">
                                      <span>${endereco.rua}</span>, <span>${endereco.numero}</span><br>
                                      <span>${complemento}</span> Bairro: <span>${endereco.bairro}</span><br>
                                      <span>${endereco.municipio.nome}</span> - <span>${endereco.estado.sigla}</span><br>
                                      CEP: <span>${endereco.cep}</span><br>
                                  </div>
                                  <div class="col-20"><br>
                                      <a href="#" 
                                      data-entrega-id="${endereco.id}"
                                      data-entrega-rua="${endereco.rua}"
                                      data-entrega-numero="${endereco.numero}"
                                      data-entrega-complemento="${complemento}"
                                      data-entrega-bairro="${endereco.bairro}"
                                      data-entrega-cidade="${endereco.municipio.nome}"
                                      data-entrega-estado="${endereco.estado.sigla}"
                                      data-entrega-cep="${endereco.cep}"
                                       class="link click-endereco"><b class="text-skin">Selecionar</b></a>
                                  </div>
                              </div>
                          </div>
                      `;
  
            $("#listaDeEnderecos").append(enderecoHTML);
          });
  
          // Adiciona o evento de clique para atualizar o endereço selecionado
          $(".click-endereco").on("click", function (e) {
            e.preventDefault();
            const enderecoId = $(this).data("entrega-id");
  
            // Atualiza o localStorage com o ID do endereço selecionado
            var enderecoDetalhes = {
              enderecoId: $(this).data("entrega-id"),
              endEntregaRua: $(this).data("entrega-rua"),
              endEntregaNumero: $(this).data("entrega-numero"),
              endEntregaComplemento: $(this).data("entrega-complemento"),
              endEntregaBairro: $(this).data("entrega-bairro"),
              endEntregaCidade: $(this).data("entrega-cidade"),
              endEntregaEstado: $(this).data("entrega-estado"),
              endEntregaCep: $(this).data("entrega-cep"),
            };
            localStorage.setItem(
              "enderecoDetalhes",
              JSON.stringify(enderecoDetalhes)
            );
  
            selecionarEndereco(enderecoId);
            // Fechar o dialog ou outra ação necessária após seleção do endereço
            app.popup.close();
  
            var toastCenter = app.toast.create({
              text: `Endereço de entrega alterado`,
              position: "center",
              closeTimeout: 2000,
            });
  
            toastCenter.open();
          });
  
          // Fechar o dialog ou outra ação necessária após preenchimento do select
          app.dialog.close();
        } else {
          app.dialog.close();
          // Tratar caso o status não seja "success"
          console.error(
            "Erro ao obter dados de endereços:",
            responseJson.message
          );
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao carregar endereços: " + error.message,
          "Falha na requisição!"
        );
      });
  }
  //Fim Função Listar Endereços
  
  //Inicio Funçao Selecionar Endereço
  function selecionarEndereco(enderecoId) {
    var userAuthToken = localStorage.getItem("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
  
    const dados = {
      pessoa_id: pessoaId,
      endereco_id: enderecoId,
    };
  
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
        // Verifica se o status é 'success'
        if (
          responseJson.status == "success" &&
          responseJson.data.status == "success"
        ) {
          // Dados a serem armazenados
          var valorFrete = responseJson.data.data.frete;
          console.log(valorFrete);
  
          //MOSTRAR O VALOR FRETE
          $("#freteCarrinho").html(
            "Alterar " +
              valorFrete.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
          );
        }
      })
      .catch((error) => {
        console.error("Erro:", error);
      });
  }
  //Fim Função Selecionar Endereço
  
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
    var enderecoDetalhes = JSON.parse(localStorage.getItem("enderecoDetalhes"));
    const enderecoEntregaId = enderecoDetalhes.enderecoId;
  
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
                          <!-- ITEM DO CARRINHO-->
                          <div class="item-carrinho">
                              <div class="area-img">
                                  <img src="https://vitatop.tecskill.com.br/${
                                    item.foto
                                  }">
                              </div>
                              <div class="area-details">
                                  <div class="sup">
                                      <span class="name-prod">
                                      ${item.nome}
                                      </span>
                                      <a data-produto-id="${
                                        item.produto_id
                                      }" class="delete-item" href="#">
                                          <i class="mdi mdi-close"></i>
                                      </a>
                                  </div>
                                  <div class="preco-quantidade">
                                      <span>${formatarMoeda(
                                        item.preco_unitario
                                      )}</span>
                                      <div class="count">
                                          <a class="minus" data-produto-id="${
                                            item.produto_id
                                          }" data-produto-qtde="${
                item.quantidade
              }" href="#">-</a>
                                          <input readonly class="qtd-item" type="text" value="${
                                            item.quantidade
                                          }">
                                          <a class="plus" data-produto-id="${
                                            item.produto_id
                                          }" data-produto-qtde="${
                item.quantidade
              }" href="#">+</a>
                                      </div>
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
    var cep = $("#cepCliente").val();
    var logradouro = $("#logradouroEndCliente").val();
    var numero = $("#numeroEndCliente").val();
    var complemento = $("#complementoEndCliente").val();
    var bairro = $("#bairroEndCliente").val();
    var cidade = $("#cidadeEndCliente").val();
    var estado = $("#estadoEndCliente").val();
  
    const dados = {
      pessoa_id: pessoaId,
      cep: cep,
      endereco: logradouro,
      numero: numero,
      complemento: complemento,
      bairro: bairro,
      cidade: cidade,
      estado: estado,
      tipo: 1,
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
          app.popup.close(".popup-novo-endereco");
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert(
          "Erro ao alterar carrinho: " + error.message,
          "Falha na requisição!"
        );
        app.popup.close(".popup-novo-endereco");
      });
  }
  //Fim Função Adicionar Endereço
  
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
            text: `${produto.nome} adicionado ao carrinho`,
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