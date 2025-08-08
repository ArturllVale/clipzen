document.addEventListener('DOMContentLoaded', async () => {

  const searchInput = document.getElementById('search-input');
  const itemsGrid = document.getElementById('items-grid');
  const emptyState = document.getElementById('empty-state');
  const emptyStateTitle = document.getElementById('empty-state-title');
  const emptyStateMessage = document.getElementById('empty-state-message');

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

  const markdownHelpBtn = document.getElementById('markdown-help-btn');
  const markdownHelpDialog = document.getElementById('markdown-help-dialog');
  const closeMarkdownHelpBtn = document.getElementById('close-markdown-help-btn');

  const menuBtn = document.getElementById('menu-btn');
  const menuDropdown = document.getElementById('menu-dropdown');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-input');
  const exportBtn = document.getElementById('export-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');

  const confirmPopup = document.getElementById('confirmPopup');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');

  const installPwaBtn = document.getElementById('install-pwa-btn');
  const notificationContainer = document.getElementById('notification-container');
  let deferredPrompt;
  let itemToDeleteId = null;

  // --- PWA Install ---
  // Verifica se o app já está instalado
  function isAppInstalled() {
    // Verifica se está rodando como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Verifica se foi instalado anteriormente (usando localStorage)
    return localStorage.getItem('appInstalled') === 'true';
  }

  // Esconde o botão de instalação se o app já estiver instalado
  if (isAppInstalled()) {
    installPwaBtn.classList.add('hidden');
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    // Se o app já está instalado, não mostra o botão
    if (isAppInstalled()) {
      return;
    }

    e.preventDefault();
    deferredPrompt = e;
    installPwaBtn.classList.remove('hidden');
  });

  installPwaBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
        installPwaBtn.classList.add('hidden');
        // Marca o app como instalado
        localStorage.setItem('appInstalled', 'true');
      }
    }
  });

  // --- Service Worker Registration ---
  if (window.APP_CONFIG && window.APP_CONFIG.MODE === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(error => {
          console.log('Falha ao registrar o Service Worker:', error);
        });
    });
  }


  const STORAGE_KEY = 'clipboard_zen_items';

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getItems(query = '') {
    let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (query) {
      const searchQuery = query.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery) ||
        item.content.toLowerCase().includes(searchQuery)
      );
    }
    return items.sort((a, b) => b.createdAt - a.createdAt);
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
                    <div class="item-footer">
                        <span>${new Date(item.createdAt).toLocaleString()}</span>
                        <div class="item-actions">
                            <button class="button icon-button copy-btn" data-id="${item.id}" title="Copiar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-copy"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
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
  }

  // Event Listeners
  searchInput.addEventListener('input', renderItems);
  addItemBtn.addEventListener('click', () => openDialog('add'));
  emptyStateAddBtn.addEventListener('click', () => openDialog('add'));
  closeDialogBtn.addEventListener('click', closeDialog);
  cancelDialogBtn.addEventListener('click', closeDialog);

  addEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = itemIdInput.value;
    const title = itemTitleInput.value;
    const content = itemContentInput.value;
    const isCode = isCodeSwitch.checked;
    const language = codeLanguageInput.value;

    const itemData = {
      title,
      content,
      isCode,
      language: isCode ? language : null,
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
  });

  itemsGrid.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    const expandBtn = e.target.closest('.expand-btn');

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
    } else {
      dialogTitle.textContent = 'Adicionar Item';
      isCodeSwitch.checked = false;
    }
    toggleLanguageInput();
    addEditDialog.classList.remove('hidden');
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

  renderItems(); // Chama renderItems diretamente, já que initDb não é mais necessário
});