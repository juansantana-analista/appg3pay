// VERSÃO MELHORADA DAS FUNÇÕES MINHA LOJA
// Substitua o conteúdo do arquivo js/minha-loja.js

// Funções para Minha Loja - VERSÃO FINAL CORRIGIDA

// Verificar se o usuário já tem uma loja criada
function verificarLoja() {
  app.dialog.preloader("Carregando...");
  const pessoaId = localStorage.getItem("pessoaId");

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "LojinhaRestService",
    method: "verificarLojaPessoa",
    pessoa_id: pessoaId
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
      
      if (responseJson.status === "success" && responseJson.data.tem_loja) {
        // Usuário já tem loja - buscar dados completos incluindo visitas
        const loja = responseJson.data.data;
        buscarDadosCompletosLoja(loja.id);
      } else {
        // Usuário não tem loja - mostrar tela de boas-vindas
        mostrarTelaBemVindo();
      }
    })
    .catch((error) => {
      app.dialog.close();
      console.error("Erro:", error);
      app.dialog.alert(
        "Erro ao verificar loja: " + error.message,
        "Falha na requisição!"
      );
    });
}

// Buscar dados completos da loja incluindo visitas
function buscarDadosCompletosLoja(lojaId) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "LojinhaRestService",
    method: "obterLojaDados",
    loja_id: lojaId
  });

  const options = {
    method: "POST",
    headers: headers,
    body: body,
  };

  fetch(apiServerUrl, options)
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.status === "success" && responseJson.data.status === "success") {
        // Dados completos da loja incluindo visitas
        const loja = responseJson.data.data;
        localStorage.setItem("minhaLoja", JSON.stringify(loja));
        mostrarTelaGerenciamento(loja);
        carregarBannersLoja(loja.id);
      } else {
        console.error("Erro ao buscar dados completos da loja:", responseJson.message);
        app.dialog.alert("Erro ao carregar dados da loja: " + responseJson.message, "Erro");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados completos da loja:", error);
      app.dialog.alert("Erro ao carregar dados da loja: " + error.message, "Erro");
    });
}

// Mostrar tela de boas-vindas
function mostrarTelaBemVindo() {
  $("#welcome-screen").removeClass("display-none");
  $("#create-form").addClass("display-none");
  $("#manage-screen").addClass("display-none");
}

// Mostrar tela de gerenciamento
function mostrarTelaGerenciamento(loja) {
  if (!loja) {
    console.error("Dados da loja inválidos:", loja);
    return;
  }
  
  $("#welcome-screen").addClass("display-none");
  $("#create-form").addClass("display-none");
  $("#manage-screen").removeClass("display-none");

  // Atualizar dados da loja na tela
  $("#nomeLojaAtual").text(loja.nome_loja || "Minha Loja");
  
  // Atualizar visualizações
  $("#visualizacoes").text(loja.visitas || 0);
  
  // Gerar link da loja
  const linkLoja = `https://vitatop.tecskill.com.br/lojinha_vitatop/${loja.nome_loja || "loja"}`;
  localStorage.setItem("linkLoja", linkLoja);
  
  // Carregar categorias selecionadas
  try {
    atualizarInterfaceCategorias();
  } catch (error) {
    console.error("Erro ao atualizar interface de categorias:", error);
  }

  // Exibir/ocultar opções especiais
  if (loja.is_especial === "S") {
    $("#gerenciarBanners").show();
    $("#alterarLogoLoja").show();
    $("#grupoCorPrincipal").show();
    $("#grupoCorSecundaria").show();
    $("#grupoEditarCorPrincipal").show();
    $("#grupoEditarCorSecundaria").show();
  } else {
    $("#gerenciarBanners").hide();
    $("#alterarLogoLoja").hide();
    $("#grupoCorPrincipal").hide();
    $("#grupoCorSecundaria").hide();
    $("#grupoEditarCorPrincipal").hide();
    $("#grupoEditarCorSecundaria").hide();
  }
}

// Mostrar formulário de criação
function mostrarFormularioCriacao() {
  $("#welcome-screen").addClass("display-none");
  $("#create-form").removeClass("display-none");
  $("#manage-screen").addClass("display-none");
  
  // Reset do formulário
  resetarFormulario();
}

