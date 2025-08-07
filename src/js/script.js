import { PGlite } from "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js";

// Variável global para o banco de dados
let db;

document.addEventListener('DOMContentLoaded', async () => {
  db = new PGlite();

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

  const menuBtn = document.getElementById('menu-btn');
  const menuDropdown = document.getElementById('menu-dropdown');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-input');
  const exportBtn = document.getElementById('export-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');

  const installPwaBtn = document.getElementById('install-pwa-btn');
  let deferredPrompt;

  // --- PWA Install ---
  window.addEventListener('beforeinstallprompt', (e) => {
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


  async function initDb() {
    await db.query(`
            CREATE TABLE IF NOT EXISTS clipboard_items (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                createdAt BIGINT NOT NULL
            );
        `);
    await renderItems(); // Garante que os itens sejam renderizados após a inicialização do DB
  }

  async function getItems(query = '') {
    const searchQuery = `%${query.toLowerCase()}%`;
    const results = await db.query(`
            SELECT * FROM clipboard_items
            WHERE lower(title) LIKE $1 OR lower(content) LIKE $1
            ORDER BY createdAt DESC;
        `, [searchQuery]);
    return results.rows;
  }

  async function addItem(item) {
    await db.query(`
            INSERT INTO clipboard_items (id, title, content, createdAt)
            VALUES ($1, $2, $3, $4);
        `, [item.id, item.title, item.content, item.createdAt]);
    renderItems();
  }

  async function updateItem(item) {
    await db.query(`
            UPDATE clipboard_items
            SET title = $1, content = $2
            WHERE id = $3;
        `, [item.title, item.content, item.id]);
    renderItems();
  }

  async function deleteItem(id) {
    await db.query('DELETE FROM clipboard_items WHERE id = $1;', [id]);
    renderItems();
  }

  async function clearAllItems() {
    await db.query('DELETE FROM clipboard_items;');
    renderItems();
  }

  async function importItems(items) {
    await db.transaction(async (tx) => {
      await tx.query('DELETE FROM clipboard_items;');
      for (const item of items) {
        await tx.query(`
                    INSERT INTO clipboard_items (id, title, content, createdAt)
                    VALUES ($1, $2, $3, $4);
                `, [item.id, item.title, item.content, item.createdAt]);
      }
    });
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
        itemEl.innerHTML = `
                    <div class="item-header">${item.title}</div>
                    <div class="item-content">${item.content}</div>
                    <div class="item-footer">
                        <span>${new Date(item.createdAt).toLocaleString()}</span>
                        <div class="item-actions">
                            <button class="button icon-button copy-btn" data-content="${item.content}" title="Copiar">
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
      });
    }
    // Atualiza o estado do botão de exportar
    updateExportButtonState(items.length > 0);
  }

  async function updateExportButtonState(hasItems) {
    exportBtn.disabled = !hasItems;
  }

  // Event Listeners
  searchInput.addEventListener('input', renderItems);
  addItemBtn.addEventListener('click', () => openDialog('add'));
  emptyStateAddBtn.addEventListener('click', () => openDialog('add'));
  closeDialogBtn.addEventListener('click', closeDialog);
  cancelDialogBtn.addEventListener('click', closeDialog);

  addEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = itemIdInput.value;
    const title = itemTitleInput.value;
    const content = itemContentInput.value;

    if (id) { // Editing
      await updateItem({ id, title, content });
    } else { // Adding
      await addItem({
        id: crypto.randomUUID(),
        title,
        content,
        createdAt: Date.now()
      });
    }
    closeDialog();
  });

  itemsGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
      navigator.clipboard.writeText(e.target.dataset.content);
      alert('Copiado!');
    } else if (e.target.classList.contains('edit-btn')) {
      openDialog('edit', e.target.dataset.id);
    } else if (e.target.classList.contains('delete-btn')) {
      if (confirm('Tem certeza que deseja excluir este item?')) {
        deleteItem(e.target.dataset.id);
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
    if (confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      clearAllItems();
    }
  });


  async function openDialog(mode, id = null) {
    addEditForm.reset();
    if (mode === 'edit') {
      const { rows: [item] } = await db.query('SELECT * FROM clipboard_items WHERE id = $1;', [id]);
      dialogTitle.textContent = 'Editar Item';
      itemIdInput.value = item.id;
      itemTitleInput.value = item.title;
      itemContentInput.value = item.content;
    } else {
      dialogTitle.textContent = 'Adicionar Item';
    }
    addEditDialog.classList.remove('hidden');
  }

  function closeDialog() {
    addEditDialog.classList.add('hidden');
  }

  initDb();
});