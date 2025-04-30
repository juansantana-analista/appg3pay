//PEGAR OS PRODUTOS DO LOCALSTORAGE
var produto = JSON.parse(localStorage.getItem('produto'));
var produtoId = '';
if (produto) {
    //ALIMENTAR COM OS VALORES DO ITEM
    $("#nome-detalhe").html(produto.nome.toUpperCase());
    $("#nomeShare").html(produto.nome.toUpperCase());
    $("#imagemShare").attr('src', produto.imagem);
    
    // Configurar os preços no estilo da imagem referência
    $("#precoTotal").html(formatarMoeda(produto.preco));
    $("#precoRevenda").html(formatarMoeda(produto.preco_lojavirtual));
    
    // Calcular o lucro
    var lucro = produto.preco_lojavirtual - produto.preco;
    $("#precoLucro").html(formatarMoeda(lucro));
    $("#precoShare").html(formatarMoeda(produto.preco_lojavirtual));
    
    produtoId = produto.id;
    buscarProduto(produto.id);
}

// Verificar operação (venda ou compra)
var operacao = localStorage.getItem('operacao');
if (operacao == 'venda') {
    $('#addCarrinho').addClass('display-none');
    $('#compartilharProduto').removeClass('display-none');
} else {
    $('#compartilharProduto').addClass('display-none');
    $('#addCarrinho').removeClass('display-none');
}

//CLICOU NO ADICIONAR CARRINHO
$("#addCarrinho").on('click', function () {
    //ADICIONAR AO CARRINHO
    adicionarItemCarrinho(produtoId);
});

//CLICOU NO COMPARTILHAR PRODUTO
$("#compartilharProduto").on('click', function () {
    //ABRIR POPUP COMPARTILHAR
    app.popup.open('.popup-compartilhar');
    buscarLinks(produtoId);
});