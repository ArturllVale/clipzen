# Clipboard Zen

Clipboard Zen é um gerenciador de área de transferência web que permite salvar e organizar qualquer tipo de conteúdo útil: links, textos, trechos de código, etc. e acessá-los de qualquer lugar, mesmo offline.

## 🌟 Funcionalidades

- **Salve qualquer conteúdo**: Links, textos, trechos de código, etc.
- **Organização por títulos**: Dê nomes significativos aos seus itens salvos
- **Suporte a Markdown**: Formate seus textos com Markdown
- **Destaque de sintaxe**: Para trechos de código em várias linguagens
- **Busca**: Encontre rapidamente o conteúdo que precisa
- **PWA (Progressive Web App)**: Instale no seu dispositivo e use offline
- **Importação/Exportação**: Faça backup dos seus dados em JSON
- **Interface responsiva**: Funciona em dispositivos móveis e desktop
- **Armazenamento local**: Todos os dados ficam no seu navegador

## 🛠️ Tecnologias Utilizadas

- **HTML5/CSS3/JavaScript (Vanilla)**
- **Progressive Web App (PWA)**
- **Service Worker** para funcionamento offline
- **Web Manifest** para instalação como app
- **LocalStorage** para armazenamento de dados
- **Marked.js** para renderização de Markdown
- **Highlight.js** para destaque de sintaxe de código
- **Feather Icons** para ícones

## 🚀 Como Usar

1. **Adicionar item**: Clique no botão "Adicionar Item" para salvar um novo conteúdo
2. **Formatar texto**: Use Markdown para formatar seus textos
3. **Salvar código**: Ative a opção "É um trecho de código?" e especifique a linguagem
4. **Buscar**: Use a barra de pesquisa para encontrar itens específicos
5. **Copiar**: Clique no ícone de cópia para copiar o conteúdo para a área de transferência
6. **Editar/Excluir**: Use os ícones correspondentes para editar ou excluir itens

## 📦 Instalação

### Como PWA

1. Acesse o Clipboard Zen no seu navegador
2. Clique no botão "Instalar App" que aparece quando disponível
3. Siga as instruções do seu navegador para instalar

### Para Desenvolvimento

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   ```

2. Abra o arquivo `index.html` no seu navegador

3. Para desenvolvimento com servidor local:
   ```bash
   # Usando Python
   python -m http.server 8000
   
   # Ou usando Node.js (se tiver o http-server instalado)
   npx http-server
   ```

## ⚙️ Configuração

O arquivo `src/js/config.js` permite configurar o modo de operação:

```javascript
const APP_CONFIG = {
  MODE: 'development' // Altere para 'production' para habilitar o Service Worker
};
```

- **development**: Modo de desenvolvimento (sem Service Worker)
- **production**: Modo de produção (com Service Worker para funcionamento offline)

## 📤 Importação/Exportação de Dados

- **Exportar**: Clique no menu (⋮) > "Exportar json" para fazer backup dos seus dados
- **Importar**: Clique no menu (⋮) > "Importar Json" para restaurar dados de um backup

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

## 🙏 Agradecimentos

- [Marked.js](https://marked.js.org/) para renderização de Markdown
- [Highlight.js](https://highlightjs.org/) para destaque de sintaxe
- [Feather Icons](https://feathericons.com/) para os ícones