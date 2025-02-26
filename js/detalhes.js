//PEGAR OS PRODUTOS DO LOCALSTORAGE
//var produto = JSON.parse(localStorage.getItem('produto'));
var produto = JSON.parse(localStorage.getItem('produtoDetalhes'));
var produtoId = '';
if (produto) {
    //ALIMENTAR COM OS VALORES DO ITEM
    $("#imagem-detalhe").attr('src', produto.detalhes.foto);
    $("#imagemShare").attr('src', produto.detalhes.foto);
    $("#nome-detalhe").html(produto.detalhes.nome);
    $("#nomeShare").html(produto.detalhes.nome);
    //$("#rating-detalhe").html(produto.rating);
    //$("#like-detalhe").html(produto.likes);
    //$("#reviews-detalhe").html(produto.reviews + ' reviews');
    $("#descricao-detalhe").html(produto.detalhes.descricao_app);
    $("#preco-detalhe").html(formatarMoeda(produto.detalhes.preco));
    $("#precoTotal").html(formatarMoeda(produto.detalhes.preco));
    $("#precoShare").html(formatarMoeda(produto.detalhes.preco));
    $("#precopromo-detalhe").html(formatarMoeda(produto.detalhes.preco));
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
    produtoId = produto.detalhes.id;
    buscarProduto(produto.detalhes.id);
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