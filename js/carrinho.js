// carrinho.js - Sistema completo de carrinho de compras
$(document).ready(function() {
    // Configurações da API
    const apiServerUrl = "https://vitatophomologa.tecskill.com.br/rest.php";
    const userAuthToken = getCookie("userAuthToken");
    const pessoaId = localStorage.getItem("pessoaId");
    
    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + userAuthToken,
    };

    // Variáveis globais
    let carrinhoData = {};
    let enderecosDisponiveis = [];
    let enderecoSelecionado = null;
    let metodoPagamentoSelecionado = '3'; // PIX por padrão
    let requisicoesPendentes = new Set(); 
    let timeoutSincronizacao = null; // Timeout para sincronização
    let sincronizandoCarrinho = false; // Flag para evitar conflitos

    // Verificar se as variáveis necessárias estão disponíveis
    if (!userAuthToken) {
        console.error('Token de autenticação não encontrado');
        alert('Erro de autenticação. Por favor, faça login novamente.');
        // Redirecionar para login se necessário
        // window.location.href = '/login/';
        return;
    }

    if (!pessoaId) {
        console.error('ID da pessoa não encontrado');
        alert('Erro de sessão. Por favor, faça login novamente.');
        // Redirecionar para login se necessário
        // window.location.href = '/login/';
        return;
    }

    console.log('Inicializando carrinho com:', { pessoaId, userAuthToken: userAuthToken ? 'Presente' : 'Ausente' });

    // Função para obter cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return '';
    }

    // Função para formatar preço
    function formatPrice(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Função para fazer requisições à API
    async function makeApiRequest(className, methodName, dados = {}) {
        // Criar uma chave única para a requisição
        const requestKey = `${className}-${methodName}-${JSON.stringify(dados)}`;
        
        // Se já existe uma requisição idêntica pendente, aguardar
        if (requisicoesPendentes.has(requestKey)) {
            console.log('Requisição já em andamento, aguardando...', requestKey);
            return new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (!requisicoesPendentes.has(requestKey)) {
                        clearInterval(checkInterval);
                        resolve(makeApiRequest(className, methodName, dados));
                    }
                }, 100);
            });
        }
        
        // Adicionar à lista de requisições pendentes
        requisicoesPendentes.add(requestKey);
        
        let body;
        
        // Verificar se é uma API que usa estrutura aninhada (como PagamentoSafe2payRest)
        if (className === 'PagamentoSafe2payRest') {
            body = JSON.stringify({
                class: className,
                method: methodName,
                dados: dados  // Estrutura aninhada para PagamentoSafe2payRest
            });
        } else {
            // Estrutura plana para outras APIs (como PessoaRestService)
            body = JSON.stringify({
                class: className,
                method: methodName,
                ...dados  // Spread dos dados no nível raiz
            });
        }

        const options = {
            method: "POST",
            headers: headers,
            body: body,
        };

        try {
            console.log('Enviando requisição:', { className, methodName, dados });
            console.log('Body da requisição:', body);
            
            const response = await fetch(apiServerUrl, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseText = await response.text();
            
            console.log('Resposta bruta:', responseText);
            
            // Verificar se a resposta é JSON válido
            if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
                console.error('Resposta não é JSON válido:', responseText);
                throw new Error('Resposta da API não é JSON válido: ' + responseText.substring(0, 200));
            }
            
            const data = JSON.parse(responseText);
            console.log('Resposta parseada:', data);
            
            // Remover da lista de requisições pendentes
            requisicoesPendentes.delete(requestKey);
            
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            // Remover da lista de requisições pendentes mesmo em caso de erro
            requisicoesPendentes.delete(requestKey);
            throw error;
        }
    }

    // ==================== FUNÇÕES DE CARRINHO LOCAL ====================

    // Salvar carrinho no localStorage
    function salvarCarrinhoLocal(carrinho) {
        try {
            const carrinhoJson = JSON.stringify(carrinho);
            localStorage.setItem(`carrinho_${pessoaId}`, carrinhoJson);
            console.log('Carrinho salvo localmente:', carrinho);
        } catch (error) {
            console.error('Erro ao salvar carrinho local:', error);
        }
    }

    // Carregar carrinho do localStorage
    function carregarCarrinhoLocal() {
        try {
            const carrinhoJson = localStorage.getItem(`carrinho_${pessoaId}`);
            if (carrinhoJson) {
                const carrinho = JSON.parse(carrinhoJson);
                console.log('Carrinho carregado localmente:', carrinho);
                return carrinho;
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho local:', error);
        }
        return null;
    }

    // Limpar carrinho local
    function limparCarrinhoLocal() {
        localStorage.removeItem(`carrinho_${pessoaId}`);
    }

    // Sincronizar carrinho local com servidor
    async function sincronizarCarrinho() {
        if (sincronizandoCarrinho) return;
        
        sincronizandoCarrinho = true;
        console.log('Sincronizando carrinho com servidor...');

        // Mostrar preloader durante sincronização
        if (typeof app !== 'undefined' && app.dialog) {
            app.dialog.preloader("Sincronizando carrinho...");
        }

        try {
            const carrinhoLocal = carregarCarrinhoLocal();
            if (!carrinhoLocal || !carrinhoLocal.itens) {
                sincronizandoCarrinho = false;
                // Fechar preloader se não há nada para sincronizar
                if (typeof app !== 'undefined' && app.dialog) {
                    app.dialog.close();
                }
                return;
            }

            // Enviar atualizações apenas para itens que ainda existem no carrinho local
            for (const item of carrinhoLocal.itens) {
                try {
                    await makeApiRequest('PagamentoSafe2payRest', 'AlterarCarrinho', {
                        pessoa_id: pessoaId,
                        produto_id: item.produto_id,
                        quantidade: item.quantidade
                    });
                } catch (error) {
                    console.error('Erro ao sincronizar item:', item.produto_id, error);
                }
            }

            // Após sincronizar mudanças de quantidade, recarregar do servidor para confirmar
            // IMPORTANTE: Não sobrescrever remoções que foram feitas localmente
            console.log('Sincronização de quantidades concluída');
            
        } catch (error) {
            console.error('Erro na sincronização:', error);
        } finally {
            sincronizandoCarrinho = false;
            // Sempre fechar preloader ao finalizar
            if (typeof app !== 'undefined' && app.dialog) {
                app.dialog.close();
            }
        }
    }

    // Agendar sincronização
    function agendarSincronizacao() {
        if (timeoutSincronizacao) {
            clearTimeout(timeoutSincronizacao);
        }
        
        timeoutSincronizacao = setTimeout(() => {
            sincronizarCarrinho();
        }, 2000); // Sincronizar após 2 segundos de inatividade
    }

    // Carregar carrinho do servidor
    async function carregarCarrinhoServidor() {
        try {
            console.log('Carregando carrinho do servidor para pessoa ID:', pessoaId);
            
            const response = await makeApiRequest('PagamentoSafe2payRest', 'ListarCarrinho', {
                pessoa_id: pessoaId
            });

            console.log('Resposta completa carrinho:', response);

            if (response.status === 'success' && response.data.status === 'sucess') {
                carrinhoData = response.data.data;
                console.log('Dados do carrinho do servidor:', carrinhoData);
                
                // Salvar no localStorage
                salvarCarrinhoLocal(carrinhoData);
                
                renderizarCarrinho();
                atualizarResumo();
            } else {
                console.error('Erro ao carregar carrinho:', response.data?.message || response.message);
                // Se falhar, usar versão local se disponível
                const carrinhoLocal = carregarCarrinhoLocal();
                if (carrinhoLocal) {
                    carrinhoData = carrinhoLocal;
                    renderizarCarrinho();
                    atualizarResumo();
                } else {
                    carrinhoData = { itens: [], total: 0, total_sem_desconto: 0, valor_frete: 0 };
                    renderizarCarrinho();
                    atualizarResumo();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho do servidor:', error);
            
            // Em caso de erro, usar versão local
            const carrinhoLocal = carregarCarrinhoLocal();
            if (carrinhoLocal) {
                carrinhoData = carrinhoLocal;
                console.log('Usando carrinho local devido a erro do servidor');
            } else {
                carrinhoData = { itens: [], total: 0, total_sem_desconto: 0, valor_frete: 0 };
            }
            
            renderizarCarrinho();
            atualizarResumo();
        }
    }

    // Função principal para carregar carrinho (tenta local primeiro)
    async function carregarCarrinho() {
        // Primeiro, tentar carregar do localStorage para resposta rápida
        const carrinhoLocal = carregarCarrinhoLocal();
        if (carrinhoLocal) {
            carrinhoData = carrinhoLocal;
            renderizarCarrinho();
            atualizarResumo();
            console.log('Carrinho carregado do localStorage');
        }

        // Depois, carregar do servidor em background
        await carregarCarrinhoServidor();
    }

    // Renderizar itens do carrinho
    function renderizarCarrinho() {
        const listaCarrinho = $('#listaCarrinho');
        listaCarrinho.empty();

        if (!carrinhoData.itens || carrinhoData.itens.length === 0) {
            listaCarrinho.html(`
                <div class="text-center py-8">
                    <p class="text-gray-500">Seu carrinho está vazio</p>
                    <a href="/home/" class="text-blue-600 mt-2 inline-block">Continuar comprando</a>
                </div>
            `);
            return;
        }

        carrinhoData.itens.forEach(item => {
            const itemHtml = `
                <div class="flex space-x-4" style="margin-bottom: 18px;" data-produto-id="${item.produto_id}">
                    <img
                        src="https://vitatophomologa.tecskill.com.br/${item.foto}"
                        alt="${item.nome}"
                        class="w-20 h-20 rounded-lg object-cover"
                    />
                    <div class="flex-1">
                        <div class="flex justify-between">
                            <h3 class="font-medium">${item.nome}</h3>
                            <button class="text-red-500 delete-item" style="width: 30px;" data-produto-id="${item.produto_id}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                        <p class="text-gray-500 text-sm mb-2">Premium</p>
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-2">
                                <button class="minus w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" data-produto-id="${item.produto_id}" data-produto-qtde="${item.quantidade}">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                                    </svg>
                                </button>
                                <span class="w-8 text-center">${item.quantidade}</span>
                                <button class="plus w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center" data-produto-id="${item.produto_id}" data-produto-qtde="${item.quantidade}">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                </button>
                            </div>
                            <span class="font-semibold">${formatPrice(parseFloat(item.preco_total))}</span>
                        </div>
                    </div>
                </div>
            `;
            listaCarrinho.append(itemHtml);
        });

        // Adicionar eventos de clique para os novos botões
        $('.delete-item').off('click').on('click', function() {
            const produtoId = $(this).data('produto-id');
            removerItem(produtoId);
        });

        $('.minus').off('click').on('click', function() {
            const produtoId = $(this).data('produto-id');
            const quantidadeAtual = parseInt($(this).data('produto-qtde'));
            alterarQuantidade(produtoId, quantidadeAtual - 1);
        });

        $('.plus').off('click').on('click', function() {
            const produtoId = $(this).data('produto-id');
            const quantidadeAtual = parseInt($(this).data('produto-qtde'));
            alterarQuantidade(produtoId, quantidadeAtual + 1);
        });
        
        // Mostrar indicador discreto se há sincronização pendente (mas não preloader)
        if (timeoutSincronizacao && !sincronizandoCarrinho) {
            if (!$('.sync-indicator').length) {
                $('body').append(`
                    <div class="sync-indicator" style="position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; z-index: 1000;">
                        <i class="mdi mdi-sync mdi-spin"></i> Pendente
                    </div>
                `);
            }
        } else {
            $('.sync-indicator').remove();
        }
    }

    // Alterar quantidade localmente (sem requisição imediata)
    window.alterarQuantidade = function(produtoId, novaQuantidade) {
        console.log(`Alterando quantidade do produto ${produtoId} para ${novaQuantidade}`);
        
        if (novaQuantidade <= 0) {
            removerItemLocal(produtoId);
            return;
        }

        // Atualizar carrinho local imediatamente
        if (carrinhoData.itens) {
            const item = carrinhoData.itens.find(i => i.produto_id == produtoId);
            if (item) {
                const quantidadeAnterior = parseInt(item.quantidade);
                const precoUnitario = parseFloat(item.preco_unitario);
                
                // Atualizar quantidade e recalcular preços
                item.quantidade = novaQuantidade;
                item.preco_total = (precoUnitario * novaQuantidade).toFixed(2);
                
                // Recalcular totais
                recalcularTotais();
                
                // Salvar no localStorage
                salvarCarrinhoLocal(carrinhoData);
                
                // Atualizar interface
                renderizarCarrinho();
                atualizarResumo();
                
                // Agendar sincronização com servidor
                agendarSincronizacao();
                
                console.log(`Quantidade alterada de ${quantidadeAnterior} para ${novaQuantidade}`);
            }
        }
    };

    // Remover item localmente e do servidor
    async function removerItemLocal(produtoId) {
        if (carrinhoData.itens) {
            const index = carrinhoData.itens.findIndex(i => i.produto_id == produtoId);
            if (index !== -1) {
                // Remover do array local imediatamente
                carrinhoData.itens.splice(index, 1);
                
                // Recalcular totais
                recalcularTotais();
                
                // Salvar no localStorage
                salvarCarrinhoLocal(carrinhoData);
                
                // Atualizar interface
                renderizarCarrinho();
                atualizarResumo();
                
                console.log(`Item ${produtoId} removido localmente`);
                
                // Remover do servidor imediatamente (não agendar)
                try {
                    const response = await makeApiRequest('PagamentoSafe2payRest', 'ExcluirCarrinho', {
                        pessoa_id: pessoaId,
                        produto_id: produtoId
                    });

                    if (response.status === 'success' && response.data.status === 'sucess') {
                        console.log(`Item ${produtoId} removido do servidor com sucesso`);
                    } else {
                        console.error('Erro ao remover item do servidor:', response.data?.message || response.message);
                        // Em caso de erro, recarregar do servidor para sincronizar
                        await carregarCarrinhoServidor();
                    }
                } catch (error) {
                    console.error('Erro ao remover item do servidor:', error);
                    // Em caso de erro, recarregar do servidor para sincronizar
                    await carregarCarrinhoServidor();
                }
            }
        }
    }

    // Recalcular totais do carrinho
    function recalcularTotais() {
        if (!carrinhoData.itens) return;
        
        let totalSemDesconto = 0;
        let total = 0;
        
        carrinhoData.itens.forEach(item => {
            const precoOriginalTotal = parseFloat(item.preco_original) * parseInt(item.quantidade);
            const precoTotal = parseFloat(item.preco_total);
            
            totalSemDesconto += precoOriginalTotal;
            total += precoTotal;
        });
        
        carrinhoData.total_sem_desconto = totalSemDesconto.toFixed(2);
        carrinhoData.total = total.toFixed(2);
        
        console.log('Totais recalculados:', { totalSemDesconto, total });
    }

    // Remover item do carrinho
    window.removerItem = async function(produtoId) {
        if (!confirm('Deseja remover este item do carrinho?')) return;
        
        // Mostrar preloader durante remoção
        if (typeof app !== 'undefined' && app.dialog) {
            app.dialog.preloader("Removendo item...");
        }
        
        try {
            await removerItemLocal(produtoId);
        } finally {
            // Fechar preloader
            if (typeof app !== 'undefined' && app.dialog) {
                app.dialog.close();
            }
        }
    };

    // Limpar carrinho
    $('#esvaziar').on('click', function(e) {
        e.preventDefault();
        
        if (!confirm('Deseja esvaziar todo o carrinho?')) return;

        // Limpar localmente primeiro
        carrinhoData = { itens: [], total: 0, total_sem_desconto: 0, valor_frete: 0 };
        salvarCarrinhoLocal(carrinhoData);
        renderizarCarrinho();
        atualizarResumo();
        
        $('.popover-menu').removeClass('modal-in').addClass('modal-out');

        // Sincronizar com servidor em background
        makeApiRequest('PagamentoSafe2payRest', 'LimparCarrinho', {
            pessoa_id: pessoaId
        }).then(response => {
            if (response.status === 'success' && response.data.status === 'sucess') {
                console.log('Carrinho limpo no servidor');
            } else {
                console.error('Erro ao limpar carrinho no servidor:', response.data?.message || response.message);
            }
        }).catch(error => {
            console.error('Erro ao limpar carrinho no servidor:', error);
        });
    });

    // Atualizar resumo do pedido
    function atualizarResumo() {
        const totalSemDesconto = parseFloat(carrinhoData.total_sem_desconto) || 0;
        const total = parseFloat(carrinhoData.total) || 0;
        const valorFrete = parseFloat(carrinhoData.valor_frete) || 0;
        
        $('#subtotal').text(formatPrice(totalSemDesconto));
        $('#totalCarrinho').text(formatPrice(total));
        
        if (valorFrete > 0) {
            $('#fretePedido').text(formatPrice(valorFrete)).removeClass('text-green-600');
        } else {
            $('#fretePedido').text('Grátis').addClass('text-green-600');
        }
    }

    // ==================== FUNÇÕES DE ENDEREÇO ====================

    // Carregar endereços
    async function carregarEnderecos() {
        try {
            console.log('Carregando endereços para pessoa ID:', pessoaId);
            
            const response = await makeApiRequest('PessoaRestService', 'listarPessoa', {
                pessoa_id: pessoaId
            });

            console.log('Resposta completa endereços:', response);

            if (response.status === 'success' && response.data.status === 'success') {
                enderecosDisponiveis = response.data.data.enderecos || [];
                console.log('Endereços carregados:', enderecosDisponiveis);
                renderizarEnderecos();
                selecionarEnderecoPrincipal();
            } else {
                console.error('Erro ao carregar endereços:', response.data?.message || response.message);
                // Se não conseguir carregar, inicializar array vazio
                enderecosDisponiveis = [];
                renderizarEnderecos();
            }
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
            enderecosDisponiveis = [];
            renderizarEnderecos();
            
            // Mostrar erro mais detalhado para o usuário se necessário
            if (error.message.includes('JSON')) {
                alert('Erro de comunicação com o servidor. Verifique sua conexão.');
            }
        }
    }

    // Renderizar lista de endereços
    function renderizarEnderecos() {
        const lista = $('#listaDeEnderecos');
        lista.empty();

        if (!enderecosDisponiveis || enderecosDisponiveis.length === 0) {
            lista.html(`
                <div class="text-center py-4">
                    <p class="text-gray-500">Nenhum endereço cadastrado</p>
                </div>
            `);
            return;
        }

        enderecosDisponiveis.forEach(endereco => {
            const principal = endereco.principal === 'S';
            const enderecoHtml = `
                <div class="endereco-item p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${principal ? 'border-blue-500 bg-blue-50' : ''}" 
                     data-endereco-id="${endereco.id}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-medium">${endereco.nome_endereco || 'Endereço'}</h4>
                            <p class="text-sm text-gray-600">
                                ${endereco.rua}, ${endereco.numero}
                                ${endereco.complemento ? ', ' + endereco.complemento : ''}
                            </p>
                            <p class="text-sm text-gray-600">
                                ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado.sigla}
                            </p>
                            <p class="text-sm text-gray-600">CEP: ${endereco.cep}</p>
                            ${principal ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Principal</span>' : ''}
                        </div>
                        <div class="flex space-x-2">
                            <button class="text-blue-600 hover:text-blue-800" onclick="editarEndereco(${endereco.id})">
                                <i class="mdi mdi-pencil"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-800" onclick="excluirEndereco(${endereco.id})">
                                <i class="mdi mdi-delete"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            lista.append(enderecoHtml);
        });

        // Adicionar evento de clique para selecionar endereço
        $('.endereco-item').on('click', function() {
            const enderecoId = $(this).data('endereco-id');
            selecionarEndereco(enderecoId);
        });
    }

    // Selecionar endereço
    async function selecionarEndereco(enderecoId) {
        try {
            const response = await makeApiRequest('PagamentoSafe2payRest', 'AlterarEndereco', {
                pessoa_id: pessoaId,
                endereco_id: enderecoId
            });

            if (response.status === 'success') {
                enderecoSelecionado = enderecosDisponiveis.find(e => e.id == enderecoId);
                atualizarEnderecoSelecionado();
                $('#addressModal').addClass('hidden');
                
                // Atualizar frete se necessário
                if (response.data.frete !== undefined) {
                    carrinhoData.valor_frete = response.data.frete;
                    atualizarResumo();
                }
            }
        } catch (error) {
            console.error('Erro ao selecionar endereço:', error);
        }
    }

    // Selecionar endereço principal automaticamente
    function selecionarEnderecoPrincipal() {
        const enderecoPrincipal = enderecosDisponiveis.find(e => e.principal === 'S');
        if (enderecoPrincipal) {
            enderecoSelecionado = enderecoPrincipal;
            atualizarEnderecoSelecionado();
        }
    }

    // Atualizar endereço selecionado na tela
    function atualizarEnderecoSelecionado() {
        const container = $('#selectedAddress');
        
        if (enderecoSelecionado) {
            container.html(`
                <div>
                    <h4 class="font-medium">${enderecoSelecionado.nome_endereco || 'Endereço'}</h4>
                    <p class="text-sm text-gray-600">
                        ${enderecoSelecionado.rua}, ${enderecoSelecionado.numero}
                        ${enderecoSelecionado.complemento ? ', ' + enderecoSelecionado.complemento : ''}
                    </p>
                    <p class="text-sm text-gray-600">
                        ${enderecoSelecionado.bairro}, ${enderecoSelecionado.cidade} - ${enderecoSelecionado.estado.sigla}
                    </p>
                    <p class="text-sm text-gray-600">CEP: ${enderecoSelecionado.cep}</p>
                </div>
            `);
        } else {
            container.html('<p class="text-gray-500">Selecione um endereço de entrega</p>');
        }
    }

    // Buscar CEP
    async function buscarCEP(cep, isEdit = false) {
        const cepLimpo = cep.replace(/\D/g, '');
        
        if (cepLimpo.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                const prefix = isEdit ? 'Edit' : '';
                $(`#logradouroEnd${prefix}Cliente`).val(data.logradouro);
                $(`#bairroEnd${prefix}Cliente`).val(data.bairro);
                $(`#cidadeEnd${prefix}Cliente`).val(data.localidade);
                $(`#estadoEnd${prefix}Cliente`).val(data.uf);
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }

    // Salvar novo endereço
    $('#salvarEndereco').on('click', async function() {
        const dadosEndereco = {
            pessoa_id: pessoaId,
            nome: $('#nomeEndereco').val(),
            cep: $('#cepCliente').val(),
            rua: $('#logradouroEndCliente').val(),
            numero: $('#numeroEndCliente').val(),
            complemento: $('#complementoEndCliente').val(),
            bairro: $('#bairroEndCliente').val(),
            cidade: $('#cidadeEndCliente').val(),
            estado: $('#estadoEndCliente').val(),
            principal: $('#defaultAddress').prop('checked')
        };

        // Validação básica
        if (!dadosEndereco.nome || !dadosEndereco.cep || !dadosEndereco.rua || !dadosEndereco.numero) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        try {
            const response = await makeApiRequest('EnderecoRest', 'SalvarEndereco', dadosEndereco);
            
            if (response.status === 'success') {
                $('#newAddressModal').addClass('hidden');
                carregarEnderecos();
                limparFormularioEndereco();
                alert('Endereço salvo com sucesso!');
            } else {
                alert('Erro ao salvar endereço: ' + response.message);
            }
        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            alert('Erro ao salvar endereço');
        }
    });

    // Editar endereço
    window.editarEndereco = function(enderecoId) {
        const endereco = enderecosDisponiveis.find(e => e.id == enderecoId);
        
        if (endereco) {
            $('#idEnderecoEdit').val(endereco.id);
            $('#nomeEnderecoEdit').val(endereco.nome_endereco);
            $('#cepEdit').val(endereco.cep);
            $('#logradouroEndEdit').val(endereco.rua);
            $('#numeroEndEdit').val(endereco.numero);
            $('#complementoEndEdit').val(endereco.complemento || '');
            $('#bairroEndEdit').val(endereco.bairro);
            $('#cidadeEndEdit').val(endereco.cidade);
            $('#estadoEndEdit').val(endereco.estado.sigla);
            $('#defaultAddressEdit').prop('checked', endereco.principal === 'S');
            
            $('#addressModal').addClass('hidden');
            $('#editAddressModal').removeClass('hidden');
        }
    };

    // Salvar endereço editado
    $('#salvarEnderecoEdit').on('click', async function() {
        const dadosEndereco = {
            id: $('#idEnderecoEdit').val(),
            pessoa_id: pessoaId,
            nome: $('#nomeEnderecoEdit').val(),
            cep: $('#cepEdit').val(),
            rua: $('#logradouroEndEdit').val(),
            numero: $('#numeroEndEdit').val(),
            complemento: $('#complementoEndEdit').val(),
            bairro: $('#bairroEndEdit').val(),
            cidade: $('#cidadeEndEdit').val(),
            estado: $('#estadoEndEdit').val(),
            principal: $('#defaultAddressEdit').prop('checked')
        };

        try {
            const response = await makeApiRequest('EnderecoRest', 'AtualizarEndereco', dadosEndereco);
            
            if (response.status === 'success') {
                $('#editAddressModal').addClass('hidden');
                carregarEnderecos();
                alert('Endereço atualizado com sucesso!');
            } else {
                alert('Erro ao atualizar endereço: ' + response.message);
            }
        } catch (error) {
            console.error('Erro ao atualizar endereço:', error);
            alert('Erro ao atualizar endereço');
        }
    });

    // Excluir endereço
    window.excluirEndereco = async function(enderecoId) {
        if (!confirm('Deseja excluir este endereço?')) return;

        try {
            const response = await makeApiRequest('EnderecoRest', 'ExcluirEndereco', {
                id: enderecoId
            });
            
            if (response.status === 'success') {
                carregarEnderecos();
                alert('Endereço excluído com sucesso!');
            } else {
                alert('Erro ao excluir endereço: ' + response.message);
            }
        } catch (error) {
            console.error('Erro ao excluir endereço:', error);
            alert('Erro ao excluir endereço');
        }
    };

    // Limpar formulário de endereço
    function limparFormularioEndereco() {
        $('#nomeEndereco, #cepCliente, #logradouroEndCliente, #numeroEndCliente, #complementoEndCliente, #bairroEndCliente, #cidadeEndCliente, #estadoEndCliente').val('');
        $('#defaultAddress').prop('checked', false);
    }

    // ==================== FUNÇÕES DE PAGAMENTO ====================

    // Finalizar compra (sincronizar antes de processar)
    $('#finalizarCompra').on('click', async function() {
        if (!enderecoSelecionado) {
            alert('Por favor, selecione um endereço de entrega');
            return;
        }

        // Desabilitar botão durante o processamento
        const $botao = $(this);
        $botao.prop('disabled', true).text('Processando...');

        try {
            // Sincronizar carrinho antes de finalizar (se necessário)
            if (timeoutSincronizacao) {
                await sincronizarCarrinho();
            }

            if (metodoPagamentoSelecionado === '1') {
                $('#cartaoModal').removeClass('hidden');
            } else {
                await processarPagamento();
            }
        } catch (error) {
            console.error('Erro ao processar:', error);
            alert('Erro ao processar pedido. Tente novamente.');
            // Fechar qualquer preloader em caso de erro
            if (typeof app !== 'undefined' && app.dialog) {
                app.dialog.close();
            }
        } finally {
            // Reabilitar botão
            $botao.prop('disabled', false).text('Finalizar Compra');
        }
    });

    // Finalizar compra com cartão
    $('#finalizarCompraCartao').on('click', function() {
        // Validar dados do cartão
        const nomeTitular = $('#nomeTitular').val().trim();
        const numeroCartao = $('#numeroCartao').val().replace(/\s/g, '');
        const dataExpiracao = $('#dataExpiracao').val().trim();
        const cvc = $('#cvc').val().trim();

        if (!nomeTitular || !numeroCartao || !dataExpiracao || !cvc) {
            alert('Por favor, preencha todos os dados do cartão');
            return;
        }

        // Validações adicionais
        if (numeroCartao.length < 13 || numeroCartao.length > 19) {
            alert('Número do cartão inválido');
            return;
        }

        if (dataExpiracao.length !== 5) {
            alert('Data de expiração inválida (MM/AA)');
            return;
        }

        if (cvc.length < 3 || cvc.length > 4) {
            alert('CVV inválido');
            return;
        }

        // Desabilitar botão para evitar cliques duplos
        const $botao = $(this);
        $botao.prop('disabled', true).text('Processando...');

        processarPagamento().finally(() => {
            // Reabilitar botão
            $botao.prop('disabled', false).text('Finalizar Compra');
        });
    });

    // Processar pagamento
    async function processarPagamento() {
        // Mostrar preloader
        if (typeof app !== 'undefined' && app.dialog) {
            app.dialog.preloader("Processando pagamento...");
        }

        const dadosPagamento = {
            destinatario: {
                pessoa_id: pessoaId,
                endereco_id: enderecoSelecionado.id
            },
            pagamento: {
                forma_pagamento: metodoPagamentoSelecionado
            }
        };

        // Se for cartão, adicionar dados do cartão
        if (metodoPagamentoSelecionado === '1') {
            dadosPagamento.pagamento.numero_cartao = $('#numeroCartao').val().replace(/\s/g, '');
            dadosPagamento.pagamento.data_expiracao = $('#dataExpiracao').val();
            dadosPagamento.pagamento.cvc = $('#cvc').val();
            dadosPagamento.pagamento.titular = $('#nomeTitular').val();
        }

        try {
            const response = await makeApiRequest('PagamentoSafe2payRest', 'IncluirVenda', dadosPagamento);
            
            if (response.status === 'success' && response.data.status === 'success') {
                const dadosRetorno = response.data.data;
                
                // Preparar dados para localStorage seguindo a estrutura solicitada
                const data = {
                    formaSelecionada: metodoPagamentoSelecionado,
                    linhaDigitavel: dadosRetorno.boleto_linhadigitavel || '',
                    pixKey: dadosRetorno.pix_key || '',
                    qrCodePix: dadosRetorno.pix_qrcode || '',
                    linkBoleto: dadosRetorno.boleto_impressao || '',
                    dataVencimento: dadosRetorno.data_vencimento || '',
                    valorTotal: dadosRetorno.valor_total || carrinhoData.total,
                    pedidoId: dadosRetorno.pedido_id,
                    status_compra: dadosRetorno.status_compra || '',
                    status_mensagem: dadosRetorno.status_mensagem || '',
                    bandeira: dadosRetorno.bandeira || '',
                    cartao_numero: dadosRetorno.cartao_numero || '',
                    nome_cartao: dadosRetorno.nome_cartao || $('#nomeTitular').val() || '',
                    // Dados adicionais que podem ser úteis
                    tid: dadosRetorno.tid || '',
                    transacao_id: dadosRetorno.transacao_id || '',
                    codigo_autorizacao: dadosRetorno.codigo_autorizacao || '',
                    timestamp: new Date().toISOString()
                };

                // Armazenar no localStorage
                localStorage.setItem("pagamentoData", JSON.stringify(data));
                localStorage.setItem("pedidoIdPagamento", data.pedidoId);
                
                console.log('Dados de pagamento armazenados:', data);
                
                // Limpar carrinho local após pagamento bem-sucedido
                limparCarrinhoLocal();
                
                // Fechar modal de cartão se estiver aberto
                $('#cartaoModal').addClass('hidden');
                
                // Fechar preloader
                if (typeof app !== 'undefined' && app.dialog) {
                    app.dialog.close();
                }
                
                // Redirecionar sempre para a mesma página de pagamento
                if (typeof app !== 'undefined' && app.views && app.views.main) {
                    app.views.main.router.navigate("/pagamento/");
                } else {
                    window.location.href = '/pagamento/';
                }
                
            } else {
                // Fechar preloader em caso de erro
                if (typeof app !== 'undefined' && app.dialog) {
                    app.dialog.close();
                }
                alert('Erro ao processar pagamento: ' + (response.data?.message || response.message));
                console.error('Erro no processamento:', response);
            }
        } catch (error) {
            // Fechar preloader em caso de erro
            if (typeof app !== 'undefined' && app.dialog) {
                app.dialog.close();
            }
            console.error('Erro ao processar pagamento:', error);
            alert('Erro ao processar pagamento. Tente novamente.');
        }
    }

    // ==================== FUNÇÕES UTILITÁRIAS ====================

    // Função para recuperar dados de pagamento do localStorage
    window.getPagamentoData = function() {
        try {
            const data = localStorage.getItem("pagamentoData");
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao recuperar dados de pagamento:', error);
            return null;
        }
    };

    // Função para recuperar pedido ID do localStorage
    window.getPedidoIdPagamento = function() {
        return localStorage.getItem("pedidoIdPagamento");
    };

    // Função para limpar dados de pagamento (usar após conclusão)
    window.limparDadosPagamento = function() {
        localStorage.removeItem("pagamentoData");
        localStorage.removeItem("pedidoIdPagamento");
        console.log('Dados de pagamento limpos do localStorage');
    };

    // Função para verificar status do pagamento (se necessário)
    window.verificarStatusPagamento = async function(pedidoId) {
        try {
            const response = await makeApiRequest('PagamentoSafe2payRest', 'VerificaPix', {
                pedido_id: pedidoId
            });
            
            if (response.status === 'success') {
                // Atualizar dados no localStorage se o status mudou
                const dadosAtuais = getPagamentoData();
                if (dadosAtuais) {
                    dadosAtuais.status_compra = response.data.status_compra;
                    dadosAtuais.status_mensagem = response.data.status_mensagem;
                    dadosAtuais.timestamp_verificacao = new Date().toISOString();
                    localStorage.setItem("pagamentoData", JSON.stringify(dadosAtuais));
                }
                
                return response.data;
            }
        } catch (error) {
            console.error('Erro ao verificar status do pagamento:', error);
        }
        return null;
    };

    // Modais de endereço
    $('#openAddressModal').on('click', function() {
        $('#addressModal').removeClass('hidden');
    });

    $('#closeAddressModal').on('click', function() {
        $('#addressModal').addClass('hidden');
    });

    $('#showNewAddressForm').on('click', function() {
        $('#addressModal').addClass('hidden');
        $('#newAddressModal').removeClass('hidden');
    });

    $('.closeNewAddressModal').on('click', function() {
        $('#newAddressModal').addClass('hidden');
        limparFormularioEndereco();
    });

    $('.closeEditAddressModal').on('click', function() {
        $('#editAddressModal').addClass('hidden');
    });

    // Modal de cartão
    $('#closeCartaoModal').on('click', function() {
        $('#cartaoModal').addClass('hidden');
    });

    // Seleção de método de pagamento
    $('input[name="payment"]').on('change', function() {
        metodoPagamentoSelecionado = $(this).val();
    });

    // ==================== FORMATAÇÃO DE CAMPOS ====================

    // Formatação do número do cartão
    $('#numeroCartao').on('input', function() {
        let value = $(this).val().replace(/\s/g, '').replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        $(this).val(value);
    });

    // Formatação da data de expiração
    $('#dataExpiracao').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        $(this).val(value);
    });

    // Formatação do CEP
    $('#cepCliente, #cepEdit').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        $(this).val(value);
    });

    // Buscar CEP quando sair do campo
    $('#cepCliente').on('blur', function() {
        buscarCEP($(this).val(), false);
    });

    $('#cepEdit').on('blur', function() {
        buscarCEP($(this).val(), true);
    });

    // ==================== INICIALIZAÇÃO ====================

    // Inicializar aplicação
    async function inicializar() {
        try {
            await carregarCarrinho();
            await carregarEnderecos();
        } catch (error) {
            console.error('Erro na inicialização:', error);
        }
    }

    // Executar inicialização
    inicializar();

    // Fechar modais ao clicar fora
    $(document).on('click', function(e) {
        if ($(e.target).hasClass('fixed') && $(e.target).hasClass('inset-0')) {
            $('.fixed.inset-0').addClass('hidden');
        }
    });
});