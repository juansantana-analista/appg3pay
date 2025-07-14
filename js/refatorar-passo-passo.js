/**
 * PASSO 1: Adicionar as classes utilitárias no INÍCIO do seu funcoes.js atual
 * Copie e cole ANTES de todas as suas funções existentes
 */

// ========== ADICIONAR NO INÍCIO DO ARQUIVO ==========

const CONFIG = {
  API_BASE_URL: "https://vitatophomologa.tecskill.com.br",
  API_ENDPOINT: "https://vitatophomologa.tecskill.com.brrest.php",
  IMAGE_BASE_URL: "https://vitatophomologa.tecskill.com.br",
  DEFAULT_IMAGE: "img/default.png",
  PAGINATION_LIMIT: 30,
  SEARCH_DELAY: 1000,
  COOKIE_EXPIRES_HOURS: 5
};

/**
 * Classe para manipulação de UI - ADICIONAR
 */
class UIManager {
  static showLoader(message = "Carregando...") {
    app.dialog.preloader(message);
  }

  static hideLoader() {
    app.dialog.close();
  }

  static showError(message, title = "Erro") {
    this.hideLoader();
    app.dialog.alert(message, title);
  }

  static showSuccess(message, duration = 2000) {
    const toast = app.toast.create({
      text: message,
      position: "center",
      closeTimeout: duration,
    });
    toast.open();
  }

  static showConfirm(message, callback, title = "Confirmação") {
    app.dialog.confirm(message, title, callback);
  }
}

/**
 * Classe utilitária para formatação - ADICIONAR
 */
class Formatter {
  static currency(value) {
    return parseFloat(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  static date(date) {
    const dateObj = new Date(date);
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", 
                   "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year} ${hours}:${minutes}`;
  }

  static truncateText(text, limit) {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  }
}

/**
 * Classe para gerenciamento de autenticação - MELHORADA
 */
class AuthManager {
  static getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  static setCookie(name, value, hours) {
    let expires = "";
    if (hours) {
      const date = new Date();
      date.setTime(date.getTime() + hours * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/`;
  }

  static deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }

  static validateToken() {
    const userAuthToken = this.getCookie("userAuthToken");
    
    if (!userAuthToken) return false;

    try {
      const base64Url = userAuthToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.expires && payload.expires > currentTime;
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      return false;
    }
  }

  static getAuthHeaders() {
    const token = this.getCookie("userAuthToken");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }
}

// ========== PASSO 2: SUBSTITUIR FUNÇÕES ESPECÍFICAS ==========

/**
 * SUBSTITUA sua função formatarMoeda por esta:
 */
function formatarMoeda(valor) {
  return Formatter.currency(valor);
}

/**
 * SUBSTITUA sua função formatarData por esta:
 */
function formatarData(data) {
  return Formatter.date(data);
}

/**
 * SUBSTITUA sua função truncarNome por esta:
 */
function truncarNome(nome, limite) {
  return Formatter.truncateText(nome, limite);
}

/**
 * SUBSTITUA suas funções de cookie por estas:
 */
function setCookie(name, value, hours) {
  return AuthManager.setCookie(name, value, hours);
}

function getCookie(name) {
  return AuthManager.getCookie(name);
}

function deleteCookie(name) {
  return AuthManager.deleteCookie(name);
}

function validarToken() {
  return AuthManager.validateToken();
}

// ========== PASSO 3: MELHORAR FUNÇÃO ESPECÍFICA ==========

/**
 * SUBSTITUA sua função listarProdutos por esta versão melhorada:
 */
async function listarProdutos(searchQuery = "", categoriaId) {
  try {
    UIManager.showLoader();

    const headers = AuthManager.getAuthHeaders();
    const body = JSON.stringify({
      class: "ProdutoVariacaoRest",
      method: "listarProdutos",
      categoria_id: categoriaId,
      search: searchQuery,
      limit: CONFIG.PAGINATION_LIMIT,
    });

    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: headers,
      body: body,
    });

    const responseJson = await response.json();

    if (responseJson.status === "success" && responseJson.data?.data) {
      const produtos = responseJson.data.data;
      renderProdutos(produtos); // Função separada para renderização
      UIManager.hideLoader();
    } else {
      throw new Error(responseJson.message || "Formato de dados inválido");
    }
  } catch (error) {
    UIManager.showError(`Erro ao carregar produtos: ${error.message}`);
  }
}

/**
 * NOVA FUNÇÃO para renderizar produtos (separar responsabilidades)
 */
function renderProdutos(produtos) {
  const container = document.getElementById("container-produtos");
  container.innerHTML = "";

  produtos.forEach((produto) => {
    const produtoPreco = formatarMoeda(produto.preco_lojavirtual);
    const imagemProduto = produto.foto
      ? CONFIG.IMAGE_BASE_URL + produto.foto
      : CONFIG.DEFAULT_IMAGE;
    const nomeProduto = truncarNome(produto.nome, 40);

    const produtoHTML = `
      <div class="item-card">
        <a data-id="${produto.id}" 
           data-nome="${produto.nome}" 
           data-preco="${produto.preco}"
           data-preco2="${produto.preco2}"
           data-preco_lojavirtual="${produto.preco_lojavirtual}"
           data-imagem="${imagemProduto}"
           href="#" class="item">
          <div class="img-container">
            <img src="${imagemProduto}" alt="${nomeProduto}">
          </div>
          <div class="nome-rating">
            <span class="color-gray product-name">${nomeProduto.toLocaleUpperCase()}</span>                     
            <div class="star-rating">
              <span class="star filled"></span>
              <span class="star filled"></span>
              <span class="star filled"></span>
              <span class="star filled"></span>
              <span class="star filled"></span>
            </div>
            <div class="price">${produtoPreco}</div>
          </div> 
        </a>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', produtoHTML);
  });

  // Adicionar eventos após renderização
  adicionarEventosProdutos();
}

/**
 * NOVA FUNÇÃO para eventos de produtos
 */
function adicionarEventosProdutos() {
  document.querySelectorAll(".item").forEach(item => {
    // Remove event listeners anteriores
    item.replaceWith(item.cloneNode(true));
  });

  document.querySelectorAll(".item").forEach(item => {
    item.addEventListener("click", function(e) {
      e.preventDefault();
      
      const produto = {
        id: this.dataset.id,
        imagem: this.dataset.imagem,
        nome: this.dataset.nome,
        rating: 5,
        likes: 5,
        reviews: 5,
        preco: this.dataset.preco,
        preco2: this.dataset.preco2,
        preco_lojavirtual: this.dataset.preco_lojavirtual,
      };
      
      localStorage.setItem("produtoId", produto.id);
      localStorage.setItem("produto", JSON.stringify(produto));
      app.views.main.router.navigate("/detalhes/");
    });
  });
}

// ========== MANTER SUAS OUTRAS FUNÇÕES COMO ESTÃO POR ENQUANTO ==========

/* 
 * Mantenha todas as outras funções do seu código original:
 * - listarCategorias
 * - buscarProduto  
 * - listarCarrinho
 * - etc...
 * 
 * Vamos migrar gradualmente uma por vez
 */