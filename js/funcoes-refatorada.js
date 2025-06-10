/**
 * VitaTopHomolog App - Core Functions
 * Versão refatorada com boas práticas
 */

// ========== CONFIGURAÇÕES E CONSTANTES ==========
const CONFIG = {
  API_BASE_URL: "https://vitatophomologa.tecskill.com.br/",
  API_ENDPOINT: "https://vitatophomologa.tecskill.com.br/rest.php",
  IMAGE_BASE_URL: "https://vitatophomologa.tecskill.com.br/",
  DEFAULT_IMAGE: "img/default.png",
  PAGINATION_LIMIT: 30,
  SEARCH_DELAY: 1000,
  COOKIE_EXPIRES_HOURS: 5
};

// ========== CLASSES E UTILITÁRIOS ==========

/**
 * Classe para gerenciamento de autenticação
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

/**
 * Classe para requisições HTTP
 */
class HttpClient {
  static async request(method, url, data = null, headers = {}) {
    const config = {
      method,
      headers: { ...AuthManager.getAuthHeaders(), ...headers }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição ${method} para ${url}:`, error);
      throw error;
    }
  }

  static async post(data) {
    return this.request('POST', CONFIG.API_ENDPOINT, data);
  }
}

/**
 * Classe para manipulação de UI
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
 * Classe utilitária para formatação
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

  static timeAgo(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const seconds = Math.floor((now - notificationDate) / 1000);

    if (seconds < 60) return "Agora";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `Há ${days} dia${days > 1 ? "s" : ""}`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `Há ${months} mês${months > 1 ? "es" : ""}`;
    
    const years = Math.floor(days / 365);
    return `Há ${years} ano${years > 1 ? "s" : ""}`;
  }
}

// ========== CLASSES DE SERVIÇOS ==========

/**
 * Serviço base para todas as requisições
 */
class BaseService {
  static async makeRequest(classParam, method, additionalData = {}) {
    const data = {
      class: classParam,
      method: method,
      ...additionalData
    };

    try {
      const response = await HttpClient.post(data);
      
      if (response.status === "success") {
        return response.data;
      } else {
        throw new Error(response.message || "Erro na requisição");
      }
    } catch (error) {
      console.error(`Erro em ${classParam}.${method}:`, error);
      throw error;
    }
  }
}

/**
 * Serviço para gerenciamento de categorias
 */
class CategoryService extends BaseService {
  static async listCategories() {
    return this.makeRequest("ProdutoCategoriaRest", "listarCategorias");
  }

  static renderCategories(categories, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    // Adiciona opção "Todas"
    const allOption = this.createCategoryElement("todas", "mdi mdi-apps", "Todas", true);
    container.appendChild(allOption);

    // Adiciona categorias
    categories.forEach(category => {
      const categoryElement = this.createCategoryElement(
        category.id, 
        category.icone, 
        category.nome
      );
      container.appendChild(categoryElement);
    });

    this.attachCategoryEvents(container);
  }

  static createCategoryElement(id, icon, name, active = false) {
    const div = document.createElement("div");
    div.className = `category-item ${active ? "active" : ""}`;
    div.setAttribute("data-id", id);
    
    div.innerHTML = `
      <div class="category-icon">
        <i class="${icon}"></i>
      </div>
      <div class="category-name">${name}</div>
    `;

    return div;
  }

  static attachCategoryEvents(container) {
    container.addEventListener("click", (e) => {
      const categoryItem = e.target.closest(".category-item");
      if (!categoryItem) return;

      // Remove active de todos
      container.querySelectorAll(".category-item").forEach(item => 
        item.classList.remove("active")
      );

      // Adiciona active ao clicado
      categoryItem.classList.add("active");

      const categoryId = categoryItem.dataset.id;
      const finalCategoryId = categoryId === "todas" ? undefined : categoryId;

      // Lista produtos da categoria
      ProductService.listProducts("", finalCategoryId);
    });
  }
}

/**
 * Serviço para gerenciamento de produtos
 */
class ProductService extends BaseService {
  static async listProducts(searchQuery = "", categoryId = null, limit = CONFIG.PAGINATION_LIMIT) {
    try {
      UIManager.showLoader();

      const response = await this.makeRequest("ProdutoVariacaoRest", "listarProdutos", {
        categoria_id: categoryId,
        search: searchQuery,
        limit
      });

      this.renderProducts(response.data);
      UIManager.hideLoader();
    } catch (error) {
      UIManager.showError(`Erro ao carregar produtos: ${error.message}`);
    }
  }

  static renderProducts(products) {
    const container = document.getElementById("container-produtos");
    container.innerHTML = "";

    products.forEach(product => {
      const productElement = this.createProductElement(product);
      container.appendChild(productElement);
    });

    this.attachProductEvents();
  }

  static createProductElement(product) {
    const div = document.createElement("div");
    div.className = "item-card";

    const imageUrl = product.foto 
      ? CONFIG.IMAGE_BASE_URL + product.foto 
      : CONFIG.DEFAULT_IMAGE;
    
    const productName = Formatter.truncateText(product.nome, 40);
    const productPrice = Formatter.currency(product.preco_lojavirtual);

    div.innerHTML = `
      <a data-id="${product.id}" 
         data-nome="${product.nome}" 
         data-preco="${product.preco}"
         data-preco2="${product.preco2}"
         data-preco_lojavirtual="${product.preco_lojavirtual}"
         data-imagem="${imageUrl}"
         href="#" class="item">
        <div class="img-container">
          <img src="${imageUrl}" alt="${productName}">
        </div>
        <div class="nome-rating">
          <span class="color-gray product-name">${productName.toUpperCase()}</span>                     
          <div class="star-rating">
            ${this.createStarRating(5)}
          </div>
          <div class="price">${productPrice}</div>
        </div> 
      </a>
    `;

    return div;
  }

  static createStarRating(rating) {
    let stars = "";
    for (let i = 0; i < 5; i++) {
      const filled = i < rating ? "filled" : "";
      stars += `<span class="star ${filled}"></span>`;
    }
    return stars;
  }

  static attachProductEvents() {
    document.querySelectorAll(".item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        
        const productData = {
          id: item.dataset.id,
          imagem: item.dataset.imagem,
          nome: item.dataset.nome,
          rating: 5,
          likes: 5,
          reviews: 5,
          preco: item.dataset.preco,
          preco2: item.dataset.preco2,
          preco_lojavirtual: item.dataset.preco_lojavirtual,
        };

        localStorage.setItem("produtoId", productData.id);
        localStorage.setItem("produto", JSON.stringify(productData));
        app.views.main.router.navigate("/detalhes/");
      });
    });
  }

  static async getProductDetails(productId) {
    try {
      UIManager.showLoader();

      const response = await this.makeRequest("ProdutoVariacaoRest", "obterProdutoCompleto", {
        produto_id: productId
      });

      if (response.status === "success") {
        return response.data;
      } else {
        throw new Error(response.message || "Erro ao carregar produto");
      }
    } catch (error) {
      UIManager.showError(`Erro ao carregar produto: ${error.message}`);
      throw error;
    } finally {
      UIManager.hideLoader();
    }
  }
}

/**
 * Serviço para gerenciamento de carrinho
 */
class CartService extends BaseService {
  static async addToCart(productId, quantity = 1) {
    try {
      UIManager.showLoader();
      
      const pessoaId = localStorage.getItem("pessoaId");
      const response = await this.makeRequest("PagamentoSafe2payRest", "IncluirCarrinho", {
        dados: {
          pessoa_id: pessoaId,
          produto_id: productId,
          quantidade: quantity,
        }
      });

      if (response.status === "sucess") {
        UIManager.showSuccess("Produto adicionado ao carrinho");
        this.updateCartCount();
        app.views.main.router.navigate("/home/");
      } else {
        throw new Error(response.message || "Erro ao adicionar produto");
      }
    } catch (error) {
      UIManager.showError(`Erro ao adicionar ao carrinho: ${error.message}`);
    } finally {
      UIManager.hideLoader();
    }
  }

  static async listCart() {
    try {
      UIManager.showLoader();
      
      const pessoaId = localStorage.getItem("pessoaId");
      const response = await this.makeRequest("PagamentoSafe2payRest", "ListarCarrinho", {
        dados: { pessoa_id: pessoaId }
      });

      if (response.status === "sucess") {
        return response.data;
      } else {
        throw new Error("Erro ao carregar carrinho");
      }
    } catch (error) {
      UIManager.showError(`Erro ao carregar carrinho: ${error.message}`);
      throw error;
    } finally {
      UIManager.hideLoader();
    }
  }

  static async updateCartCount() {
    try {
      const cartData = await this.listCart();
      const itemCount = cartData.itens ? cartData.itens.length : 0;
      
      // Atualizar badges na UI
      document.querySelectorAll(".btn-cart, .cart-badge").forEach(badge => {
        badge.setAttribute("data-count", itemCount);
      });
    } catch (error) {
      console.error("Erro ao atualizar contador do carrinho:", error);
    }
  }

  static async removeFromCart(pessoaId, productId) {
    try {
      UIManager.showLoader();

      const response = await this.makeRequest("PagamentoSafe2payRest", "ExcluirCarrinho", {
        dados: {
          pessoa_id: pessoaId,
          produto_id: productId,
        }
      });

      if (response.status === "sucess") {
        this.updateCartCount();
        return true;
      } else {
        throw new Error(response.message || "Erro ao remover item");
      }
    } catch (error) {
      UIManager.showError(`Erro ao remover item: ${error.message}`);
      return false;
    } finally {
      UIManager.hideLoader();
    }
  }

  static async updateQuantity(pessoaId, productId, quantity) {
    try {
      UIManager.showLoader();

      const response = await this.makeRequest("PagamentoSafe2payRest", "AlterarCarrinho", {
        dados: {
          pessoa_id: pessoaId,
          produto_id: productId,
          quantidade: quantity,
        }
      });

      if (response.status === "sucess") {
        app.views.main.router.refreshPage();
        return true;
      } else {
        throw new Error(response.message || "Erro ao alterar quantidade");
      }
    } catch (error) {
      UIManager.showError(`Erro ao alterar quantidade: ${error.message}`);
      return false;
    } finally {
      UIManager.hideLoader();
    }
  }

  static async clearCart() {
    try {
      UIManager.showLoader();
      
      const pessoaId = localStorage.getItem("pessoaId");
      const response = await this.makeRequest("PagamentoSafe2payRest", "LimparCarrinho", {
        dados: { pessoa_id: pessoaId }
      });

      if (response.status === "sucess") {
        app.views.main.router.refreshPage();
        return true;
      } else {
        throw new Error("Erro ao limpar carrinho");
      }
    } catch (error) {
      UIManager.showError(`Erro ao limpar carrinho: ${error.message}`);
      return false;
    } finally {
      UIManager.hideLoader();
    }
  }
}

/**
 * Serviço para gerenciamento de notificações
 */
class NotificationService extends BaseService {
  static async listNotifications() {
    try {
      UIManager.showLoader();
      
      const userId = localStorage.getItem("userId");
      const response = await this.makeRequest("NotificacaoAppRest", "ListarNotificacoes", {
        id_usuario: userId
      });

      if (response.status === "success") {
        this.renderNotifications(response.data);
      } else {
        throw new Error("Erro ao carregar notificações");
      }
    } catch (error) {
      UIManager.showError(`Erro ao carregar notificações: ${error.message}`);
    } finally {
      UIManager.hideLoader();
    }
  }

  static renderNotifications(notifications) {
    const container = document.getElementById("container-notificacao");
    
    if (notifications.length === 0) {
      container.innerHTML = `
        <div class="text-align-center">
          <img width="150" src="img/bell.gif">
          <br><span class="color-gray">Nada por enquanto...</span>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    
    notifications.forEach(notification => {
      const notificationElement = this.createNotificationElement(notification);
      container.appendChild(notificationElement);
    });

    this.attachNotificationEvents();
  }

  static createNotificationElement(notification) {
    const div = document.createElement("div");
    const isViewed = notification.visto === "S";
    
    div.className = `notification-item swipeable ${isViewed ? "visto" : "nao-visto"}`;
    div.setAttribute("data-notification-id", notification.id);

    div.innerHTML = `
      <div class="notification-icon">
        ${notification.icone || '<i class="mdi mdi-bell"></i>'}
      </div>
      <div class="notification-content">
        <h3>${notification.titulo}</h3>
        <p>${Formatter.truncateText(notification.mensagem, 25)}</p>
      </div>
      <div class="notification-actions">
        <button class="action-btn" 
          data-id="${notification.id}"
          data-icone="${notification.icone}"
          data-titulo="${notification.titulo}"
          data-mensagem="${notification.mensagem}"
          data-data="${Formatter.date(notification.data_criacao)}">
          Detalhes
        </button>
      </div>
      <div class="notification-time">${Formatter.timeAgo(notification.data_criacao)}</div>
    `;

    return div;
  }

  static attachNotificationEvents() {
    // Eventos de swipe para deletar
    document.querySelectorAll(".swipeable").forEach(item => {
      this.addSwipeToDelete(item);
    });

    // Eventos de clique para ver detalhes
    document.querySelectorAll(".action-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const data = e.target.dataset;
        this.showNotificationDetails(data);
        this.markAsRead(data.id);
      });
    });
  }

  static addSwipeToDelete(element) {
    let startX = 0;

    element.addEventListener("touchstart", (e) => {
      startX = e.touches[0].pageX;
    });

    element.addEventListener("touchmove", (e) => {
      const moveX = e.touches[0].pageX;
      const deltaX = moveX - startX;

      if (deltaX > 0) {
        element.style.transform = `translateX(${deltaX}px)`;
      }
    });

    element.addEventListener("touchend", (e) => {
      const moveX = e.changedTouches[0].pageX;
      const deltaX = moveX - startX;

      if (deltaX > 100) {
        const notificationId = element.dataset.notificationId;
        this.deleteNotification(notificationId);
        element.style.transform = "translateX(100%)";
        element.style.opacity = "0";
        setTimeout(() => element.remove(), 300);
      } else {
        element.style.transform = "translateX(0)";
      }
    });
  }

  static showNotificationDetails(data) {
    document.getElementById("icone-pop").innerHTML = data.icone || '<i class="mdi mdi-bell"></i>';
    document.getElementById("title-pop").textContent = data.titulo;
    document.getElementById("descricao-pop").textContent = data.mensagem;
    document.getElementById("data-pop").textContent = Formatter.timeAgo(data.data);
    
    app.popup.open(".popup-detalhes-notificacao");
  }

  static async markAsRead(notificationId) {
    try {
      await this.makeRequest("NotificacaoAppRest", "NotificacaoLida", {
        id_notificacao: notificationId
      });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  }

  static async deleteNotification(notificationId) {
    try {
      await this.makeRequest("NotificacaoAppRest", "ApagarNotificacao", {
        id_notificacao: notificationId
      });
    } catch (error) {
      console.error("Erro ao apagar notificação:", error);
    }
  }

  static async getNotificationCount() {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await this.makeRequest("NotificacaoAppRest", "QtdeNotificacoes", {
        id_usuario: userId
      });

      if (response.status === "success") {
        const count = response.data.quantidade || 0;
        this.updateNotificationBadges(count);
      }
    } catch (error) {
      console.error("Erro ao buscar quantidade de notificações:", error);
    }
  }

  static updateNotificationBadges(count) {
    setTimeout(() => {
      // Atualizar badge no cabeçalho
      const btnNotificacao = document.querySelector(".btn-notificacao");
      if (btnNotificacao) {
        btnNotificacao.setAttribute("data-count", count);
      }

      // Atualizar badge no menu lateral
      const badgeMenuLateral = document.getElementById("badge-notif-menu");
      if (badgeMenuLateral) {
        badgeMenuLateral.setAttribute("data-count", count);
        badgeMenuLateral.textContent = count;
      }

      localStorage.setItem("qtdeNotificacoes", count);
    }, 100);
  }
}

