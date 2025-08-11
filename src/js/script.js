document.addEventListener('DOMContentLoaded', async () => {

  const searchInput = document.getElementById('search-input');
  const itemsGrid = document.getElementById('items-grid');
  const emptyState = document.getElementById('empty-state');
  const emptyStateTitle = document.getElementById('empty-state-title');
  const emptyStateMessage = document.getElementById('empty-state-message');

  // Elementos para o sistema de tags
  const tagsFilterContainer = document.getElementById('tags-filter-container');
  const activeTagFiltersContainer = document.getElementById('active-tag-filters');
  const clearFiltersBtn = document.getElementById('clear-filters');

  const addItemBtn = document.getElementById('add-item-btn');
  const emptyStateAddBtn = document.getElementById('empty-state-add-btn');

  const addEditDialog = document.getElementById('add-edit-dialog');
  const dialogTitle = document.getElementById('dialog-title');
  const closeDialogBtn = document.getElementById('close-dialog-btn');
  const cancelDialogBtn = document.getElementById('cancel-dialog-btn');
  const addEditForm = document.getElementById('add-edit-form');
  const itemIdInput = document.getElementById('item-id');
  const itemTitleInput = document.getElementById('item-title');
  const itemContentInput = document.getElementById('item-content');
  const isCodeSwitch = document.getElementById('is-code-switch');
  const languageInputContainer = document.getElementById('language-input-container');
  const codeLanguageInput = document.getElementById('code-language');
  const itemTagsContainer = document.getElementById('item-tags-container');

  const markdownHelpBtn = document.getElementById('markdown-help-btn');
  const markdownHelpDialog = document.getElementById('markdown-help-dialog');
  const closeMarkdownHelpBtn = document.getElementById('close-markdown-help-btn');

  const menuBtn = document.getElementById('menu-btn');
  const menuDropdown = document.getElementById('menu-dropdown');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-input');
  const exportBtn = document.getElementById('export-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');
  const toggleArchivedBtn = document.getElementById('toggle-archived-btn');
  const toggleDarkModeBtn = document.getElementById('toggle-dark-mode-btn');
  const manageTagsBtn = document.getElementById('manage-tags-btn');

  // Elementos do diálogo de gerenciamento de tags
  const manageTagsDialog = document.getElementById('manage-tags-dialog');
  const closeManageTagsDialogBtn = document.getElementById('close-manage-tags-dialog-btn');
  const addTagForm = document.getElementById('add-tag-form');
  const tagNameInput = document.getElementById('tag-name-input');
  const tagIdInput = document.getElementById('tag-id-input');
  const tagColorContainer = document.getElementById('tag-color-container');
  const tagsList = document.getElementById('tags-list');
  const cancelEditTagBtn = document.getElementById('cancel-edit-tag-btn');


  const confirmPopup = document.getElementById('confirmPopup');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');

  const notificationContainer = document.getElementById('notification-container');
  let itemToDeleteId = null;

  // --- PWA Install ---
  const installPwaBtn = document.getElementById('install-pwa-btn');
  let deferredPrompt;

  // Verifica se o app já está instalado
  function isAppInstalled() {
    // Verifica se está em modo standalone (PWA instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Verifica se está em modo standalone no iOS
    const isIOSStandalone = navigator.standalone === true;

    // Verifica se foi marcado como instalado no localStorage
    const wasInstalled = localStorage.getItem('appInstalled') === 'true';

    // Verifica se está sendo executado como um app Android (tela cheia)
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;

    // Verifica se está sendo executado como um app em janela (Windows/macOS)
    const isMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;

    return isStandalone || isIOSStandalone || wasInstalled || isFullscreen || isMinimalUi;
  }

  // Verifica se é um dispositivo iOS
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  // Verifica se é um dispositivo Android
  function isAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  // Função para atualizar o estado do botão de instalação
  function updateInstallButtonState() {
    // Se o app já estiver instalado, desabilita o botão
    if (isAppInstalled()) {
      installPwaBtn.disabled = true;
      installPwaBtn.querySelector('span').textContent = "App Instalado";
      return;
    }

    // Para dispositivos iOS
    if (isIOS()) {
      installPwaBtn.disabled = false;
      installPwaBtn.querySelector('span').textContent = "Adicionar à Tela Inicial";
      return;
    }

    // Para Android e desktop
    if (deferredPrompt) {
      installPwaBtn.disabled = false;
      installPwaBtn.querySelector('span').textContent = "Instalar App";
    } else {
      // Mesmo sem o prompt, permitimos a instalação manual no Android
      if (isAndroid()) {
        installPwaBtn.disabled = false;
        installPwaBtn.querySelector('span').textContent = "Instalar Manualmente";
      } else {
        // Para desktop sem prompt disponível
        installPwaBtn.disabled = true;
        installPwaBtn.querySelector('span').textContent = "Instalação Indisponível";
      }
    }
  }

  // Função para verificar se o PWA é instalável
  async function checkInstallability() {
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await navigator.getInstalledRelatedApps();
        const isInstalled = relatedApps.some(app =>
          app.id === 'clipboard-zen' ||
          app.url === window.location.origin
        );

        if (isInstalled) {
          localStorage.setItem('appInstalled', 'true');
        }

        console.log('App instalado?', isInstalled);
        return !isInstalled; // Retorna true se o app NÃO estiver instalado
      } catch (error) {
        console.error('Erro ao verificar apps instalados:', error);
      }
    }

    // Se não conseguir verificar, assume que é instalável
    return true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Evento beforeinstallprompt disparado');
    updateInstallButtonState();
  });

  // Verificar instalabilidade quando a página carregar
  window.addEventListener('load', async () => {
    const isInstallable = await checkInstallability();
    console.log('PWA é instalável:', isInstallable);

    if (isInstallable && isAndroid()) {
      // Força a atualização do estado do botão
      updateInstallButtonState();
    }
  });

  installPwaBtn.addEventListener('click', async () => {
    // Para dispositivos iOS, mostramos instruções de como instalar
    if (isIOS()) {
      alert('Para instalar este app na sua tela inicial: toque no ícone de compartilhamento e depois em "Adicionar à Tela de Início".');
      return;
    }

    // Para Android sem prompt disponível, mostramos instruções manuais
    if (isAndroid() && !deferredPrompt) {
      alert('Para instalar o aplicativo completo no Android:\n\n1. Toque no menu (três pontos) no canto superior direito do Chrome\n2. Selecione "Instalar aplicativo" (NÃO "Adicionar à tela inicial")\n\nSe a opção "Instalar aplicativo" não aparecer:\n- Verifique se você está usando o Chrome\n- Tente atualizar a página\n- Limpe o cache do navegador\n- Verifique se o Chrome está atualizado');

      // Forçar uma atualização da página para tentar disparar o evento beforeinstallprompt
      setTimeout(() => {
        if (confirm('Deseja atualizar a página para tentar novamente a instalação?')) {
          window.location.reload();
        }
      }, 5000);

      return;
    }

    // Para Android e desktop com prompt disponível
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Resultado do prompt de instalação:', outcome);
      if (outcome === 'accepted') {
        // O usuário instalou o app
        localStorage.setItem('appInstalled', 'true');
        deferredPrompt = null;
        updateInstallButtonState(); // Atualiza o estado do botão imediatamente
      }
    }
  });

  // Atualiza o estado do botão se o modo de exibição mudar para standalone
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    if (e.matches) {
      updateInstallButtonState();
    }
  });
  // Verificação inicial
  updateInstallButtonState();

  // Verificação periódica para o evento beforeinstallprompt
  // Às vezes o Chrome para Android dispara este evento com atraso
  let installCheckInterval = setInterval(() => {
    if (deferredPrompt) {
      // Se já temos o prompt, não precisamos mais verificar
      clearInterval(installCheckInterval);
    } else if (isAndroid() && !isAppInstalled()) {
      // Forçar uma nova verificação de instalabilidade
      console.log('Verificando disponibilidade de instalação...');
      updateInstallButtonState();
    }
  }, 3000); // Verifica a cada 3 segundos



  // --- Service Worker Registration ---
  if (window.APP_CONFIG && window.APP_CONFIG.MODE === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Usando caminho relativo para o Service Worker
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(error => {
          console.log('Falha ao registrar o Service Worker:', error);
        });
    });
  }


  const STORAGE_KEY = 'clipboard_zen_items';
  const TAGS_STORAGE_KEY = 'clipboard_zen_tags';


  // --- Gerenciamento de Tags ---

  // Cores predefinidas para as tags
  const PREDEFINED_TAG_COLORS = [
    '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6',
    '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775',
    '#fff176', '#ffd54f', '#ffb74d', '#ff8a65'
  ];

  // Função para obter todas as tags salvas
  function getTags() {
    return JSON.parse(localStorage.getItem(TAGS_STORAGE_KEY) || '[]');
  }

  // Função para salvar as tags
  function saveTags(tags) {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }

  // Função para adicionar uma nova tag
  function addTag(tag) {
    const tags = getTags();
    tags.push(tag);
    saveTags(tags);
  }

  // Função para atualizar uma tag existente
  function updateTag(updatedTag) {
    const tags = getTags();
    const index = tags.findIndex(t => t.id === updatedTag.id);
    if (index > -1) {
      tags[index] = updatedTag;
      saveTags(tags);
    }
  }

  // Função para excluir uma tag
  function deleteTag(tagId) {
    const tags = getTags();
    const updatedTags = tags.filter(t => t.id !== tagId);
    saveTags(updatedTags);

    // Opcional: remover a tag de todos os itens que a utilizam
    const items = getItems();
    items.forEach(item => {
      if (item.tags && item.tags.includes(tagId)) {
        item.tags = item.tags.filter(t => t !== tagId);
        updateItem(item);
      }
    });
  }


  // Variáveis para controle de filtros
  let activeTagFilters = [];
  let showArchivedItems = false;

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }


  // --- Funções do Diálogo de Gerenciamento de Tags ---

  function openManageTagsDialog() {
    renderTagsList();
    renderTagColorOptions();
    manageTagsDialog.classList.remove('hidden');
  }

  function closeManageTagsDialog() {
    manageTagsDialog.classList.add('hidden');
  }

  function renderTagColorOptions() {
    tagColorContainer.innerHTML = '';
    PREDEFINED_TAG_COLORS.forEach(color => {
      const colorOption = document.createElement('input');
      colorOption.type = 'radio';
      colorOption.name = 'tag-color';
      colorOption.value = color;
      colorOption.style.backgroundColor = color;
      colorOption.classList.add('tag-color-option');
      tagColorContainer.appendChild(colorOption);
    });
    // Seleciona a primeira cor por padrão
    if (tagColorContainer.firstChild) {
      tagColorContainer.firstChild.checked = true;
    }
  }

  function renderTagsList() {
    tagsList.innerHTML = '';
    const tags = getTags();
    if (tags.length === 0) {
      tagsList.innerHTML = '<p>Nenhuma tag criada ainda.</p>';
      return;
    }

    tags.forEach(tag => {
      const tagEl = document.createElement('div');
      tagEl.className = 'tag-item';
      tagEl.innerHTML = `
        <div>
          <span class="tag" style="background-color: ${tag.color};">${tag.name}</span>
        </div>
        <div>
          <button class="button icon-button edit-tag-btn" data-id="${tag.id}" title="Editar Tag">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          </button>
          <button class="button icon-button danger delete-tag-btn" data-id="${tag.id}" title="Excluir Tag">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;
      tagsList.appendChild(tagEl);
    });
  }


  function getItems(query = '') {
    let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Filtrar por status de arquivamento
    if (!showArchivedItems) {
      items = items.filter(item => !item.archived);
    }

    // Filtrar por texto de busca
    if (query) {
      const searchQuery = query.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery) ||
        item.content.toLowerCase().includes(searchQuery) ||
        (item.tags && item.tags.some(tagId => {
          const tag = getTags().find(t => t.id === tagId);
          return tag && tag.name.toLowerCase().includes(searchQuery);
        }))
      );
    }

    // Filtrar por tags ativas
    if (activeTagFilters.length > 0) {
      items = items.filter(item =>
        item.tags && activeTagFilters.every(tagId => item.tags.includes(tagId))
      );
    }

    // Ordenar por fixados primeiro, depois por data de criação
    return items.sort((a, b) => {
      // Se ambos são fixados ou ambos não são fixados, ordena por data
      if ((a.pinned && b.pinned) || (!a.pinned && !b.pinned)) {
        return b.createdAt - a.createdAt;
      }
      // Se apenas a é fixado, a vem primeiro
      if (a.pinned) return -1;
      // Se apenas b é fixado, b vem primeiro
      return 1;
    });
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addItem(item) {
    const items = getItems();
    items.push(item);
    saveItems(items);
    renderItems();
    showNotification('Item adicionado com sucesso!', 'success');
  }

  function updateItem(updatedItem) {
    let items = getItems();
    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index > -1) {
      items[index] = updatedItem;
    }
    saveItems(items);
    renderItems();
  }

  function deleteItem(id) {
    let items = getItems();
    items = items.filter(item => item.id !== id);
    saveItems(items);
    renderItems();
    showNotification('Item excluído com sucesso!', 'danger');
  }

  function clearAllItems() {
    localStorage.removeItem(STORAGE_KEY);
    renderItems();
  }

  function importItems(newItems) {
    saveItems(newItems);
    renderItems();
  }

  async function renderItems() {
    const query = searchInput.value;
    const items = await getItems(query);
    itemsGrid.innerHTML = '';

    if (items.length === 0) {
      emptyState.classList.remove('hidden');
      if (query) {
        emptyStateTitle.textContent = 'Nenhum Resultado Encontrado';
        emptyStateMessage.textContent = `Sua busca por "${query}" não retornou nenhum resultado.`;
        emptyStateAddBtn.classList.add('hidden');
      } else {
        emptyStateTitle.textContent = 'Sua Área de Transferência está Vazia';
        emptyStateMessage.textContent = 'Clique em "Adicionar Item" para salvar seu primeiro conteúdo.';
        emptyStateAddBtn.classList.remove('hidden');
      }
    } else {
      emptyState.classList.add('hidden');
      items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'clipboard-item';

        // Aplica a cor da primeira tag, se existir
        if (item.tags && item.tags.length > 0) {
          const firstTagId = item.tags[0];
          const tag = getTags().find(t => t.id === firstTagId);
          if (tag) {
            itemEl.classList.add('custom-color');
            itemEl.style.borderLeftColor = tag.color;
          }
        }

        // Adiciona classe para itens fixados
        if (item.pinned) {
          itemEl.classList.add('pinned');
        }

        // Adiciona classe para itens arquivados
        if (item.archived) {
          itemEl.classList.add('archived');
        }
        let contentHTML;
        if (item.isCode) {
          const language = item.language || 'plaintext';
          const highlightedCode = hljs.highlight(item.content, { language, ignoreIllegals: true }).value;
          contentHTML = `<pre><code class="hljs ${language}">${highlightedCode}</code></pre>`;
        } else {
          contentHTML = marked.parse(item.content, { breaks: true });
        }


        itemEl.innerHTML = `
                    <div class="item-header">${escapeHTML(item.title)}</div>
                    <div class="item-content-wrapper">
                        <div class="item-content">${contentHTML}</div>
                        <button class="expand-btn">Expandir</button>
                    </div>
                    ${item.tags && item.tags.length > 0 ? `
                    <div class="tags-container">
                        ${item.tags.map(tagId => {
          const tag = getTags().find(t => t.id === tagId);
          if (!tag) return '';
          return `<span class="tag" data-tag-id="${tag.id}" style="background-color: ${tag.color};">${tag.name}</span>`;
        }).join('')}
                    </div>
                    ` : ''}
                    <div class="item-footer">
                        <span>${new Date(item.createdAt).toLocaleString()}</span>
                        <div class="item-actions">
                            <button class="button icon-button copy-btn" data-id="${item.id}" title="Copiar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                            <button class="button icon-button pin-btn ${item.pinned ? 'active' : ''}" data-id="${item.id}" title="${item.pinned ? 'Desafixar' : 'Fixar'}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </button>
                            <button class="button icon-button archive-btn ${item.archived ? 'active' : ''}" data-id="${item.id}" title="${item.archived ? 'Desarquivar' : 'Arquivar'}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-archive"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                            </button>
                            <button class="button icon-button edit-btn" data-id="${item.id}" title="Editar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <button class="button icon-button danger delete-btn" data-id="${item.id}" title="Excluir">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                `;
        itemsGrid.appendChild(itemEl);

        const contentWrapper = itemEl.querySelector('.item-content-wrapper');
        const contentDiv = itemEl.querySelector('.item-content');
        const expandBtn = itemEl.querySelector('.expand-btn');

        // Adiciona um pequeno atraso para garantir que o DOM seja atualizado
        setTimeout(() => {
          const contentEl = item.isCode ? contentDiv.querySelector('pre') : contentDiv;
          if (contentEl && contentEl.scrollHeight > contentWrapper.clientHeight) {
            contentWrapper.classList.add('expandable');
          }
        }, 0);
      });
    }
    // Atualiza o estado do botão de exportar
    updateExportButtonState(items.length > 0);
  }

  async function updateExportButtonState(hasItems) {
    exportBtn.disabled = !hasItems;
    clearDataBtn.disabled = !hasItems;
    // O botão de instalação não depende da existência de itens
    updateInstallButtonState();
  }

  // Event Listeners
  searchInput.addEventListener('input', renderItems);
  addItemBtn.addEventListener('click', () => openDialog('add'));
  emptyStateAddBtn.addEventListener('click', () => openDialog('add'));
  closeDialogBtn.addEventListener('click', closeDialog);
  cancelDialogBtn.addEventListener('click', closeDialog);
  manageTagsBtn.addEventListener('click', openManageTagsDialog);
  closeManageTagsDialogBtn.addEventListener('click', closeManageTagsDialog);

  addTagForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = tagNameInput.value.trim();
    const colorInput = tagColorContainer.querySelector('input[name="tag-color"]:checked');
    const tagId = tagIdInput.value;

    if (name && colorInput) {
      if (tagId) {
        // Editando tag existente
        const updatedTag = { id: tagId, name, color: colorInput.value };
        updateTag(updatedTag);
        showNotification('Tag atualizada com sucesso!', 'success');
      } else {
        // Adicionando nova tag
        const newTag = {
          id: crypto.randomUUID(),
          name,
          color: colorInput.value
        };
        addTag(newTag);
        showNotification('Tag adicionada com sucesso!', 'success');
      }
      resetTagForm();
      renderTagsList();
      renderItems();
    } else {
      showNotification('Por favor, preencha o nome e selecione uma cor.', 'danger');
    }
  });

  function resetTagForm() {
    tagIdInput.value = '';
    tagNameInput.value = '';
    addTagForm.querySelector('button[type="submit"]').textContent = 'Adicionar Tag';
    cancelEditTagBtn.classList.add('hidden');
    // Seleciona a primeira cor por padrão
    if (tagColorContainer.firstChild) {
      tagColorContainer.firstChild.checked = true;
    }
  }

  cancelEditTagBtn.addEventListener('click', resetTagForm);

  tagsList.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-tag-btn');
    const editBtn = e.target.closest('.edit-tag-btn');

    if (deleteBtn) {
      const tagId = deleteBtn.dataset.id;
      if (confirm('Tem certeza que deseja excluir esta tag? Isso também a removerá de todos os itens.')) {
        deleteTag(tagId);
        renderTagsList();
        renderItems(); // Atualiza os itens para remover a tag excluída
        showNotification('Tag excluída com sucesso!', 'danger');
      }
    } else if (editBtn) {
      const tagId = editBtn.dataset.id;
      const tag = getTags().find(t => t.id === tagId);
      if (tag) {
        tagIdInput.value = tag.id;
        tagNameInput.value = tag.name;
        tagColorContainer.querySelector(`input[value="${tag.color}"]`).checked = true;
        addTagForm.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
        cancelEditTagBtn.classList.remove('hidden');
      }
    }
  });


  // Função para atualizar os filtros de tags
  function updateTagFilters() {
    const allTags = getTags();

    // Se não houver tags, esconde o container de filtros
    if (allTags.length === 0) {
      tagsFilterContainer.classList.add('hidden');
      return;
    }

    // Atualiza o container de filtros ativos
    activeTagFiltersContainer.innerHTML = '';

    // Se houver filtros ativos, mostra o container
    if (activeTagFilters.length > 0) {
      tagsFilterContainer.classList.remove('hidden');

      // Adiciona cada tag ativa como um filtro
      activeTagFilters.forEach(tagId => {
        const tagInfo = getTags().find(t => t.id === tagId);
        if (!tagInfo) return;

        const tagFilterEl = document.createElement('span');
        tagFilterEl.className = 'tag tag-filter active';
        tagFilterEl.textContent = tagInfo.name;
        tagFilterEl.dataset.tagId = tagInfo.id;
        tagFilterEl.style.backgroundColor = tagInfo.color;

        const closeBtn = document.createElement('span');
        closeBtn.className = 'tag-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // Remove a tag dos filtros ativos
          activeTagFilters = activeTagFilters.filter(t => t !== tagId);
          updateTagFilters();
          renderItems();
        });

        tagFilterEl.appendChild(closeBtn);
        activeTagFiltersContainer.appendChild(tagFilterEl);
      });
    } else {
      tagsFilterContainer.classList.add('hidden');
    }
  }

  // Event listener para limpar todos os filtros
  clearFiltersBtn.addEventListener('click', () => {
    activeTagFilters = [];
    updateTagFilters();
    renderItems();
  });

  addEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = itemIdInput.value;
    const title = itemTitleInput.value;
    const content = itemContentInput.value;
    const isCode = isCodeSwitch.checked;
    const language = codeLanguageInput.value;

    // Obter tags selecionadas
    const selectedTags = Array.from(itemTagsContainer.querySelectorAll('.tag.selected')).map(t => t.dataset.tagId);

    const itemData = {
      title,
      content,
      isCode,
      language: isCode ? language : null,
      tags: selectedTags,
      pinned: id ? (getItems().find(i => i.id === id)?.pinned || false) : false,
      archived: id ? (getItems().find(i => i.id === id)?.archived || false) : false
    };

    if (id) { // Editing
      const items = getItems();
      const existingItem = items.find(i => i.id === id);
      updateItem({ ...existingItem, ...itemData });
    } else { // Adding
      addItem({
        id: crypto.randomUUID(),
        ...itemData,
        createdAt: Date.now()
      });
    }
    closeDialog();

    // Atualiza os filtros de tags após adicionar/editar um item
    updateTagFilters();
  });

  // Função para alternar o estado de fixação de um item
  function togglePinItem(id) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = items.findIndex(item => item.id === id);

    if (index > -1) {
      items[index].pinned = !items[index].pinned;
      saveItems(items);
      renderItems();

      const action = items[index].pinned ? 'fixado' : 'desfixado';
      showNotification(`Item ${action} com sucesso!`, 'success');
    }
  }

  // Função para alternar o estado de arquivamento de um item
  function toggleArchiveItem(id) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = items.findIndex(item => item.id === id);

    if (index > -1) {
      items[index].archived = !items[index].archived;
      saveItems(items);
      renderItems();

      const action = items[index].archived ? 'arquivado' : 'desarquivado';
      showNotification(`Item ${action} com sucesso!`, 'success');
    }
  }

  // Função para adicionar uma tag ao filtro
  function addTagToFilter(tag) {
    if (!activeTagFilters.includes(tag)) {
      activeTagFilters.push(tag);
      updateTagFilters();
      renderItems();
    }
  }

  itemsGrid.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    const expandBtn = e.target.closest('.expand-btn');
    const pinBtn = e.target.closest('.pin-btn');
    const archiveBtn = e.target.closest('.archive-btn');
    const tagEl = e.target.closest('.tag');

    if (copyBtn) {
      const id = copyBtn.dataset.id;
      const items = getItems();
      const item = items.find(i => i.id === id);
      if (item) {
        navigator.clipboard.writeText(item.content);
        showNotification('Copiado para a área de transferência!', 'success');
      }
    } else if (editBtn) {
      openDialog('edit', editBtn.dataset.id);
    } else if (deleteBtn) {
      itemToDeleteId = deleteBtn.dataset.id;
      const confirmDialog = document.getElementById('confirm-dialog');
      confirmDialog.classList.remove('hidden');
    } else if (expandBtn) {
      const contentWrapper = expandBtn.closest('.item-content-wrapper');
      contentWrapper.classList.toggle('expanded');
      expandBtn.textContent = contentWrapper.classList.contains('expanded') ? 'Recolher' : 'Expandir';
    } else if (pinBtn) {
      togglePinItem(pinBtn.dataset.id);
    } else if (archiveBtn) {
      toggleArchiveItem(archiveBtn.dataset.id);
    } else if (tagEl && tagEl.closest('.tags-container')) { // Apenas tags dentro do card
      const tagId = tagEl.dataset.tagId;
      if (tagId) {
        addTagToFilter(tagId);
      }
    }
  });

  menuBtn.addEventListener('click', () => {
    menuDropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (event) => {
    if (!menuDropdown.contains(event.target) && !menuBtn.contains(event.target) && !menuDropdown.classList.contains('hidden')) {
      menuDropdown.classList.add('hidden');
    }
  });

  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const items = JSON.parse(event.target.result);
        importItems(items);
      } catch (error) {
        alert('Erro ao importar o arquivo. Verifique o formato JSON.');
      }
    };
    reader.readAsText(file);
  });

  exportBtn.addEventListener('click', async () => {
    const items = await getItems();
    const jsonString = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipboard-zen-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  clearDataBtn.addEventListener('click', () => {
    confirmPopup.style.display = 'flex'; // Mostra o popup
  });

  confirmYes.addEventListener('click', () => {
    clearAllItems();
    showNotification('Todos os itens foram removidos!', 'danger');
    confirmPopup.style.display = 'none';
  });

  confirmNo.addEventListener('click', () => {
    confirmPopup.style.display = 'none'; // Fecha sem fazer nada
  });

  // Função para limpar o cache do Service Worker
  async function clearCache() {
    if ('serviceWorker' in navigator) {
      try {
        // Limpa todos os caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );

        // Envia uma mensagem para o Service Worker para pular a espera e ativar o novo cache
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Recarrega a página para garantir que os novos arquivos sejam carregados
        window.location.reload();

        showNotification('Cache limpo com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao limpar o cache:', error);
        showNotification('Erro ao limpar o cache', 'danger');
      }
    } else {
      showNotification('Service Worker não suportado neste navegador', 'danger');
    }
  }

  // Removido: Event listener para o botão de limpar cache

  markdownHelpBtn.addEventListener('click', () => {
    markdownHelpDialog.classList.remove('hidden');
  });

  closeMarkdownHelpBtn.addEventListener('click', () => {
    markdownHelpDialog.classList.add('hidden');
  });


  function openDialog(mode, id = null) {
    addEditForm.reset();
    if (mode === 'edit') {
      const items = getItems();
      const item = items.find(item => item.id === id);
      dialogTitle.textContent = 'Editar Item';
      itemIdInput.value = item.id;
      itemTitleInput.value = item.title;
      itemContentInput.value = item.content;
      isCodeSwitch.checked = item.isCode || false;
      codeLanguageInput.value = item.language || '';
      renderSelectableTags(item.tags || []);
    } else {
      dialogTitle.textContent = 'Adicionar Item';
      isCodeSwitch.checked = false;
      renderSelectableTags([]);
    }
    toggleLanguageInput();
    addEditDialog.classList.remove('hidden');
  }

  function renderSelectableTags(selectedTagIds = []) {
    itemTagsContainer.innerHTML = '';
    const allTags = getTags();

    if (allTags.length === 0) {
      itemTagsContainer.innerHTML = '<p>Nenhuma tag disponível. Crie tags em "Gerenciar Tags".</p>';
      return;
    }

    allTags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = 'tag selectable';
      tagEl.textContent = tag.name;
      tagEl.dataset.tagId = tag.id;
      tagEl.style.backgroundColor = tag.color;
      if (selectedTagIds.includes(tag.id)) {
        tagEl.classList.add('selected');
      }
      tagEl.addEventListener('click', () => {
        tagEl.classList.toggle('selected');
      });
      itemTagsContainer.appendChild(tagEl);
    });
  }

  function closeDialog() {
    addEditDialog.classList.add('hidden');
  }

  function toggleLanguageInput() {
    if (isCodeSwitch.checked) {
      languageInputContainer.classList.remove('hidden');
    } else {
      languageInputContainer.classList.add('hidden');
    }
  }

  isCodeSwitch.addEventListener('change', toggleLanguageInput);

  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      notification.addEventListener('animationend', () => {
        notification.remove();
      });
    }, 3000);
  }

  const confirmDialog = document.getElementById('confirm-dialog');
  const closeConfirmDialogBtn = document.getElementById('close-confirm-dialog-btn');
  const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

  function closeConfirmDialog() {
    itemToDeleteId = null;
    confirmDialog.classList.add('hidden');
  }

  closeConfirmDialogBtn.addEventListener('click', closeConfirmDialog);
  cancelConfirmBtn.addEventListener('click', closeConfirmDialog);

  confirmDeleteBtn.addEventListener('click', () => {
    if (itemToDeleteId) {
      deleteItem(itemToDeleteId);
    }
    closeConfirmDialog();
  });

  // Função para alternar a exibição de itens arquivados
  function toggleArchivedItems() {
    showArchivedItems = !showArchivedItems;
    toggleArchivedBtn.querySelector('span').textContent = showArchivedItems ? 'Ocultar Arquivados' : 'Mostrar Arquivados';
    renderItems();
    showNotification(`Itens arquivados ${showArchivedItems ? 'visíveis' : 'ocultos'}`, 'success');
  }

  // Event listener para o botão de alternar itens arquivados
  toggleArchivedBtn.addEventListener('click', toggleArchivedItems);

  // Função para alternar o modo escuro
  function toggleDarkMode() {
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';

    if (isDarkMode) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  // Event listener para o botão de alternar modo escuro
  toggleDarkModeBtn.addEventListener('click', toggleDarkMode);

  // Verificar e aplicar o tema salvo
  function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }

  // Aplicar o tema ao carregar a página
  applyTheme();

  renderItems();
});