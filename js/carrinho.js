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
        const body = JSON.stringify({
            class: className,
            method: methodName,
            dados: dados
        });

        const options = {
            method: "POST",
            headers: headers,
            body: body,
        };

        try {
            console.log('Enviando requisição:', { className, methodName, dados });
            
            const response = await fetch(apiServerUrl, options);
            const responseText = await response.text();
            
            console.log('Resposta bruta:', responseText);
            
            // Verificar se a resposta é JSON válido
            if (!responseText.trim().startsWith('{') && !responseText.trim().startsWith('[')) {
                console.error('Resposta não é JSON válido:', responseText);
                throw new Error('Resposta da API não é JSON válido: ' + responseText.substring(0, 200));
            }
            
            const data = JSON.parse(responseText);
            console.log('Resposta parseada:', data);
            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // ==================== FUNÇÕES DE CARRINHO ====================

    // Carregar carrinho
    async function carregarCarrinho() {
        try {
            console.log('Carregando carrinho para pessoa ID:', pessoaId);
            
            const response = await makeApiRequest('PagamentoSafe2payRest', 'ListarCarrinho', {
                pessoa_id: pessoaId
            });

            console.log('Resposta completa carrinho:', response);

            // A resposta vem aninhada: response.data.data contém os dados do carrinho
            if (response.status === 'success' && response.data.status === 'sucess') {
                carrinhoData = response.data.data;
                console.log('Dados do carrinho:', carrinhoData);
                renderizarCarrinho();
                atualizarResumo();
            } else {
                console.error('Erro ao carregar carrinho:', response.data?.message || response.message);
                // Inicializar carrinho vazio em caso de erro
                carrinhoData = { itens: [], total: 0, total_sem_desconto: 0, valor_frete: 0 };
                renderizarCarrinho();
                atualizarResumo();
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            carrinhoData = { itens: [], total: 0, total_sem_desconto: 0, valor_frete: 0 };
            renderizarCarrinho();
            atualizarResumo();
        }
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
                <div class="item-carrinho" data-produto-id="${item.produto_id}">
                    <div class="area-img">
                        <img src="${item.foto || 'img/placeholder.jpg'}" alt="${item.nome}">
                    </div>
                    <div class="area-details">
                        <div class="sup">
                            <div class="name-prod">${item.nome}</div>
                            <div class="delete-item" onclick="removerItem(${item.produto_id})">
                                <i class="mdi mdi-delete"></i>
                            </div>
                        </div>
                        <div class="middle">
                            <span>Produto disponível</span>
                        </div>
                        <div class="preco-quantidade">
                            <span>${formatPrice(parseFloat(item.preco_total))}</span>
                            <div class="count">
                                <div class="minus" onclick="alterarQuantidade(${item.produto_id}, ${parseInt(item.quantidade) - 1})">-</div>
                                <input type="number" class="qtd-item" value="${item.quantidade}" readonly>
                                <div class="plus" onclick="alterarQuantidade(${item.produto_id}, ${parseInt(item.quantidade) + 1})">+</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listaCarrinho.append(itemHtml);
        });
    }

    // Alterar quantidade de item
    window.alterarQuantidade = async function(produtoId, novaQuantidade) {
        if (novaQuantidade <= 0) {
            removerItem(produtoId);
            return;
        }

        try {
            const response = await makeApiRequest('PagamentoSafe2payRest', 'AlterarCarrinho', {
                pessoa_id: pessoaId,
                produto_id: produtoId,
                quantidade: novaQuantidade
            });

            if (response.status === 'success' && response.data.status === 'sucess') {
                carregarCarrinho();
            } else {
                alert('Erro ao alterar quantidade: ' + (response.data?.message || response.message));
            }
        } catch (error) {
            console.error('Erro ao alterar quantidade:', error);
            alert('Erro ao alterar quantidade');
        }
    };

    // Remover item do carrinho
    window.removerItem = async function(produtoId) {
        if (!confirm('Deseja remover este item do carrinho?')) return;

        try {
            const response = await makeApiRequest('PagamentoSafe2payRest', 'ExcluirCarrinho', {
                pessoa_id: pessoaId,
                produto_id: produtoId
            });

            if (response.status === 'success' && response.data.status === 'sucess') {
                carregarCarrinho();
            } else {
                alert('Erro ao remover item: ' + (response.data?.message || response.message));
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
            alert('Erro ao remover item');
        }
    };

    // Limpar carrinho
    $('#esvaziar').on('click', async function(e) {
        e.preventDefault();
        
        if (!confirm('Deseja esvaziar todo o carrinho?')) return;

        try {
            const response = await makeApiRequest('PagamentoSafe2payRest', 'LimparCarrinho', {
                pessoa_id: pessoaId
            });

            if (response.status === 'success' && response.data.status === 'sucess') {
                carregarCarrinho();
                $('.popover-menu').removeClass('modal-in').addClass('modal-out');
            } else {
                alert('Erro ao limpar carrinho: ' + (response.data?.message || response.message));
            }
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            alert('Erro ao limpar carrinho');
        }
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

    // Finalizar compra
    $('#finalizarCompra').on('click', function() {
        if (!enderecoSelecionado) {
            alert('Por favor, selecione um endereço de entrega');
            return;
        }

        if (metodoPagamentoSelecionado === '1') {
            $('#cartaoModal').removeClass('hidden');
        } else {
            processarPagamento();
        }
    });

    // Finalizar compra com cartão
    $('#finalizarCompraCartao').on('click', function() {
        // Validar dados do cartão
        const nomeTitular = $('#nomeTitular').val();
        const numeroCartao = $('#numeroCartao').val();
        const dataExpiracao = $('#dataExpiracao').val();
        const cvc = $('#cvc').val();

        if (!nomeTitular || !numeroCartao || !dataExpiracao || !cvc) {
            alert('Por favor, preencha todos os dados do cartão');
            return;
        }

        processarPagamento();
    });

    // Processar pagamento
    async function processarPagamento() {
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
                // Redirecionar para página de confirmação com dados do pagamento
                const dadosRetorno = response.data.data;
                
                // Salvar dados no sessionStorage para usar na próxima página
                sessionStorage.setItem('dadosPagamento', JSON.stringify(dadosRetorno));
                
                // Redirecionar baseado no tipo de pagamento
                switch(metodoPagamentoSelecionado) {
                    case '1': // Cartão
                        window.location.href = '/pagamento-cartao/';
                        break;
                    case '2': // Boleto
                        window.location.href = '/pagamento-boleto/';
                        break;
                    case '3': // PIX
                        window.location.href = '/pagamento-pix/';
                        break;
                }
            } else {
                alert('Erro ao processar pagamento: ' + (response.data?.message || response.message));
            }
        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            alert('Erro ao processar pagamento');
        }
    }

    // ==================== EVENTOS DE MODAL ====================

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