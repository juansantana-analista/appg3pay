//PEGAR OS PRODUTOS DO LOCALSTORAGE
var produto = JSON.parse(localStorage.getItem('produto'));
var produtoId = '';
if (produto) {
    //ALIMENTAR COM OS VALORES DO ITEM
    $("#imagem-detalhe").attr('src', produto.imagem);
    $("#imagemShare").attr('src', produto.imagem);
    $("#nome-detalhe").html(produto.nome);
    $("#nomeShare").html(produto.nome);
    $("#rating-detalhe").html(produto.rating);
    $("#like-detalhe").html(produto.likes);
    $("#descricao-detalhe").html(produto.descricao);
    
    // Preços e valores
    $("#preco-detalhe").html(formatarMoeda(produto.preco));
    $("#precoTotal").html(formatarMoeda(produto.preco));
    $("#precoTotalRodape").html(formatarMoeda(produto.preco));
    $("#precoShare").html(formatarMoeda(produto.preco));
    
    // Calcular preço de revenda e lucro (30% em cima do preço)
    const precoRevenda = produto.preco * 1.25; // 25% de margem
    const lucro = precoRevenda - produto.preco;
    
    $("#precoRevenda").html(formatarMoeda(precoRevenda));
    $("#precoLucro").html(formatarMoeda(lucro));
    
    // Selecione a div onde você quer adicionar o link
    const $container = $('#containerBtnCarrinho');
    // Crie o link e configure os atributos
    const $btnAddCarrinho = $('<button></button>')
        .text('Adicionar ao Carrinho')
        .attr('data-produto-id', produto.id)
        .attr('id', 'addCarrinho')
        .addClass('w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors');

    // Anexe o link ao container
    $container.append($btnAddCarrinho);
    produtoId = produto.id;
    buscarProduto(produto.id);
}


//CLICOU NO ADICIONAR CARRINHO
$(document).on('click', "#addCarrinho", function () {
    //ADICIONAR AO CARRINHO
    adicionarItemCarrinho(produtoId);
});

//CLICOU NO COMPRAR AGORA
$("#comprarAgora").on('click', function () {
    //ADICIONAR AO CARRINHO E IR PARA CHECKOUT
    adicionarItemCarrinho(produtoId);
});

//CLICOU EM DIVULGAR PRODUTO
$("#divulgarProduto, #compartilharBtn").on('click', function () {
    //ABRIR POPUP COMPARTILHAR
    app.popup.open('.popup-compartilhar');
    buscarLinks(produtoId);
});