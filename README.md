<div align="center">

# ✅ To-Do List — Engenharia de Software na Era da IA

**Aplicação Web SPA (Single Page Application) modular para gerenciamento inteligente de tarefas diárias, construída com JavaScript Vanilla ES6+, arquitetura limpa e Orquestração de Agentes de IA.**

[![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6%2B%20Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![HTML5 Semântico](https://img.shields.io/badge/HTML5-Sem%C3%A2ntico-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3 Moderno](https://img.shields.io/badge/CSS3-Variables%20%26%20Flex%2FGrid-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![Alura + Google](https://img.shields.io/badge/Imers%C3%A3o-Alura%20%2B%20Google-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://www.alura.com.br/)
[![Agentic Workflow](https://img.shields.io/badge/Workflow-GCCD%20%2B%20AGENTS.md-10B981?style=for-the-badge)](#)
[![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-22C55E?style=for-the-badge)](#)

</div>

---

## 📌 Sobre o Projeto

A **To-Do List — Dev na Era da IA** é uma aplicação web **Single Page Application (SPA)** projetada para oferecer uma experiência fluida, responsiva e segura no gerenciamento do ciclo de vida completo de tarefas pessoais (**CRUD**).

Mais do que uma aplicação funcional sem dependências externas (*zero-framework*), este projeto representa um estudo de caso prático de **Engenharia de Software Moderna**: todo o seu ciclo de desenvolvimento — da especificação de requisitos e arquitetura modular até a implementação, blindagem contra vulnerabilidades XSS e refinamento de UX — foi conduzido através de **Pensamento de Engenharia** e **Orquestração de Agentes de IA**.

---

## 🚀 Imersão Engenharia de Software: Dev na Era da IA (Alura + Google)

Este projeto foi desenvolvido durante a **Imersão Engenharia de Software: Dev na Era da IA**, realizada pela **Alura** em parceria com o **Google**.

### A Virada de Chave no Mercado de Tecnologia
O mercado de desenvolvimento de software vive uma transformação estrutural: **a transição da escrita isolada de código assistida por IA (autocompletar/chat pontual) para a Orquestração de Agentes de IA em todo o ciclo de engenharia**.

Nesta nova abordagem, o papel da pessoa desenvolvedora evolui de simples codificadora para **Engenheira e Arquiteta de Sistemas e Contexto**, atuando em:
- **Pensamento de Engenharia (Engineering Thinking):** Decomposição de problemas complexos em módulos coesos, definição de contratos claros entre camadas e estabelecimento de critérios rigorosos de aceite antes de gerar qualquer linha de código.
- **Engenharia de Contexto:** Fornecimento de especificações determinísticas para que os agentes compreendam não apenas *o que* construir, mas *como* e *sob quais restrições* arquiteturais operar.
- **Qualidade, Segurança e Manutenibilidade:** Garantia de Clean Code, separação de responsabilidades (SoC), acessibilidade (`ARIA`) e proteção contra injeção de código (`XSS`) desde o primeiro commit.

---

## 🤖 Desenvolvimento Orientado por Agentes (Agentic Workflow)

A construção deste software utilizou o ecossistema **Google Antigravity** e **Google AI Studio**, aplicando metodologias de ponta para governança de agentes autônomos:

### 1. Diretrizes Persistentes com `AGENTS.md`
Na raiz do repositório, o arquivo `AGENTS.md` atua como a **fonte única de verdade (Single Source of Truth)** para o agente de IA. Ele define a persona técnica (*Desenvolvedor Frontend Sênior especialista em Clean Code*), a árvore arquitetural esperada e as regras de negócio inegociáveis.

### 2. Framework GCCD (Goal, Context, Constraints, Deliverables)
Toda a comunicação e especificação técnica foi estruturada utilizando o modelo **GCCD**:
- 🎯 **Goal (Objetivo):** Definição clara do produto final (SPA responsiva com CRUD completo e persistência em `localStorage`).
- 🧠 **Context (Contexto):** Stack tecnológica (HTML5 Semântico, CSS3 com Custom Properties, JavaScript Vanilla ES6+ Modules) e divisão estrita entre estado/persistência e manipulação de DOM.
- ⚠️ **Constraints (Restrições):** Proibição de tarefas vazias, sanitização obrigatória contra XSS, entregas incrementais e design *Mobile-First*.
- 📦 **Deliverables (Entregáveis):** Critérios de aceite verificáveis (criação, edição inline, filtros dinâmicos, contadores em tempo real e alternância de tema).

### 3. Alinhamento Arquitetural com `grill me`
Antes da execução e durante a evolução das funcionalidades, a técnica **`grill me`** foi utilizada para fazer o agente questionar decisões de design, levantar casos de borda (*edge cases* como edição vazia, cancelamento com `Escape`, concorrência entre `blur` e `Enter`, e preferência de tema do sistema operacional) e validar o plano de implementação antes de alterar o código-fonte.

---

## ✨ Funcionalidades e Recursos de UX

A aplicação conta com recursos avançados de usabilidade e engenharia no frontend:

- **📝 CRUD Completo de Tarefas:**
  - **Criação rápida:** Adição de tarefas com validação contra textos vazios ou apenas espaços em branco e suporte nativo à tecla `Enter`.
  - **Leitura e Filtros Dinâmicos:** Visualização instantânea filtrada por **Todas**, **Pendentes** ou **Concluídas**, com estados vazios (*Empty States*) contextualizados em SVG para cada filtro.
  - **Atualização de Status:** Marcação/desmarcação de conclusão com feedback visual imediato (texto tachado e transição de opacidade).
  - **Edição Inline Avançada:** Ativada por **duplo clique** no texto ou pelo botão de editar, permitindo salvar com `Enter` ou perda de foco (`blur`) e cancelar/reverter alterações com a tecla `Escape`.
  - **Exclusão Individual e em Lote:** Remoção de tarefas específicas com animação de saída suave (`animationend`) e botão **"Limpar concluídas"** exibido dinamicamente.
- **🌓 Tema Dark / Light Inteligente:**
  - Detecção automática da preferência do sistema operacional via `window.matchMedia('(prefers-color-scheme: dark)')`.
  - Alternância manual instantânea via atributo `data-theme` no documento e persistência da escolha do usuário no `localStorage`.
- **💾 Persistência Local Resiliente:**
  - Sincronização automática no `localStorage` sob as chaves versionadas `todo_app_tasks_v1` e `todo_app_theme_v1`, com tratamento de exceções (`try/catch`) e geração de IDs únicos via `crypto.randomUUID()` (com fallback seguro).
- **🛡️ Segurança e Acessibilidade (a11y):**
  - **Prevenção de XSS:** Função dedicada `sanitizeText()` que escapa caracteres especiais (`&`, `<`, `>`, `"`, `'`) antes de qualquer persistência ou renderização.
  - **Semântica e ARIA:** Uso de atributos `aria-label`, `aria-pressed` nos filtros e navegação intuitiva via teclado.
- **📊 Estatísticas em Tempo Real:**
  - Contador dinâmico de tarefas pendentes com mensagem comemorativa (`🎉 Todas as tarefas concluídas!`) quando todas as atividades são finalizadas.

---

## 🛠️ Arquitetura e Estrutura do Projeto

O projeto adota uma **Arquitetura Modular Limpa (Clean Architecture no Frontend)** utilizando **ES6 Modules nativos**, garantindo baixo acoplamento e alta coesão sem necessidade de bundlers ou bibliotecas externas.

### 📂 Árvore de Arquivos

```text
/
├── index.html        # Estrutura HTML5 semântica e importação do módulo principal
├── css/
│   └── styles.css    # Design System com CSS Variables, Dark/Light mode e animações
├── js/
│   ├── app.js        # Controlador principal: inicialização, eventos e orquestração
│   ├── storage.js    # Camada de Dados: CRUD no localStorage, UUID e sanitização XSS
│   └── render.js     # Camada de View/DOM: templates, DocumentFragment, edição inline e temas
├── AGENTS.md         # Diretrizes de engenharia e contexto (GCCD) para Agentes de IA
└── README.md         # Documentação oficial do projeto
```

### 🧩 Responsabilidade de Cada Módulo

| Arquivo | Camada / Papel | Principais Responsabilidades e Funções |
| :--- | :--- | :--- |
| **`js/app.js`** | **Orquestrador / Controller** | Ponto de entrada da aplicação (`DOMContentLoaded`). Gerencia o estado do filtro ativo (`activeFilter`), delega eventos de clique/duplo clique na lista e conecta as ações do usuário entre `storage.js` e `render.js`. |
| **`js/storage.js`** | **Domínio & Persistência** | Isola toda a lógica de dados e `localStorage`. Exporta `getTasks`, `saveTasks`, `addTask`, `toggleTask`, `updateTaskText`, `deleteTask`, `clearCompletedTasks`, `getStoredTheme`, `setStoredTheme`, `generateId` e `sanitizeText`. |
| **`js/render.js`** | **Interface & DOM (View)** | Manipula o DOM de forma performática usando `DocumentFragment`. Exporta `renderTaskList`, `updateStats`, `updateFilterUI`, `animateRemoval`, `startInlineEditing` e `applyTheme`, além dos ícones vetoriais SVG. |
| **`css/styles.css`** | **Estilização & Temas** | Define tokens visuais com variáveis CSS (`--bg`, `--surface`, `--text`, `--primary`), layout *Mobile-First* com Flexbox, suporte a `[data-theme="dark"]` e transições/keyframes de remoção. |
| **`AGENTS.md`** | **Governança de IA** | Especifica o contrato arquitetural no padrão **GCCD** para orientar agentes de IA durante o desenvolvimento e manutenção. |

---

## 💻 Como Executar o Projeto Localmente

Por utilizar **JavaScript ES6 Modules** (`<script type="module" src="js/app.js"></script>`), os navegadores exigem que os arquivos sejam servidos via protocolo `http://` ou `https://` (por políticas de segurança de CORS para módulos).

### Pré-requisitos
- Qualquer navegador web moderno (Chrome, Edge, Firefox, Safari).
- Um servidor HTTP local simples (ex: extensão **Live Server** do VS Code, **Python** ou **Node.js**).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Caualopesrlp/To-do-List-Dev-na-Era-da-IA---Alura.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd To-do-List-Dev-na-Era-da-IA---Alura
   ```

3. **Inicie um servidor local (escolha uma das opções abaixo):**

   - **Opção A — Usando Python 3 (nativo na maioria dos sistemas):**
     ```bash
     python3 -m http.server 8000
     ```
     Acesse no navegador: `http://localhost:8000`

   - **Opção B — Usando Node.js (`npx serve`):**
     ```bash
     npx serve .
     ```

   - **Opção C — Usando VS Code / Antigravity IDE:**
     Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.

---

## 👤 Autor & Conexão

Desenvolvido com dedicação, pensamento de engenharia e orquestração de agentes de IA por **Cauã Lopes** durante a **Imersão Engenharia de Software: Dev na Era da IA (Alura + Google)**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Cau%C3%A3%20Lopes-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/caualopesrlp/)
[![GitHub](https://img.shields.io/badge/GitHub-Caualopesrlp-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Caualopesrlp)

---

<div align="center">

**#ImersaoEngenhariadeSoftware** • **Alura + Google**

</div>