// ========== FUNÇÕES GLOBAIS PARA COMPATIBILIDADE ==========

// Mantém compatibilidade com o código existente
window.validarToken = () => AuthManager.validateToken();
window.setCookie = (name, value, hours) => AuthManager.setCookie(name, value, hours);
window.getCookie = (name) => AuthManager.getCookie(name);
window.deleteCookie = (name) => AuthManager.deleteCookie(name);

window.listarCategorias = async () => {
  try {
    const categories = await CategoryService.listCategories();
    CategoryService.renderCategories(categories.data, "container-categorias");
  } catch (error) {
    UIManager.showError(`Erro ao carregar categorias: ${error.message}`);
  }
};

window.listarProdutos = (searchQuery, categoryId) => {
  ProductService.listProducts(searchQuery, categoryId);
};

window.buscarProduto = async () => {
  const productId = localStorage.getItem("produtoId");
  try {
    const productData = await ProductService.getProductDetails(productId);
    // Implementar renderização dos detalhes do produto
    console.log("Dados do produto:", productData);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
  }
};

window.adicionarItemCarrinho = (productId) => {
  CartService.addToCart(productId);
};

window.contarCarrinho = () => {
  CartService.updateCartCount();
};

window.listarNotificacoes = () => {
  NotificationService.listNotifications();
};

