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
        // Usuário já tem loja - mostrar tela de gerenciamento
        const loja = responseJson.data.data;
        localStorage.setItem("minhaLoja", JSON.stringify(loja));
        mostrarTelaGerenciamento(loja);
        carregarBannersLoja(loja.id);
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
  
  // Gerar link da loja
  const linkLoja = `https://vitatop.tecskill.com.br/lojinha_vitatop/${loja.nome_loja || "loja"}`;
  localStorage.setItem("linkLoja", linkLoja);
  
  // Carregar categorias selecionadas
  try {
    atualizarInterfaceCategorias();
  } catch (error) {
    console.error("Erro ao atualizar interface de categorias:", error);
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
  $("#bannerInput").val("");
  $("#previewBanner").addClass("display-none");
  $("#uploadArea").show();
  
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
  
  // Se for o step 3, preparar summary
  if (proximoStep === 3) {
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

// Preparar summary no step 3
function prepararSummary() {
  const nomeLoja = $("#nomeLoja").val();
  const temBanner = $("#bannerInput")[0] && $("#bannerInput")[0].files.length > 0;
  const pessoaId = localStorage.getItem("pessoaId");
  
  $("#summaryNome").text(nomeLoja);
  $("#summaryBanner").text(temBanner ? "Banner adicionado" : "Sem banner");
  $("#linkLoja").text(`vitatop.tecskill.com.br/lojinha_vitatop/${nomeLoja}`);
}

// Criar loja
function criarLoja() {
  app.dialog.preloader("Criando sua loja...");
  const pessoaId = localStorage.getItem("pessoaId");
  const nomeLoja = $("#nomeLoja").val();

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + userAuthToken,
  };

  const body = JSON.stringify({
    class: "LojinhaRestService",
    method: "criarLoja",
    dados: {
      pessoa_id: pessoaId,
      nome_loja: nomeLoja
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
        
        // Se tem banner, enviar banner
        const bannerInput = document.getElementById('bannerInput');
        const bannerFile = bannerInput && bannerInput.files[0];
        
        if (bannerFile) {
          enviarBannerLoja(lojaId, bannerFile, function() {
            app.dialog.close();
            mostrarSucessoCriacao();
          });
        } else {
          enviarBannerLoja(lojaId);
          app.dialog.close();
          mostrarSucessoCriacao();
        }
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
    carregarBannersLoja(lojaId);
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
            carregarBannersLoja(loja.id);
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
  app.popup.open(".popup-editar-nome");
}

// Salvar novo nome da loja
function salvarNovoNome() {
  const novoNome = $("#novoNomeLoja").val().trim();
  
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
      nome_loja: novoNome
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
        // Atualizar localStorage
        lojaAtual.nome_loja = novoNome;
        localStorage.setItem("minhaLoja", JSON.stringify(lojaAtual));
        
        // Atualizar tela
        $("#nomeLojaAtual").text(novoNome);
        
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
  // Filtrar apenas categorias habilitadas
  const categoriasAtivas = categorias.filter(cat => String(cat.habilitado) === '1');
  const container = $("#categoriasContainer");
  container.empty();
  // Adicionar contador de categorias selecionadas
  const contadorHTML = `
    <div class="categorias-selecionadas">
      <h5>Categorias Selecionadas: <span id="contadorCategorias">${selecionadasIds.length}</span></h5>
      <div class="categorias-tags" id="categoriasTagsPopup">
        ${categoriasAtivas.filter(cat => selecionadasIds.includes(String(cat.id))).map(cat => `<span class="categoria-tag">${cat.nome}</span>`).join('')}
      </div>
    </div>
  `;
  container.append(contadorHTML);
  categoriasAtivas.forEach((categoria) => {
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
    atualizarContadorCategoriasPopup(categoriasAtivas, window.categoriasSelecionadasLojinha);
  });
}

function atualizarContadorCategoriasPopup(categorias, selecionadasIds) {
  // Filtrar apenas categorias habilitadas
  const categoriasAtivas = categorias.filter(cat => String(cat.habilitado) === '1');
  $("#contadorCategorias").text(selecionadasIds.length);
  const tagsContainer = $("#categoriasTagsPopup");
  tagsContainer.empty();
  categoriasAtivas.filter(cat => selecionadasIds.includes(String(cat.id))).forEach(cat => {
    tagsContainer.append(`<span class="categoria-tag">${cat.nome}</span>`);
  });
}

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
      atualizarInterfaceCategorias();
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
      // Filtrar apenas categorias habilitadas
      const categoriasAtivas = resp.data.data.filter(cat => String(cat.habilitado) === '1');
      if (categoriasAtivas.length > 0) {
        displayContainer.show();
        tagsContainer.empty();
        categoriasAtivas.forEach((cat) => {
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
    } else {
      displayContainer.hide();
    }
  });
}