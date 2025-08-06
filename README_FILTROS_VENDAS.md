# Novo Sistema de Filtros de Vendas - VitaTop

## Visão Geral

O sistema de filtros de vendas foi completamente refatorado para oferecer uma experiência mais moderna e funcional. O novo sistema inclui:

- **Busca avançada** com debounce e busca instantânea
- **Filtros de status** com contadores visuais
- **Filtros adicionais** por período e valor
- **Interface responsiva** e moderna
- **Estados de loading** e tratamento de erros

## Estrutura dos Arquivos

### 1. vendas.html
- **Campo de busca**: `#buscaVendas` com ícone e botão limpar
- **Filtros de status**: Botões com ícones e contadores
- **Filtros adicionais**: Dropdowns para período e valor
- **Botão limpar filtros**: Reset completo dos filtros

### 2. funcoes.js
- **Variáveis globais**: `filtrosVendas` para controle de estado
- **Função principal**: `listarVendas()` com filtros integrados
- **Funções auxiliares**: Criação de cards, tratamento de estados
- **Configuração de filtros**: Event listeners e validações

### 3. index.css
- **Estilos modernos**: Design iOS-like com animações
- **Responsividade**: Adaptação para diferentes telas
- **Estados visuais**: Loading, hover, active states
- **Cores por status**: Diferentes cores para cada status

## Funcionalidades

### Busca Avançada
```javascript
// Campo de busca com debounce
$("#buscaVendas").on("input", function() {
  const busca = $(this).val().trim();
  filtrosVendas.busca = busca;
  listarVendas();
});
```

### Filtros de Status
- **Todos**: Mostra todas as vendas
- **Pendente**: Vendas aguardando aprovação
- **Autorizado**: Vendas aprovadas
- **Cancelado**: Vendas canceladas
- **Bloqueado**: Vendas bloqueadas

### Filtros Adicionais
- **Período**: Hoje, semana, mês, trimestre
- **Valor**: Faixas de valores (até R$ 50, R$ 50-200, acima de R$ 200)

### Contadores Visuais
Cada botão de status mostra a quantidade de vendas naquele status:
```html
<span class="contador" id="contadorPendente">0</span>
```

## Estados e Tratamento de Erros

### Estados Vazios
- Mensagem personalizada baseada nos filtros ativos
- Botão para limpar filtros
- Ícone ilustrativo

### Estados de Erro
- **Erro de carregamento**: Problema na API
- **Erro de conexão**: Problema de rede
- Botões para tentar novamente

### Loading States
- **Filtros**: Indicador de loading nos filtros
- **Carregar mais**: Loading no botão de paginação
- **Busca**: Debounce para evitar muitas requisições

## API Integration

### Parâmetros Enviados
```javascript
const dados = {
  vendedor: pessoaId,
  limit: 15,
  offset: filtrosVendas.offset,
  searchQuery: filtrosVendas.busca,
  statusFilter: filtrosVendas.status,
  periodoFilter: filtrosVendas.periodo,
  valorFilter: filtrosVendas.valor
};
```

### Resposta Esperada
```javascript
{
  status: "success",
  data: {
    status: "success",
    data: {
      status: "success",
      data: [...vendas],
      pagination: {...},
      contadores: {
        todos: 0,
        pendente: 0,
        autorizado: 0,
        cancelado: 0,
        bloqueado: 0
      }
    }
  }
}
```

## Responsividade

### Breakpoints
- **Mobile (≤360px)**: 2 colunas nos filtros
- **Tablet (≤480px)**: Ajustes de padding e fontes
- **Desktop (>480px)**: Layout completo

### Adaptações
- **Filtros**: Grid responsivo
- **Busca**: Padding adaptativo
- **Contadores**: Tamanho proporcional

## Animações

### Transições
- **Hover**: Elevação suave dos botões
- **Active**: Transformação com sombra
- **Loading**: Spinner animado
- **Fade In**: Entrada suave dos elementos

### Performance
- **Debounce**: 500ms na busca
- **Lazy Loading**: Carregamento sob demanda
- **Event Delegation**: Otimização de eventos

## Manutenção

### Adicionar Novo Status
1. Adicionar botão no HTML
2. Adicionar estilo CSS
3. Atualizar função `getStatusClass()`
4. Atualizar função `getStatusIcon()`

### Adicionar Novo Filtro
1. Adicionar campo no HTML
2. Adicionar variável em `filtrosVendas`
3. Configurar event listener
4. Atualizar função `limparFiltros()`

## Compatibilidade

### Navegadores
- Chrome 80+
- Safari 13+
- Firefox 75+
- Edge 80+

### Dispositivos
- iOS 12+
- Android 8+
- PWA Support

## Debugging

### Console Logs
```javascript
console.log('Filtros ativos:', filtrosVendas);
console.log('Resposta API:', responseJson);
```

### Estados Visuais
- **Loading**: Container com classe `.loading`
- **Erro**: Mensagens específicas
- **Vazio**: Estado personalizado

## Próximas Melhorias

1. **Filtros salvos**: Persistir filtros no localStorage
2. **Exportação**: Exportar vendas filtradas
3. **Gráficos**: Visualização estatística
4. **Notificações**: Alertas de novas vendas
5. **Offline**: Cache de vendas para uso offline 