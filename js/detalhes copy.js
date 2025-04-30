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
    //$("#reviews-detalhe").html(produto.reviews + ' reviews');
    $("#descricao-detalhe").html(produto.descricao);
    $("#preco-detalhe").html(formatarMoeda(produto.preco));
    $("#precoTotal").html(formatarMoeda(produto.preco));
    $("#precoShare").html(formatarMoeda(produto.preco));
    $("#precopromo-detalhe").html(formatarMoeda(produto.preco));
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
    produtoId = produto.id;
    buscarProduto(produto.id);
}


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