// Resetar formulário
function resetarFormulario() {
  // Resetar steps
  $(".step").removeClass("active");
  $(".step[data-step='1']").addClass("active");
  
  // Mostrar apenas step 1
  $(".step-content").addClass("display-none");
  $("#step-1").removeClass("display-none");
  
  // Limpar campos
  $("#nomeLoja").val("");
  $("#previewNome").text("Nome da sua loja aparecerá aqui");
  
  // Desabilitar botão
  $("#btnStep1Next").prop("disabled", true);
}

// Próximo step
function proximoStep(stepAtual) {
  const proximoStep = stepAtual + 1;
  
  // Atualizar indicadores
  $(".step").removeClass("active");
  $(`.step[data-step='${proximoStep}']`).addClass("active");
  
  // Mostrar conteúdo do próximo step
  $(".step-content").addClass("display-none");
  $(`#step-${proximoStep}`).removeClass("display-none");
  
  // Se for o step 2, preparar summary
  if (proximoStep === 2) {
    prepararSummary();
  }
}

// Step anterior
function stepAnterior(stepAtual) {
  const stepAnterior = stepAtual - 1;
  
  // Atualizar indicadores
  $(".step").removeClass("active");
  $(`.step[data-step='${stepAnterior}']`).addClass("active");
  
  // Mostrar conteúdo do step anterior
  $(".step-content").addClass("display-none");
  $(`#step-${stepAnterior}`).removeClass("display-none");
}

// Preparar summary no step 2
function prepararSummary() {
  const nomeLoja = $("#nomeLoja").val();
  
  $("#summaryNome").text(nomeLoja);
  $("#linkLoja").text(`vitatop.tecskill.com.br/lojinha_vitatop/${nomeLoja}`);
}

// Criar loja
function criarLoja() {
  app.dialog.preloader("Criando sua loja...");
  const pessoaId = localStorage.getItem("pessoaId");
  const nomeLoja = $("#nomeLoja").val();
  const corPrincipal = $("#corPrincipal").val();
  const corSecundaria = $("#corSecundaria").val();
  const whatsapp = $("#whatsappLoja").val();

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "LojinhaRestService",
    method: "criarLoja",
    dados: {
      pessoa_id: pessoaId,
      nome_loja: nomeLoja,
      cor_principal: corPrincipal,
      cor_secundaria: corSecundaria,
      whatsapp: whatsapp
    }
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
        const lojaId = responseJson.data.data.id;
        localStorage.setItem("lojaId", lojaId);
        
        // Criar banners padrão automaticamente
        enviarBannerLoja(lojaId);
        app.dialog.close();
        mostrarSucessoCriacao();
      } else {
        app.dialog.close();
        app.dialog.alert("Erro ao criar loja: " + responseJson.message, "Erro");
      }
    })
    .catch((error) => {
      app.dialog.close();
      console.error("Erro:", error);
      app.dialog.alert("Erro ao criar loja: " + error.message, "Erro");
    });
}

// Enviar banner da loja - VERSÃO SEGURA
function enviarBannerLoja(lojaId, arquivo, callback) {
  // Se não foi passado nenhum arquivo, envia mesmo assim para que o sistema crie banners padrão
  if (!arquivo) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };

    const body = JSON.stringify({
      class: "LojinhaBannerRest",
      method: "salvarBanner",
      data: {
        lojinha_vitatop_id: lojaId
      }
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
          if (callback) callback();
        } else {
          console.error("Erro ao enviar banner (sem arquivo):", responseJson.message);
          if (callback) callback();
        }
      })
      .catch((error) => {
        console.error("Erro ao enviar banner (sem arquivo):", error);
        if (callback) callback();
      });

    return; // evita continuar o fluxo com FileReader
  }

  // Se arquivo existe, continua com as validações e envio
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (arquivo.size > maxSize) {
    app.dialog.alert("A imagem deve ter no máximo 5MB. Tente uma imagem menor.", "Arquivo muito grande");
    if (callback) callback();
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(arquivo.type)) {
    app.dialog.alert("Apenas arquivos JPG, JPEG, PNG e GIF são permitidos.", "Formato inválido");
    if (callback) callback();
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const base64 = e.target.result;

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };

    const body = JSON.stringify({
      class: "LojinhaBannerRest",
      method: "salvarBanner",
      data: {
        lojinha_vitatop_id: lojaId,
        titulo: "Banner Principal",
        url_arquivo_base64: base64,
        ativo: "S",
        data_criacao: new Date().toISOString()
      }
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
          if (callback) callback();
        } else {
          console.error("Erro ao enviar banner:", responseJson.message);
          if (callback) callback();
        }
      })
      .catch((error) => {
        console.error("Erro ao enviar banner:", error);
        if (callback) callback();
      });
  };

  reader.onerror = function() {
    app.dialog.alert("Erro ao processar a imagem", "Erro");
    if (callback) callback();
  };

  reader.readAsDataURL(arquivo);
}


