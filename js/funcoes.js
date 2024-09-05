// Início função validar login
async function validarToken(userAuthToken) {
    if (userAuthToken) {
        const apiServerUrl = 'https://escritorio.g3pay.com.br/rest.php';

        const headers = {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + userAuthToken,
        };

        const body = JSON.stringify({
            class: "ProdutoCategoriaRest",
            method: "loadAll",
            limit: "1"
        });

        const options = {
            method: "POST",
            headers: headers,
            body: body,
        };

        try {
            const response = await fetch(apiServerUrl, options);
            const data = await response.json();
            if (data.status == 'success') {
                // Token válido, continua na página atual
                return true;
            } else {
                // Token inválido, redireciona para a página de login
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar token:', error);
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
    app.dialog.preloader("Carregando...");

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "ProdutoCategoriaRest",
        method: "listarCategorias",
        limit: 10
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
            if (responseJson.status === "success" && responseJson.data && responseJson.data.data) {
                const categorias = responseJson.data.data;

                // Adiciona a opção Todas ao inicio
                var opcaoTodasHTML = '<div class="swiper-slide"><button class="filter-btn active">TODAS</button></div>';
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

                $(".filter-btn").on('click', function () {
                    // Remove a classe active de todos os botões
                    $(".filter-btn").removeClass("active");
                    // Adiciona a classe active ao botão clicado
                    $(this).addClass("active");
                    // Pega o id da categoria clicada
                    var categoriaId = $(this).data("id");
                    // Chama a função listarProdutos com o id da categoria
                    listarProdutos('', categoriaId);
                });

                app.dialog.close();
            } else {
                app.dialog.close();
                // Verifica se há uma mensagem de erro definida
                const errorMessage = responseJson.message || "Formato de dados inválido";
                app.dialog.alert("Erro ao carregar categorias: " + errorMessage, "Falha na requisição!");
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar categorias: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Lista categorias

//Inicio Funçao listar produtos tela Home
function listarProdutos(searchQuery = "", categoriaId) {
    app.dialog.preloader("Carregando...");

    var imgUrl = "https://escritorio.g3pay.com.br/";

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "ProdutoVariacaoRest",
        method: "listarProdutos",
        categoria_id: categoriaId,
        search: searchQuery,
        limit: 30
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
            if (responseJson.status === "success" && responseJson.data && responseJson.data.data) {
                const produtos = responseJson.data.data;
                $("#container-produtos").empty();

                produtos.forEach((produto) => {
                    var imgUrl = "https://escritorio.g3pay.com.br/";
                    const imagemProduto = produto.foto ? imgUrl + produto.foto : 'img/default.png';
                    const nomeProduto = truncarNome(produto.nome, 18);
                    const rating = 5;

                    var produtoHTML = `
                    <!-- ITEM CARD-->
                    <div class="item-card">
                        <a data-id="${produto.id}" 
                        data-nome="${produto.nome}" 
                        data-preco2="${produto.preco2}"
                        data-imagem="${imagemProduto}"
                        href="#" class="item">
                            <div class="img-container">
                                <img src="${imagemProduto}">
                            </div>
                            <div class="nome-rating">
                                <span class="color-gray">${nomeProduto.toLocaleUpperCase()}</span>
                            </div>                      
                            <div class="star-rating">
                                <span class="star"></span>
                                <span class="star"></span>
                                <span class="star"></span>
                                <span class="star"></span>
                                <span class="star"></span>
                            </div>
                            <div class="price">${formatarMoeda(produto.preco2)}</div>
                        </a>
                    </div>
                    `;
                    $("#container-produtos").append(produtoHTML);
                    // Selecionar as estrelas apenas do produto atual
                    const stars = $("#container-produtos").children().last().find('.star-rating .star');

                    // Preencher as estrelas conforme o rating do produto atual
                    for (let i = 0; i < rating; i++) {
                        stars[i].classList.add('filled');
                    }

                });
                $(".item").on('click', function () {
                    var id = $(this).attr('data-id');
                    var nomeProduto = $(this).attr('data-nome');
                    var preco2 = $(this).attr('data-preco2');
                    var imagem = $(this).attr('data-imagem');
                    localStorage.setItem('produtoId', id);
                    const produto = {
                        id: id,
                        imagem: imagem,
                        nome: nomeProduto,
                        rating: 5,
                        likes: 5,
                        reviews: 5,
                        preco: preco2,
                        preco_promocional: preco2
                    };
                    localStorage.setItem('produto', JSON.stringify(produto));
                    app.views.main.router.navigate('/detalhes/');
                });

                app.dialog.close();
            } else {
                app.dialog.close();
                // Verifica se há uma mensagem de erro definida
                const errorMessage = responseJson.message || "Formato de dados inválido";
                app.dialog.alert("Erro ao carregar pedidos: " + errorMessage, "Falha na requisição!");
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar pedidos: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Lista produtos

//Inicio Função Detalhes Produto 
function buscarProduto(produtoId) {
    app.dialog.preloader("Carregando...");

    var imgUrl = "https://escritorio.g3pay.com.br/";

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "ProdutoVariacaoRest",
        method: "load",
        id: produtoId
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
                $("#descricao-detalhe").html(detalhes.descricao_app);

                app.dialog.close();
            } else {
                app.dialog.close();
                // Verifica se há uma mensagem de erro definida
                const errorMessage = responseJson.message || "Formato de dados inválido";
                app.dialog.alert("Erro ao carregar produtos: " + errorMessage, "Falha na requisição!");
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar produtos: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Detalhes Produto 

//Inicio Função obter Links
function buscarLinks(produtoId) {
    app.dialog.preloader("Carregando...");

    var imgUrl = "https://escritorio.g3pay.com.br/";

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "ProdutoLinkRest",
        method: "loadAll",
        filters: [["produto_id", "=", produtoId]]

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
                let linkLandingPage = '';

                //Limpa o container antes de copular
                $('#qrcode').html('');
                $('#ul-links').html('');

                links.forEach((link) => {
                    const linkUrl = truncarNome(link.link_url, 50);
                    var linkHTML = `
                    <li class="link-list-item">
                      <div class="col-85">
                        <h3>${link.nome}</h3>
                        <p>${linkUrl}</p>
                      </div>
                      <span class="mdi mdi-share compartilhar-link col-15" data-link="${link.link_url}"></span>
                    </li>
                    `;

                    $("#ul-links").append(linkHTML);

                    // Verifica se o tipo_link é igual a 1 e armazena o link_url
                    if (link.tipo_link === "1") {
                        linkLandingPage = link.link_url;
                    }
                });

                $("#shareLanding").on('click', function () {
                    // Pega o url do link clicado em share
                    //Abre opção compartilhamento
                    window.plugins.socialsharing.share(null, 'Link do produto', null, linkLandingPage);
                });

                $(".compartilhar-link").on('click', function () {
                    // Pega o url do link clicado em share
                    var linkUrl = $(this).data("link");
                    //Abre opção compartilhamento
                    window.plugins.socialsharing.share(null, 'Link do produto', null, linkUrl);
                });
                

                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    text: linkLandingPage,
                    width: 130,
                    height: 130,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                app.dialog.close();
            } else {
                app.dialog.close();
                // Verifica se há uma mensagem de erro definida
                const errorMessage = responseJson.message || "Formato de dados inválido";
                app.dialog.alert("Erro ao carregar links: " + errorMessage, "Falha na requisição!");
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar links: " + error.message, "Falha na requisição!");
        });
}
//Fim Função obter Links

//Inicio Função obter id da Pessoa
function buscarPessoaId(userId) {
    app.dialog.preloader("Carregando...");

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PessoaRest",
        method: "loadAll",
        filters: [["user_id", "=", userId]]

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
                localStorage.setItem('pessoaId', pessoaId)
                app.dialog.close();
            } else {
                app.dialog.close();
                // Verifica se há uma mensagem de erro definida
                const errorMessage = responseJson.message || "Formato de dados inválido";
                app.dialog.alert("Erro ao carregar pessoa: " + errorMessage, "Falha na requisição!");
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar pessoa: " + error.message, "Falha na requisição!");
        });
}
//Fim Função obter id da Pessoa

//Inicio Função obter Link Afiliado
function buscarLinkAfiliado() {
    const pessoaId = localStorage.getItem('pessoaId');
    app.dialog.preloader("Carregando...");

    var imgUrl = "https://escritorio.g3pay.com.br/";

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PessoaRestService",
        method: "LinkIndicador",
        dados: {pessoa_id: pessoaId}
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
                $('#qrcode').html('');
                
                
                $("#compartilharLink").on('click', function () {
                    // Pega o url do link clicado em share
                    //Abre opção compartilhamento
                    window.plugins.socialsharing.share(null, 'Link do produto', null, linkUrl);
                });

                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    text: linkUrl,
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                app.dialog.close();
            } else {
                app.dialog.close();
                // Verifica se há uma mensagem de erro definida
                const errorMessage = responseJson.message || "Formato de dados inválido";
                app.dialog.alert("Erro ao carregar links: " + errorMessage, "Falha na requisição!");
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar pessoa: " + error.message, "Falha na requisição!");
        });
}
//Fim Função obter Link Afiliado


//Inicio Funçao listar pedidos tela Pedidos
function listarPedidos(searchQuery = "") {
    var pessoaId = localStorage.getItem('pessoaId');
    app.dialog.preloader("Carregando...");

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PedidoVendaRest",
        method: "ListarPedidos",
        pessoa_id: pessoaId,
        limit: 15
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
            if (responseJson.status === "success" && responseJson.data && responseJson.data.data) {
                const pedidos = responseJson.data.data;
                const pedidosContainer = document.getElementById("container-pedidos");
                pedidosContainer.innerHTML = "";

                pedidos.forEach((pedido) => {
                    const pedidosHTML = `                    
                        <div class="card-list" 
                        data-id-pedido="${pedido.id}">
                           <div class="card-principal">
                              <div class="card-header open header-pago">
                                 <div class="date">${formatarData(pedido.data_emissao)}</div>
                                 <div class="status">${pedido.mensagem_compra}</div>
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
                                       <span>${formatarMoeda(pedido.valor_total)}</span>
                                    </div>
                                    <div class="detail">
                                       <span>A pagar</span>
                                       <span>${formatarMoeda(pedido.valor_total)}</span>
                                    </div>
                                    <div class="items">${pedido.quantidade_itens}</div>
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
                    localStorage.setItem('pedidoId', pedidoId);
                    app.views.main.router.navigate("/resumo-pedido/");
                });

                app.dialog.close();
            } else {
                app.dialog.close();
                // Verifica se há uma mensagem de erro definida
                const errorMessage = responseJson.message || "Formato de dados inválido";
                app.dialog.alert("Erro ao carregar pedidos: " + errorMessage, "Falha na requisição!");
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar pedidos: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Lista tela Pedidos


// Início da função detalhesPedido
function detalhesPedido() {
    var pedidoId = localStorage.getItem('pedidoId');
    app.dialog.preloader("Carregando...");

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PedidoVendaRest",
        method: "ListarPedidos",
        id: pedidoId
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
            if (responseJson.status === "success" && responseJson.data && responseJson.data.data) {
                const detalhes = responseJson.data.data[0];
                const detalhesContainer = document.getElementById("detalhesPedidos");
                detalhesContainer.innerHTML = "";

                // Formata a data e moeda
                const formatarData = (data) => new Date(data).toLocaleString();
                const formatarMoeda = (valor) => `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;

                // Monta o HTML dos itens do pedido
                const itensHTML = detalhes.itens.map(item => `
                    <li>
                        <img src="https://escritorio.g3pay.com.br/${item.foto}" alt="${item.descricao}" style="width: 50px; height: 50px;"/>
                        <span class="item-name">${item.descricao}</span>
                        <span class="item-quantity">${item.quantidade}x</span>
                        <span class="item-price">${formatarMoeda(item.preco_total)}</span>
                    </li>
                `).join('');

                // Monta o HTML completo
                const detalhesHTML = `
                    <div class="order-summary">
                        <div class="order-details">
                            <p><h3>Número do Pedido: #${detalhes.id}</h3></p>
                            <p><strong>Data do Pedido:</strong> ${formatarData(detalhes.data_emissao)}</p>
                        </div>
                        <div class="order-items">
                            <h3>Itens do Pedido</h3>
                            <ul>${itensHTML}</ul>
                        </div>
                        <div class="order-payment">
                            <h3>Forma de Pagamento</h3>
                            <p><strong>Método:</strong> ${detalhes.forma_pagamento}</p>
                            <p><strong>Status:</strong> ${detalhes.mensagem_compra}</p>
                        </div>
                        <div class="order-address">
                            <h3>Endereço de Entrega</h3>
                            <p>${detalhes.endereco_entrega.rua}, ${detalhes.endereco_entrega.numero}</p>
                            <p>${detalhes.endereco_entrega.bairro}, ${detalhes.endereco_entrega.cidade} - ${detalhes.endereco_entrega.estado}</p>
                            <p>${detalhes.endereco_entrega.cep}</p>
                        </div>
                        <div class="order-total">
                            <h3>Total</h3>
                            <p><strong>Total dos Itens:</strong> ${formatarMoeda(detalhes.valor_total)}</p>
                            <p><strong>Frete:</strong> R$ 10,00</p>
                            <p><strong>Total:</strong> ${formatarMoeda(detalhes.valor_total)}</p>
                        </div>
                    </div>
                `;

                detalhesContainer.innerHTML = detalhesHTML;
                app.dialog.close();
            } else {
                app.dialog.close();
                // Verifica se há uma mensagem de erro definida
                const errorMessage = responseJson.message || "Formato de dados inválido";
                app.dialog.alert("Erro ao carregar pedidos: " + errorMessage, "Falha na requisição!");
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar pedidos: " + error.message, "Falha na requisição!");
        });
        
    localStorage.removeItem('pedidoId');
}
// Fim da função detalhesPedido

//Inicio Funçao Listar Banners
function listarBanners() {
    app.dialog.preloader("Carregando...");
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };
    const dados = {
        local: 1
    };
    const body = JSON.stringify({
        class: "BannerRest",
        method: "ListaBanner",
        dados: dados
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
                const swiperWrapper = document.querySelector('.swiper-wrapper');
                // Limpa os slides existentes
                swiperWrapper.innerHTML = '';
                // Adiciona os novos slides
                banners.forEach(banner => {
                    const slide = document.createElement('div');
                    slide.classList.add('swiper-slide');
                    const img = document.createElement('img');
                    img.classList.add('img-fluid');
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
            app.dialog.alert("Erro ao carregar banners: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Listar Banners

//Inicio Funçao Listar Categorias
function listarCategoriasCurso() {
    app.dialog.preloader("Carregando...");
    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "CursoCategoriaRest",
        method: "loadAll"
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
                console.error("Erro ao obter dados de faixas etárias:", responseJson.message);
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar pedidos: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Listar Categorias

//Inicio Funçao Listar Endereços
function listarEnderecos() {
    app.dialog.preloader("Carregando...");
    const pessoaId = localStorage.getItem('userId');
    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PessoaRestService",
        method: "listarPessoa",
        pessoa_id: pessoaId
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
                $('#listaDeEnderecos').html('');  

                // Gera a lista de endereços
                enderecos.forEach((endereco, index) => {
                    var complemento = endereco.complemento ? `<span>${endereco.complemento}</span>` : '';
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
                $(".click-endereco").on('click', function (e) {
                    e.preventDefault();
                    const enderecoId = $(this).data('entrega-id');

                    // Atualiza o localStorage com o ID do endereço selecionado
                    var enderecoDetalhes = {
                        enderecoId: $(this).data('entrega-id'),
                        endEntregaRua: $(this).data('entrega-rua'), 
                        endEntregaNumero: $(this).data('entrega-numero'),
                        endEntregaComplemento: $(this).data('entrega-complemento'),
                        endEntregaBairro: $(this).data('entrega-bairro'),
                        endEntregaCidade: $(this).data('entrega-cidade'),
                        endEntregaEstado: $(this).data('entrega-estado'),
                        endEntregaCep: $(this).data('entrega-cep')
                    }
                    localStorage.setItem('enderecoDetalhes', JSON.stringify(enderecoDetalhes));

                    selecionarEndereco(enderecoId);        
                    // Fechar o dialog ou outra ação necessária após seleção do endereço
                    app.popup.close();

                    var toastCenter = app.toast.create({
                        text: `Endereço de entrega alterado`,
                        position: 'center',
                        closeTimeout: 2000,
                    });

                    toastCenter.open();
                });
        
                // Fechar o dialog ou outra ação necessária após preenchimento do select
                app.dialog.close();
            } else {
                app.dialog.close();
                // Tratar caso o status não seja "success"
                console.error("Erro ao obter dados de endereços:", responseJson.message);
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao carregar endereços: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Listar Endereços

//Inicio Funçao Selecionar Endereço
function selecionarEndereco(enderecoId) {
    const pessoaId = localStorage.getItem('pessoaId');
    
    const dados = {
        pessoa_id: pessoaId,
        endereco_id: enderecoId
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "AlterarEndereco",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'success'){
                // Dados a serem armazenados
                var valorFrete = responseJson.data.data.frete;
                
                //MOSTRAR O VALOR FRETE
                $("#freteCarrinho").html('Alterar ' + valorFrete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
            }
        })
        .catch((error) => {
            console.error("Erro:", error);
        });
}
//Fim Função Selecionar Endereço

//Inicio Funçao Listar Categorias
function finalizarCompra(formaPagamento) {
    app.dialog.preloader("Carregando...");
    const pessoaId = localStorage.getItem('pessoaId');    
    var enderecoDetalhes = JSON.parse(localStorage.getItem('enderecoDetalhes'));
    const enderecoEntregaId = enderecoDetalhes.enderecoId;

    const pagamento = {
        forma_pagamento: formaPagamento,
        titular: '',
        numero_cartao: '',
        data_expiracao: '',
        cvc: ''
    };
    const destinatario = {
          pessoa_id: pessoaId,
          endereco_id: enderecoEntregaId,
          frete: 0
    };
    const dados = {
        pessoa_id: pessoaId,
        pagamento: pagamento,
        destinatario: destinatario
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "IncluirVenda",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'success'){
                // Dados a serem armazenados
                var data = {
                    formaSelecionada: formaPagamento,
                    linhaDigitavel: responseJson.data.data.boleto_linhadigitavel,
                    pixKey: responseJson.data.data.pix_key,
                    linkBoleto: responseJson.data.data.boleto_impressao,
                    dataVencimento: responseJson.data.data.data_vencimento,
                    valorTotal: responseJson.data.data.valor_total,
                    pedidoId: responseJson.data.data.pedido_id
                };

                // Armazenar no localStorage
                localStorage.setItem('pagamentoData', JSON.stringify(data));

                app.dialog.close();
                app.views.main.router.navigate('/pagamento/');

                /* Abrir navegador para baixar boleto
                var ref = cordova.InAppBrowser.open(linkBoleto, '_system', 'location=no,zoom=no');
                ref.show();*/
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao finalizar compra: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Finalizar Compra


//Inicio Funçao Listar Carrinho
function listarCarrinho() {
    app.dialog.preloader("Carregando...");
    const pessoaId = localStorage.getItem('pessoaId');

    const dados = {
          pessoa_id: pessoaId
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "ListarCarrinho",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'sucess'){
                // Supondo que responseJson seja o objeto que você obteve no console.log
                const quantidadeItens = responseJson.data.data.itens.length;
                const total = responseJson.data.data.total;
                var pessoaIdCarrinho = responseJson.data.data.pessoa_id; 

                if (quantidadeItens > 0) {
                    //TEM ITENS NO CARRINHO

                    //ESVAZIAR A ÁREA DOS ITENS
                    $("#listaCarrinho").empty();

                    //PERCORRER O NOSSO CARRINHO E ALIMENTAR A ÁREA
                    responseJson.data.data.itens.forEach((item) => {
                        var itemDiv = `
                        <!-- ITEM DO CARRINHO-->
                        <div class="item-carrinho">
                            <div class="area-img">
                                <img src="https://escritorio.g3pay.com.br/${item.foto}">
                            </div>
                            <div class="area-details">
                                <div class="sup">
                                    <span class="name-prod">
                                    ${item.nome}
                                    </span>
                                    <a data-produto-id="${item.produto_id}" class="delete-item" href="#">
                                        <i class="mdi mdi-close"></i>
                                    </a>
                                </div>
                                <div class="preco-quantidade">
                                    <span>${formatarMoeda(item.preco_unitario)}</span>
                                    <div class="count">
                                        <a class="minus" data-produto-id="${item.produto_id}" data-produto-qtde="${item.quantidade}" href="#">-</a>
                                        <input readonly class="qtd-item" type="text" value="${item.quantidade}">
                                        <a class="plus" data-produto-id="${item.produto_id}" data-produto-qtde="${item.quantidade}" href="#">+</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;

                        $("#listaCarrinho").append(itemDiv);
                    });

                    $(".delete-item").on('click', function () {
                        var produtoId = $(this).data('produto-id');
                        //CONFIRMAR
                        app.dialog.confirm('Tem certeza que quer remover este item?', 'Remover', function () {
                            removerItemCarrinho(pessoaIdCarrinho, produtoId);
                        });
                    });

                    $(".minus").on('click', function () {
                        var produtoId = $(this).data('produto-id');
                        var quantidade = $(this).data('produto-qtde');
                        var qtdeAtualizada = quantidade - 1;

                        //SE TEM MAIS DE UM ITEM NA QUANTIDADE
                        if (quantidade > 1) {
                            alterarCarrinho(pessoaIdCarrinho, produtoId, qtdeAtualizada);
                        } else {
                            app.dialog.confirm(`Gostaria de remover este item?`, 'REMOVER', function () {
                                removerItemCarrinho(pessoaIdCarrinho, produtoId);
                            });
                        }

                    });

                    $(".plus").on('click', function () {
                        var produtoId = $(this).data('produto-id');
                        var quantidade = $(this).data('produto-qtde');
                        var qtdeAtualizada = quantidade + 1;

                        alterarCarrinho(pessoaIdCarrinho, produtoId, qtdeAtualizada);
                    });

                    //MOSTRAR O SUBTOTAL
                    $("#subtotal").html(total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

                } else {
                    //MOSTRAR CARRINHO VAZIO
                    //ESVAZIAR LISTA DO CARRINHO
                    $("#listaCarrinho").empty();

                    //SUMIR OS ITENS DE BAIXO BOTÃO E TOTAIS
                    $("#toolbarTotais").addClass('display-none');
                    $("#toolbarCheckout").addClass('display-none');

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
            app.dialog.alert("Erro ao listar carrinho: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Listar Carrinho

//Inicio Funçao Alterar Carrinho
function alterarCarrinho(pessoaId, produtoId, quantidade) {
    app.dialog.preloader("Carregando...");

    const dados = {
          pessoa_id: pessoaId,
          produto_id: produtoId,
          quantidade: quantidade
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "AlterarCarrinho",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'sucess'){
                // Sucesso na alteração                
                app.views.main.router.refreshPage();
                app.dialog.close();                
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao alterar carrinho: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Alterar Carrinho


//Inicio Adicionar Item Carrinho
function adicionarItemCarrinho(produtoId) {
    const pessoaId = localStorage.getItem('pessoaId');
    app.dialog.preloader("Carregando...");

    const dados = {
          pessoa_id: pessoaId,
          produto_id: produtoId,
          quantidade: 1
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "IncluirCarrinho",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'sucess'){
                // Sucesso na alteração  
                var toastCenter = app.toast.create({
                    text: `${produto.nome} adicionado ao carrinho`,
                    position: 'center',
                    closeTimeout: 2000,
                });

                toastCenter.open();
                app.dialog.close();  
                app.views.main.router.navigate("/produtos/");          
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao alterar carrinho: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Adicionar Item Carrinho

//Inicio Remover Item do Carrinho
function removerItemCarrinho(pessoaId, produtoId) {
    app.dialog.preloader("Carregando...");

    const dados = {
          pessoa_id: pessoaId,
          produto_id: produtoId
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "ExcluirCarrinho",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'sucess'){
                // Sucesso na alteração                
                app.views.main.router.refreshPage();
                app.dialog.close();                
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao alterar carrinho: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Remover Item do Carrinho

//Inicio Funçao Esvaziar Carrinho
function limparCarrinho() {
    const pessoaId = localStorage.getItem('pessoaId');
    app.dialog.preloader("Carregando...");

    const dados = {
          pessoa_id: pessoaId
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "LimparCarrinho",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'sucess'){
                // Sucesso na alteração                
                app.views.main.router.refreshPage();
                app.dialog.close();                
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao alterar carrinho: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Esvaziar Carrinho


//Inicio Funçao contar Carrinho
function contarCarrinho() {
    const pessoaId = localStorage.getItem('pessoaId');

    const dados = {
          pessoa_id: pessoaId
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "ListarCarrinho",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'sucess'){
                // Supondo que responseJson seja o objeto que você obteve no console.log
                const quantidadeItens = responseJson.data.data.itens.length;
                $('.btn-cart').attr('data-count', quantidadeItens);         
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao listar carrinho: " + error.message, "Falha na requisição!");
        });
}
//Fim Função contar Carrinho


//Inicio Funçao Listar Carrinho Checkout
function listarCarrinhoCheckout() {
    app.dialog.preloader("Carregando...");
    const pessoaId = localStorage.getItem('pessoaId');

    const dados = {
          pessoa_id: pessoaId
    };

    // Cabeçalhos da requisição
    const headers = {
        "Content-Type": "application/json",
        "Authorization": appId,
    };

    const body = JSON.stringify({
        class: "PagamentoSafe2payRest",
        method: "ListarCarrinho",
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
            // Verifica se o status é 'success'
            if(responseJson.status == 'success' && responseJson.data.status == 'sucess'){
                // Supondo que responseJson seja o objeto que você obteve no console.log
                const quantidadeItens = responseJson.data.data.itens.length;
                const total = responseJson.data.data.total;
                var pessoaIdCarrinho = responseJson.data.data.pessoa_id; 

                if (quantidadeItens > 0) {
                    //TEM ITENS NO CARRINHO
                    $("#listaItensConfirmation").empty();

                    //PERCORRER O NOSSO CARRINHO E ALIMENTAR A ÁREA
                    responseJson.data.data.itens.forEach((item) => {
                        var itemLi = `
                        <!-- ITEM DO CARRINHO-->
                        <li class="item-carrinho">
                                <img src="https://escritorio.g3pay.com.br/${item.foto}" width="40px">
                            <div class="area-details">
                                <div class="sup">
                                    <span class="name-prod">
                                    ${item.nome}
                                    </span>
                                </div>
                                <div class="preco-quantidade">
                                    <span>${formatarMoeda(item.preco_unitario)}</span>
                                    <div class="count">
                                        <input readonly class="qtd-item" type="text" value="${item.quantidade}">
                                    </div>
                                </div>
                            </div>
                        </li>
                        `;

                        $("#listaItensConfirmation").append(itemLi);
                    });

                    //MOSTRAR O SUBTOTAL
                    $("#subTotalCheckout").html(total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

                } 

                app.dialog.close();                
            }
        })
        .catch((error) => {
            app.dialog.close();
            console.error("Erro:", error);
            app.dialog.alert("Erro ao listar carrinho: " + error.message, "Falha na requisição!");
        });
}
//Fim Função Listar Carrinho Checkout

//Inicio da Funçao formatar Moeda
function formatarMoeda(valor) {
    var precoFormatado = parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    localStorage.removeItem('produtoId');
    localStorage.removeItem('produto');
    localStorage.removeItem('enderecoDetalhes');
}
// Fim Função para limpar o local storage

// Início Função para formatar data e hora
function formatarData(data) {
    // Converte a string de data para objeto Date
    const dateObj = new Date(data);

    // Array com os nomes dos meses em português
    const meses = [
        "JAN", "FEV", "MAR", "ABR",
        "MAI", "JUN", "JUL", "AGO",
        "SET", "OUT", "NOV", "DEZ"
    ];

    // Extrai o dia, mês, ano, hora e minuto
    const dia = dateObj.getDate();
    const mes = meses[dateObj.getMonth()];
    const ano = dateObj.getFullYear();
    const horas = dateObj.getHours();
    const minutos = dateObj.getMinutes();

    // Formata a hora e minuto com dois dígitos
    const horasFormatadas = horas.toString().padStart(2, '0');
    const minutosFormatados = minutos.toString().padStart(2, '0');

    // Retorna a data e hora formatadas
    return `${dia} ${mes} ${ano} ${horasFormatadas}:${minutosFormatados}`;
}
// Fim da Função formatar data e hora

//Inicio da função para copiar
function copiarParaAreaDeTransferencia(texto) {
    // Cria um elemento de texto temporário
    var tempElement = document.createElement('textarea');
    tempElement.value = texto;
    document.body.appendChild(tempElement);

    // Seleciona o texto e copia para a área de transferência
    tempElement.select();
    tempElement.setSelectionRange(0, 99999); // Para dispositivos móveis
    document.execCommand('copy');

    // Remove o elemento temporário
    document.body.removeChild(tempElement);

    // Alerta para informar ao usuário que a linha digitável foi copiada
    app.dialog.alert("Linha digitável copiada para a área de transferência!", "Cópia");
}
//Fim da função para copiar

//Início Função de Notificação
function solicitarPermissaoNotificacao() {
    // Verifique se a permissão já foi concedida
    if (Notification.permission === "granted") {
      mostrarNotificacao();
    } 
    // Caso a permissão não tenha sido negada, solicite-a
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          mostrarNotificacao();
        }
      });
    }
  }
  function mostrarNotificacao() {
    const notification = new Notification("Olá! Você tem uma nova notificação.");
  }
  mostrarNotificacao();
  function enviarNotificacao() {
    if (Notification.permission === "granted") {
      const options = {
        body: "Esta é uma notificação de teste para seu PWA.",
        icon: "/img/notificacao-icone.png",
        badge: "/img/emblema.png",
        vibrate: [200, 100, 200],
        tag: "notificacao-pwa"
      };
      const notification = new Notification("Notificação PWA", options);
      
      notification.onclick = function() {
        window.focus();
      };
    }
  }

//Fim Função de Notificação