window.buscarQtdeNotif = () => {
  NotificationService.getNotificationCount();
};

// Funções utilitárias globais
window.formatarMoeda = (value) => Formatter.currency(value);
window.formatarData = (date) => Formatter.date(date);
window.truncarNome = (text, limit) => Formatter.truncateText(text, limit);
window.timeAgo = (date) => Formatter.timeAgo(date);

// Função para limpeza de localStorage
window.clearLocalStorage = () => {
  const itemsToRemove = [
    "produtoId", "enderecoSelecionado", "produto", 
    "enderecoDetalhes", "emailRecuperacao"
  ];
  itemsToRemove.forEach(item => localStorage.removeItem(item));
};

window.fazerLogout = () => {
  const itemsToRemove = [
    "userAuthToken", "user", "userId", "userName", 
    "userEmail", "pessoaId", "codigo_indicador", "validadeToken"
  ];
  itemsToRemove.forEach(item => localStorage.removeItem(item));
};

// Função para compartilhamento
window.onCompartilhar = async (titulo, texto, url) => {
  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, text: texto, url: url });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  } else {
    alert("Compartilhamento não suportado neste navegador.");
  }
};

// Função para copiar texto
window.copiarParaAreaDeTransferencia = (texto) => {
  const tempElement = document.createElement("textarea");
  tempElement.value = texto;
  document.body.appendChild(tempElement);
  tempElement.select();
  tempElement.setSelectionRange(0, 99999);
  document.execCommand("copy");
  document.body.removeChild(tempElement);
  
  UIManager.showSuccess("Texto copiado para a área de transferência!");
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar variáveis globais
  window.userAuthToken = AuthManager.getCookie('userAuthToken') || "";
  window.appId = "Bearer " + window.userAuthToken;
  
  console.log("VitaTopHomolog App Core Functions carregado");
});