// Mostrar sucesso da criação
function mostrarSucessoCriacao() {
  // Recarregar dados completos da loja para atualizar visualizações
  const lojaId = localStorage.getItem("lojaId");
  if (lojaId) {
    buscarDadosCompletosLoja(lojaId);
  }
  app.popup.open(".popup-sucesso");
}

// Carregar banners da loja
function carregarBannersLoja(lojaId) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "LojinhaBannerRest", 
    method: "listarBannersAtivos",
    lojinha_vitatop_id: lojaId
  });

  const options = {
    method: "POST",
    headers: headers,
    body: body,
  };

  fetch(apiServerUrl, options)
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.status === "success" && responseJson.data && responseJson.data.data.length > 0) {
        exibirBanners(responseJson.data.data);
        
        // Definir banner principal
        const bannerPrincipal = responseJson.data.data[0];
        
        if (bannerPrincipal && bannerPrincipal.url_arquivo) {
          $("#bannerAtual").attr("src", bannerPrincipal.url_arquivo);
        }
      }
      
      // Verificar quantos banners já existem para controlar limite
      const totalBanners = responseJson.data.data ? responseJson.data.data.length : 0;
      if (totalBanners >= 4) {
        $("#btnAdicionarBanner").prop("disabled", true).html('<i class="mdi mdi-block-helper"></i> Limite de 4 banners atingido');
      } else {
        $("#btnAdicionarBanner").prop("disabled", false).html(`<i class="mdi mdi-plus"></i> Adicionar Banner (${totalBanners}/4)`);
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar banners:", error);
    });
}

// Exibir lista de banners
function exibirBanners(banners) {
  const container = $("#bannersLista");
  container.empty();

  banners.forEach((banner, index) => {
    const bannerHTML = `
      <div class="banner-item" data-id="${banner.id}">
        <div class="banner-preview">
          <img src="${banner.url_arquivo}" alt="${banner.titulo}">
        </div>
        <div class="banner-info">
          <h4>${banner.titulo || 'Banner ' + (index + 1)}</h4>
          <p>Adicionado em ${formatarData(banner.data_criacao)}</p>
        </div>
        <div class="banner-actions">
          <button class="btn-banner-action btn-delete-banner" onclick="excluirBanner(${banner.id})">
            <i class="mdi mdi-delete"></i>
          </button>
        </div>
      </div>
    `;
    
    container.append(bannerHTML);
  });
}

// Processar novo banner - VERSÃO SEGURA
function processarNovoBanner(arquivo) {
  // Validar tamanho do arquivo (máximo 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (arquivo.size > maxSize) {
    app.dialog.alert("A imagem deve ter no máximo 5MB. Tente uma imagem menor.", "Arquivo muito grande");
    return;
  }

  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(arquivo.type)) {
    app.dialog.alert("Apenas arquivos JPG, JPEG, PNG e GIF são permitidos.", "Formato inválido");
    return;
  }

  const lojaData = localStorage.getItem("minhaLoja");
  if (!lojaData) {
    app.dialog.alert("Erro ao obter dados da loja", "Erro");
    return;
  }
  
  const loja = JSON.parse(lojaData);
  const lojaId = loja.id;
  
  app.dialog.preloader("Adicionando banner...");
  
  enviarBannerLoja(lojaId, arquivo, function() {
    app.dialog.close();
    app.dialog.alert("Banner adicionado com sucesso!", "Sucesso");
    // Recarregar dados completos da loja para atualizar visualizações
    buscarDadosCompletosLoja(lojaId);
  });
}

