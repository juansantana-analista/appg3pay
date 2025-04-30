// Javascript para a página de detalhes
document.addEventListener('page:init', function (e) {
    if (e.detail.name === 'detalhes') {
      // Carrega os dados do produto do localStorage
      var produto = JSON.parse(localStorage.getItem('produto'));
      var produtoId = '';
      
      if (produto) {
        // Preencher dados do produto na tela
        $("#imagem-produto").attr('src', produto.imagem);
        $("#imagemShare").attr('src', produto.imagem);
        $("#nome-produto").html(produto.nome);
        $("#nomeShare").html(produto.nome);
        $("#preco-original").html('R$ ' + parseFloat(produto.preco2 || produto.preco * 1.6).toFixed(2).replace('.', ','));
        $("#preco-atual").html('R$ ' + parseFloat(produto.preco).toFixed(2).replace('.', ','));
        $("#precoShare").html('R$ ' + parseFloat(produto.preco).toFixed(2).replace('.', ','));
        
        // Calcular valores de revenda e lucro
        const precoRevenda = parseFloat(produto.preco) * 1.25; // 25% de margem
        const lucro = precoRevenda - parseFloat(produto.preco);
        
        $("#preco-revenda").html('R$ ' + precoRevenda.toFixed(2).replace('.', ','));
        $("#preco-lucro").html('R$ ' + lucro.toFixed(2).replace('.', ','));
        
        produtoId = produto.id;
        buscarProduto(produtoId);
      }
      
      // Evento do botão Divulgar produto
      $("#btnDivulgar").on('click', function() {
        app.popup.open('.popup-compartilhar');
        buscarLinks(produtoId);
      });
      
      // Evento do botão Adicionar ao carrinho
      $("#btnCarrinho").on('click', function() {
        adicionarItemCarrinho(produtoId);
      });
    }
  });