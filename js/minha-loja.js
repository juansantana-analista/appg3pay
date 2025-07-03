// Funções para Minha Loja - Adicionar ao arquivo funcoes.js

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
      
        console.log(responseJson);
      if (responseJson.status === "success" && responseJson.tem_loja) {
        // Usuário já tem loja - mostrar tela de gerenciamento
        const loja = responseJson.data;
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
  $("#welcome-screen").addClass("display-none");
  $("#create-form").addClass("display-none");
  $("#manage-screen").removeClass("display-none");

  // Atualizar dados da loja na tela
  $("#nomeLojaAtual").text(loja.nome_loja);
  
  // Gerar link da loja
  const linkLoja = `https://vitatop.tecskill.com.br/loja/${loja.id}`;
  localStorage.setItem("linkLoja", linkLoja);
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
  const temBanner = $("#bannerInput")[0].files.length > 0;
  const pessoaId = localStorage.getItem("pessoaId");
  
  $("#summaryNome").text(nomeLoja);
  $("#summaryBanner").text(temBanner ? "Banner adicionado" : "Sem banner");
  $("#linkLoja").text(`vitatop.com/loja/${pessoaId}`);
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
        const lojaId = responseJson.data.id;
        localStorage.setItem("lojaId", lojaId);
        
        // Se tem banner, enviar banner
        const bannerFile = $("#bannerInput")[0].files[0];
        if (bannerFile) {
          enviarBannerLoja(lojaId, bannerFile, function() {
            app.dialog.close();
            mostrarSucessoCriacao();
          });
        } else {
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

// Enviar banner da loja
function enviarBannerLoja(lojaId, arquivo, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userAuthToken,
    };

    const body = JSON.stringify({
      class: "LojinhaBannerRest",
      method: "store",
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
      if (responseJson.status === "success" && responseJson.data.length > 0) {
        exibirBanners(responseJson.data);
        
        // Definir banner principal
        const bannerPrincipal = responseJson.data[0];
        if (bannerPrincipal && bannerPrincipal.url_arquivo) {
          $("#bannerAtual").attr("src", bannerPrincipal.url_arquivo);
        }
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

// Adicionar novo banner
function adicionarNovoBanner() {
  $("#novoBannerInput").click();
}

// Processar novo banner
function processarNovoBanner(arquivo) {
  const lojaId = JSON.parse(localStorage.getItem("minhaLoja")).id;
  
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
          const lojaId = JSON.parse(localStorage.getItem("minhaLoja")).id;
          carregarBannersLoja(lojaId);
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
  const lojaAtual = JSON.parse(localStorage.getItem("minhaLoja"));
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
  
  const lojaAtual = JSON.parse(localStorage.getItem("minhaLoja"));
  
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
  const nomeLoja = JSON.parse(localStorage.getItem("minhaLoja")).nome_loja;
  
  onCompartilhar(
    nomeLoja,
    "Conheça minha loja personalizada na VitaTop!",
    linkLoja
  );
}

// Visualizar loja
function visualizarLoja() {
  const linkLoja = localStorage.getItem("linkLoja");
  
  app.dialog.confirm("Deseja abrir sua loja no navegador?", "Visualizar Loja", function() {
    window.open(linkLoja, '_blank');
  });
}

// Copiar link da loja
function copiarLinkLoja() {
  const linkLoja = localStorage.getItem("linkLoja") || $("#linkLoja").text();
  copiarParaAreaDeTransferencia(linkLoja);
}