// Excluir banner
function excluirBanner(bannerId) {
  app.dialog.confirm("Tem certeza que deseja excluir este banner?", "Confirmar", function() {
    app.dialog.preloader("Excluindo banner...");
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };

    const body = JSON.stringify({
      class: "LojinhaBannerRest",
      method: "excluirBanner",
      id: bannerId
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
          app.dialog.alert("Banner excluído com sucesso!", "Sucesso");
          const lojaData = localStorage.getItem("minhaLoja");
          if (lojaData) {
            const loja = JSON.parse(lojaData);
            // Recarregar dados completos da loja para atualizar visualizações
            buscarDadosCompletosLoja(loja.id);
          }
        } else {
          app.dialog.alert("Erro ao excluir banner: " + responseJson.message, "Erro");
        }
      })
      .catch((error) => {
        app.dialog.close();
        console.error("Erro:", error);
        app.dialog.alert("Erro ao excluir banner: " + error.message, "Erro");
      });
  });
}

// Editar nome da loja
function editarNomeLoja() {
  const lojaData = localStorage.getItem("minhaLoja");
  if (!lojaData) {
    app.dialog.alert("Erro ao obter dados da loja", "Erro");
    return;
  }
  
  const lojaAtual = JSON.parse(lojaData);
  $("#novoNomeLoja").val(lojaAtual.nome_loja);
  $("#novaCorPrincipal").val(lojaAtual.cor_principal || "#FF5733");
  $("#novaCorSecundaria").val(lojaAtual.cor_secundaria || "#C70039");
  $("#novoWhatsappLoja").val(lojaAtual.whatsapp || "");
  app.popup.open(".popup-editar-nome");
}

// Salvar novo nome da loja
function salvarNovoNome() {
  const novoNome = $("#novoNomeLoja").val().trim();
  const novaCorPrincipal = $("#novaCorPrincipal").val();
  const novaCorSecundaria = $("#novaCorSecundaria").val();
  const novoWhatsapp = $("#novoWhatsappLoja").val();
  
  if (!novoNome) {
    app.dialog.alert("Por favor, digite um nome para a loja", "Erro");
    return;
  }

  app.dialog.preloader("Salvando...");
  
  const lojaData = localStorage.getItem("minhaLoja");
  if (!lojaData) {
    app.dialog.close();
    app.dialog.alert("Erro ao obter dados da loja", "Erro");
    return;
  }
  
  const lojaAtual = JSON.parse(lojaData);
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "LojinhaRestService",
    method: "atualizarLoja",
    dados: {
      id: lojaAtual.id,
      nome_loja: novoNome,
      cor_principal: novaCorPrincipal,
      cor_secundaria: novaCorSecundaria,
      whatsapp: novoWhatsapp
    }
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
        // Recarregar dados completos da loja para atualizar visualizações
        buscarDadosCompletosLoja(lojaAtual.id);
        
        app.popup.close(".popup-editar-nome");
        app.dialog.alert("Nome da loja atualizado com sucesso!", "Sucesso");
      } else {
        app.dialog.alert("Erro ao atualizar nome: " + responseJson.message, "Erro");
      }
    })
    .catch((error) => {
      app.dialog.close();
      console.error("Erro:", error);
      app.dialog.alert("Erro ao atualizar nome: " + error.message, "Erro");
    });
}

// Compartilhar loja
function compartilharLoja() {
  const linkLoja = localStorage.getItem("linkLoja");
  const lojaData = localStorage.getItem("minhaLoja");
  
  if (!linkLoja || !lojaData) {
    app.dialog.alert("Erro ao obter dados da loja", "Erro");
    return;
  }
  
  const loja = JSON.parse(lojaData);
  const nomeLoja = loja.nome_loja;
  
  onCompartilhar(
    nomeLoja,
    "Conheça minha loja personalizada na VitaTop!",
    linkLoja
  );
}

// Visualizar loja
function visualizarLoja() {
  const linkLoja = localStorage.getItem("linkLoja");
  
  if (!linkLoja) {
    app.dialog.alert("Erro ao obter link da loja", "Erro");
    return;
  }
  
  app.dialog.confirm("Deseja abrir sua loja no navegador?", "Visualizar Loja", function() {
    window.open(linkLoja, '_blank');
  });
}

// Copiar link da loja
function copiarLinkLoja() {
  const linkLoja = localStorage.getItem("linkLoja") || $("#linkLoja").text();
  if (linkLoja) {
    copiarParaAreaDeTransferencia(linkLoja);
  } else {
    app.dialog.alert("Erro ao obter link da loja", "Erro");
  }
}

// ========================================
// FUNÇÕES PARA GERENCIAMENTO DE CATEGORIAS
// ========================================

// Variável global para manter as categorias selecionadas em memória
window.categoriasSelecionadasLojinha = [];

// Abrir popup de gerenciamento de categorias
function gerenciarCategorias() {
  const lojaData = localStorage.getItem("minhaLoja");
  if (!lojaData) {
    app.dialog.alert("Erro ao obter dados da loja", "Erro");
    return;
  }
  const loja = JSON.parse(lojaData);
  const lojinhaId = loja.id;
  app.dialog.preloader("Carregando categorias...");
  // Buscar todas as categorias disponíveis
  const buscarDisponiveis = new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
    const body = JSON.stringify({
      class: "ProdutoCategoriaRest",
      method: "listarCategorias",
    });
    fetch(apiServerUrl, { method: "POST", headers, body })
      .then((r) => r.json())
      .then((json) => {
        if (json.status === "success" && json.data && json.data.data) {
          resolve(json.data.data);
        } else {
          reject(json.message || "Erro ao buscar categorias disponíveis");
        }
      })
      .catch(reject);
  });
  // Buscar categorias já selecionadas da lojinha
  const buscarSelecionadas = new Promise((resolve, reject) => {
    listarCategoriasLojinha(lojinhaId, (resp) => {
      if (resp.status === "success" && resp.data && resp.data.data) {
        resolve(resp.data.data);
      } else {
        resolve([]); // Se não houver, retorna vazio
      }
    });
  });
  Promise.all([buscarDisponiveis, buscarSelecionadas])
    .then(([todas, selecionadas]) => {
      app.dialog.close();
      // Converter selecionadas para array de ids
      window.categoriasSelecionadasLojinha = selecionadas.map(cat => cat.categoria_produto ? String(cat.categoria_produto) : String(cat.id));
      exibirCategoriasDisponiveis(todas, window.categoriasSelecionadasLojinha);
      app.popup.open(".popup-categorias");
    })
    .catch((err) => {
      app.dialog.close();
      app.dialog.alert("Erro ao carregar categorias: " + err, "Erro");
    });
}

// Exibir categorias disponíveis no popup
function exibirCategoriasDisponiveis(categorias, selecionadasIds) {
  // Exibir todas as categorias (sem filtro de habilitado)
  const container = $("#categoriasContainer");
  container.empty();
  // Adicionar contador de categorias selecionadas
  const contadorHTML = `
    <div class="categorias-selecionadas">
      <h5>Categorias Selecionadas: <span id="contadorCategorias">${selecionadasIds.length}</span></h5>
      <div class="categorias-tags" id="categoriasTagsPopup">
        ${categorias.filter(cat => selecionadasIds.includes(String(cat.id))).map(cat => `<span class="categoria-tag">${cat.nome}</span>`).join('')}
      </div>
    </div>
  `;
  container.append(contadorHTML);
  categorias.forEach((categoria) => {
    if (!categoria || !categoria.id) return;
    const isSelected = selecionadasIds.includes(String(categoria.id));
    const nomeEscapado = (categoria.nome || 'Categoria').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const iconeEscapado = (categoria.icone || 'mdi mdi-tag').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const categoriaHTML = `
      <div class="categoria-item ${isSelected ? 'selected' : ''}" 
           data-id="${categoria.id}"
           data-nome="${nomeEscapado}"
           data-icone="${iconeEscapado}">
        <div class="categoria-checkbox">
          <i class="mdi mdi-check"></i>
        </div>
        <div class="categoria-icon">
          <i class="${categoria.icone || 'mdi mdi-tag'}"></i>
        </div>
        <div class="categoria-info">
          <div class="categoria-nome">${categoria.nome || 'Categoria'}</div>
          <div class="categoria-descricao">Categoria de produtos</div>
        </div>
      </div>
    `;
    container.append(categoriaHTML);
  });
  // Delegate para clique
  $(document).off("click.categorias", ".categoria-item");
  $(document).on("click.categorias", ".categoria-item", function() {
    const categoriaId = $(this).attr("data-id");
    if (!categoriaId) return;
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      window.categoriasSelecionadasLojinha = window.categoriasSelecionadasLojinha.filter(id => id !== String(categoriaId));
    } else {
      $(this).addClass("selected");
      if (!window.categoriasSelecionadasLojinha.includes(String(categoriaId))) {
        window.categoriasSelecionadasLojinha.push(String(categoriaId));
      }
    }
    atualizarContadorCategoriasPopup(categorias, window.categoriasSelecionadasLojinha);
  });
}

function atualizarContadorCategoriasPopup(categorias, selecionadasIds) {
  // Exibir todas as categorias (sem filtro de habilitado)
  $("#contadorCategorias").text(selecionadasIds.length);
  const tagsContainer = $("#categoriasTagsPopup");
  tagsContainer.empty();
  categorias.filter(cat => selecionadasIds.includes(String(cat.id))).forEach(cat => {
    tagsContainer.append(`<span class="categoria-tag">${cat.nome}</span>`);
  });
}

// Função global para limpar todas as categorias selecionadas
function limparCategoriasSelecionadas() {
  window.categoriasSelecionadasLojinha = [];
  // Atualiza a interface do popup, se estiver aberto
  if (typeof exibirCategoriasDisponiveis === 'function' && window.ultimaListaCategoriasDisponiveis) {
    exibirCategoriasDisponiveis(window.ultimaListaCategoriasDisponiveis, window.categoriasSelecionadasLojinha);
  } else {
    // Alternativa: tentar atualizar contador e tags
    if (typeof atualizarContadorCategoriasPopup === 'function' && window.ultimaListaCategoriasDisponiveis) {
      atualizarContadorCategoriasPopup(window.ultimaListaCategoriasDisponiveis, window.categoriasSelecionadasLojinha);
    }
  }
}

// (Opcional: salve a última lista de categorias disponíveis ao exibir o popup)
const _exibirCategoriasDisponiveis = exibirCategoriasDisponiveis;
exibirCategoriasDisponiveis = function(categorias, selecionadasIds) {
  window.ultimaListaCategoriasDisponiveis = categorias;
  return _exibirCategoriasDisponiveis.apply(this, arguments);
};

// Salvar categorias selecionadas
function salvarCategoriasSelecionadas() {
  const lojaData = localStorage.getItem("minhaLoja");
  if (!lojaData) {
    app.dialog.alert("Erro ao obter dados da loja", "Erro");
    return;
  }
  const loja = JSON.parse(lojaData);
  const lojinhaId = loja.id;
  if (!window.categoriasSelecionadasLojinha || window.categoriasSelecionadasLojinha.length === 0) {
    app.dialog.alert("Selecione pelo menos uma categoria para sua loja", "Atenção");
    return;
  }
  app.dialog.preloader("Salvando categorias...");
  atualizarCategoriasLojinha(lojinhaId, window.categoriasSelecionadasLojinha, (resp) => {
    app.dialog.close();
    if (resp.status === "success") {
      app.popup.close(".popup-categorias");
      app.dialog.alert("Categorias salvas com sucesso!", "Sucesso");
      // Recarregar dados completos da loja para atualizar visualizações
      buscarDadosCompletosLoja(lojinhaId);
    } else {
      app.dialog.alert("Erro ao salvar categorias: " + (resp.message || "Erro desconhecido"), "Erro");
    }
  });
}

// Atualizar interface após salvar categorias
function atualizarInterfaceCategorias() {
  const lojaData = localStorage.getItem("minhaLoja");
  if (!lojaData) return;
  const loja = JSON.parse(lojaData);
  const lojinhaId = loja.id;
  listarCategoriasLojinha(lojinhaId, (resp) => {
    const displayContainer = $("#categoriasSelecionadasDisplay");
    const tagsContainer = $("#categoriasTagsDisplay");
    if (!displayContainer.length || !tagsContainer.length) return;
    if (resp.status === "success" && resp.data && Array.isArray(resp.data.data) && resp.data.data.length > 0) {
      displayContainer.show();
      tagsContainer.empty();
      resp.data.data.forEach((cat) => {
        tagsContainer.append(`
          <div class="categoria-tag-display">
            <i class="${cat.icone || 'mdi mdi-tag'}"></i>
            <span>${cat.categoria_nome || cat.nome}</span>
          </div>
        `);
      });
    } else {
      displayContainer.hide();
    }
  });
}

// Lógica para abrir popup de logo
$(document).on('click', '#alterarLogoLoja', function() {
  $('#logoPreview').html('');
  $('#novoLogoInput').val('');
  // Exibir logo atual, se existir
  const lojaData = localStorage.getItem('minhaLoja');
  if (lojaData) {
    const loja = JSON.parse(lojaData);
    if (loja.logo_url) {
      $('#logoAtualExibicao').html('<div style="text-align:center;margin-bottom:10px;"><img src="https://vitatop.tecskill.com.br/' + loja.logo_url + '" style="max-width:100%;max-height:80px;border-radius:6px;box-shadow:0 1px 4px #0001;"><br><small style="color:#888;">Logo atual</small></div>');
    } else {
      $('#logoAtualExibicao').html('');
    }
  }
  app.popup.open('.popup-logo-loja');
});

// Botão para abrir o input file do logo
$(document).on('click', '#btnSelecionarLogo', function() {
  $('#novoLogoInput').trigger('click');
});

// Preview do logo
$(document).on('change', '#novoLogoInput', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    $('#logoPreview').html(`<img src="${ev.target.result}" style="max-width:100%;max-height:100px;">`);
  };
  reader.readAsDataURL(file);
});

// Salvar logo
$(document).on('click', '#btnSalvarLogo', function() {
  const file = $('#novoLogoInput')[0].files[0];
  if (!file) {
    app.dialog.alert('Selecione uma imagem para o logo.');
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    app.dialog.alert('O logo deve ter no máximo 2MB.');
    return;
  }
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    app.dialog.alert('Apenas arquivos JPG, JPEG e PNG são permitidos.');
    return;
  }
  const lojaData = localStorage.getItem('minhaLoja');
  if (!lojaData) {
    app.dialog.alert('Erro ao obter dados da loja.');
    return;
  }
  const loja = JSON.parse(lojaData);
  const lojaId = loja.id;
  app.dialog.preloader('Enviando logo...');
  const reader = new FileReader();
  reader.onload = function(ev) {
    const base64 = ev.target.result;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };
    const body = JSON.stringify({
      class: "LojinhaRestService",
      method: "atualizarLoja",
      dados: {
        id: lojaId,
        logo_base64: base64
      }
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
          app.dialog.alert('Logo atualizado com sucesso!');
          app.popup.close('.popup-logo-loja');
          buscarDadosCompletosLoja(lojaId);
        } else {
          app.dialog.alert('Erro ao atualizar logo: ' + (responseJson.message || 'Erro desconhecido'));
        }
      })
      .catch((error) => {
        app.dialog.close();
        app.dialog.alert('Erro ao atualizar logo: ' + error.message);
      });
  };
  reader.readAsDataURL(file);
});

// Sincronização dos campos de cor e hex
function isHexColor(val) {
  return /^#([0-9A-Fa-f]{6})$/.test(val);
}
// Cor Principal (criação)
$(document).on('input change', '#corPrincipal', function() {
  var val = $(this).val().toUpperCase();
  $('#corPrincipalHex').val(val);
  $('#previewCorPrincipal').css('background', val).text(val);
});
$(document).on('input', '#corPrincipalHex', function() {
  var val = $(this).val().toUpperCase();
  if (val[0] !== '#') val = '#' + val.replace(/[^0-9A-F]/gi, '');
  if (val.length > 7) val = val.slice(0,7);
  $(this).val(val);
  if (isHexColor(val)) {
    $('#corPrincipal').val(val);
    $('#previewCorPrincipal').css('background', val).text(val);
  }
});
// Cor Secundária (criação)
$(document).on('input change', '#corSecundaria', function() {
  var val = $(this).val().toUpperCase();
  $('#corSecundariaHex').val(val);
  $('#previewCorSecundaria').css('background', val).text(val);
});
$(document).on('input', '#corSecundariaHex', function() {
  var val = $(this).val().toUpperCase();
  if (val[0] !== '#') val = '#' + val.replace(/[^0-9A-F]/gi, '');
  if (val.length > 7) val = val.slice(0,7);
  $(this).val(val);
  if (isHexColor(val)) {
    $('#corSecundaria').val(val);
    $('#previewCorSecundaria').css('background', val).text(val);
  }
});
// Cor Principal (edição)
$(document).on('input change', '#novaCorPrincipal', function() {
  var val = $(this).val().toUpperCase();
  $('#novaCorPrincipalHex').val(val);
  $('#previewNovaCorPrincipal').css('background', val).text(val);
});
$(document).on('input', '#novaCorPrincipalHex', function() {
  var val = $(this).val().toUpperCase();
  if (val[0] !== '#') val = '#' + val.replace(/[^0-9A-F]/gi, '');
  if (val.length > 7) val = val.slice(0,7);
  $(this).val(val);
  if (isHexColor(val)) {
    $('#novaCorPrincipal').val(val);
    $('#previewNovaCorPrincipal').css('background', val).text(val);
  }
});
// Cor Secundária (edição)
$(document).on('input change', '#novaCorSecundaria', function() {
  var val = $(this).val().toUpperCase();
  $('#novaCorSecundariaHex').val(val);
  $('#previewNovaCorSecundaria').css('background', val).text(val);
});
$(document).on('input', '#novaCorSecundariaHex', function() {
  var val = $(this).val().toUpperCase();
  if (val[0] !== '#') val = '#' + val.replace(/[^0-9A-F]/gi, '');
  if (val.length > 7) val = val.slice(0,7);
  $(this).val(val);
  if (isHexColor(val)) {
    $('#novaCorSecundaria').val(val);
    $('#previewNovaCorSecundaria').css('background', val).text(val);
  }
});
// Atualizar previews ao abrir
function atualizarPreviewsCor() {
  $('#previewCorPrincipal').css('background', $('#corPrincipal').val()).text($('#corPrincipal').val().toUpperCase());
  $('#corPrincipalHex').val($('#corPrincipal').val().toUpperCase());
  $('#previewCorSecundaria').css('background', $('#corSecundaria').val()).text($('#corSecundaria').val().toUpperCase());
  $('#corSecundariaHex').val($('#corSecundaria').val().toUpperCase());
  $('#previewNovaCorPrincipal').css('background', $('#novaCorPrincipal').val()).text($('#novaCorPrincipal').val().toUpperCase());
  $('#novaCorPrincipalHex').val($('#novaCorPrincipal').val().toUpperCase());
  $('#previewNovaCorSecundaria').css('background', $('#novaCorSecundaria').val()).text($('#novaCorSecundaria').val().toUpperCase());
  $('#novaCorSecundariaHex').val($('#novaCorSecundaria').val().toUpperCase());
}
$(document).ready(function() { atualizarPreviewsCor(); });
$(document).on('click', '#btnStep1Next, #btnStep2Back, #btnFinalizar, #editarNomeLoja, .popup-editar-nome', function() { setTimeout(atualizarPreviewsCor, 100); });