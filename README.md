<div align="center">

# ⚡ FluxCalc — Calculadora Reativa com Fita Dinâmica

**Calculadora inteligente com fita interativa, edição retroativa de operandos, grafo de dependências (`L1`, `L2`...) e propagação de cálculos em cascata em tempo real.**

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python Core](https://img.shields.io/badge/Python-Reactive_Graph-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Alura + Google](https://img.shields.io/badge/Imers%C3%A3o-Alura%20%2B%20Google-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://www.alura.com.br/)
[![Agentic Workflow](https://img.shields.io/badge/Workflow-GCCD%20%2B%20Grill%20Me-10B981?style=for-the-badge)](#)

</div>

---

## 📌 Sobre o Projeto

O **FluxCalc** é uma calculadora reativa moderna que reinventa a experiência das calculadoras tradicionais de fita de papel, unindo a simplicidade de uma calculadora de bolso ao poder de reatividade de uma planilha eletrônica.

Em calculadoras comuns, se você comete um erro no primeiro cálculo de uma sequência de 5 etapas, precisa apagar tudo e refazer do zero. No **FluxCalc**, cada linha selada (`L1`, `L2`, `L3`...) pode ser referenciada nas linhas seguintes. Ao clicar em qualquer número do histórico para **editá-lo retroativamente**, o motor de grafo reativo recalcula instantaneamente a linha alterada e **propaga a atualização em cascata** por todas as linhas dependentes em tempo real.

Além da aplicação web interativa em **React + TypeScript + Tailwind CSS**, o repositório conta com uma implementação de referência do motor de grafo reativo em **Python**, acompanhada de suítes de testes automatizados em ambas as linguagens.

---

## 🚀 Imersão Engenharia de Software: Dev na Era da IA (Alura + Google)

Este projeto foi desenvolvido no contexto da **Imersão Engenharia de Software: Dev na Era da IA**, realizada pela **Alura** em parceria com o **Google**.

### A Virada de Chave na Engenharia de Software
A construção do **FluxCalc** exemplifica a transição do simples uso de IA para autocompletar código rumo à **Orquestração de Agentes de IA orientada por Pensamento de Engenharia**:

- **Pensamento de Engenharia (Engineering Thinking):** Modelagem matemática e estrutural de um Grafo Acíclico Dirigido (DAG) para resolução topológica de dependências entre linhas (`refLineId`), precedência aritmética (`*` e `/` antes de `+` e `-`) e mitigação de imprecisões de ponto flutuante (`IEEE 754`).
- **Engenharia de Contexto (Framework GCCD):**
  - 🎯 **Goal (Objetivo):** Construir uma calculadora de fita reativa capaz de editar o passado e recalcular o futuro em cascata sem perda de contexto.
  - 🧠 **Context (Contexto):** Arquitetura desacoplada entre o motor de cálculo puro (`calcEngine.ts` / `python/fluxcalc`) e a camada visual reativa (`TapeViewport`, `Keypad`, modais de exportação e comprovantes).
  - ⚠️ **Constraints (Restrições):** Tratamento gracioso de erros (como divisão por zero propagada em cadeia), formatação numérica no padrão brasileiro (`pt-BR`), notas descritivas limitadas a 25 caracteres e persistência resiliente em `localStorage`.
  - 📦 **Deliverables (Entregáveis):** Interface completa com fita dinâmica, edição inline retroativa, gerador de comprovantes formatados para WhatsApp/Text, cenários pré-configurados (*Presets*) e testes unitários.
- **Refinamento Arquitetural com `grill me`:** Validação rigorosa de casos de borda — como o comportamento duplo das teclas `C` (apagar dígito/token) vs `AC` (selar linha atual na fita e abrir nova linha zerada), encadeamento automático do resultado anterior ao iniciar uma linha com operador e exportação de recibos detalhados.

---

## ✨ Funcionalidades Principais

- **📜 Fita Dinâmica Reativa (Interactive Tape):**
  - Histórico contínuo de linhas identificadas (`L1`, `L2`, `L3`...) com visualização clara da expressão completa, notas semânticas e resultado formatado no padrão brasileiro (`1.234,56`).
  - Pré-visualização em tempo real (`Draft Preview`) do resultado enquanto você digita a linha atual.
- **🔄 Edição Retroativa e Propagação em Cascata:**
  - Clique em **qualquer número de uma linha já finalizada** para abrir o editor inline retroativo.
  - À medida que o valor é alterado, o grafo de dependências identifica e recalcula automaticamente todas as linhas que dependem direta ou indiretamente daquela linha, destacando visualmente e sonoramente o efeito cascata.
- **🔗 Referências Inteligentes entre Linhas (`Ref L1`, `Ref L2`):**
  - Clique no resultado de qualquer linha anterior (ou use o atalho de reutilizar último resultado) para injetá-lo como um token de referência dinâmica na conta atual.
  - Ao digitar um operador (`+`, `−`, `×`, `÷`) em uma linha vazia, o FluxCalc injeta automaticamente uma referência ao resultado da linha imediatamente anterior.
- **🏷️ Notas Rápidas nos Números (Semantic Labels):**
  - Dê um **duplo clique** em qualquer número (ou use o botão de nota rápida) para anexar um rótulo descritivo de até 25 caracteres (ex.: `[Aluguel]`, `[Energia/Luz]`, `[3 Moradores]`), transformando cálculos abstratos em memórias de cálculo legíveis.
- **🧾 Gerador de Comprovantes e Recibos (Receipt Formatter):**
  - Gere comprovantes detalhados de uma **linha específica** ou da **fita completa**, prontos para copiar e enviar no WhatsApp, e-mail ou documentação.
  - Detecção semântica inteligente de divisores de quantidade (ex.: `÷ 3 Moradores = R$ 720,00/pessoa` ou `/parcela`) e opção de alternar símbolo monetário (`R$`) e data/hora.
- **🎯 Cenários Pré-Configurados (Presets Interativos):**
  - Teste o poder da propagação em cascata com 1 clique através de cenários prontos do dia a dia:
    1. **Divisão de Despesas da Casa:** Soma contas do mês (`Aluguel + Luz + Internet`) em `L1` e divide entre `3 Moradores` em `L2`.
    2. **Reforma & Metragem de Piso:** Calcula a área em `m²` (`L1`), multiplica pelo preço do porcelanato (`L2`) e soma a mão de obra (`L3`).
    3. **Simulação "E se?": Desconto & Parcelas:** Aplica desconto sobre um produto (`L1`) e simula o parcelamento sem juros (`L2`).
- **🔊 Feedback Sonoro Sintetizado (Web Audio API) & Atalhos de Teclado:**
  - Efeitos sonoros táteis gerados via síntese de áudio nativo (sem arquivos externos) para dígitos, operadores, confirmação e cascata reativa, com botão de *Mute/Unmute* no cabeçalho.
  - Suporte completo ao teclado físico (`0-9`, `+`, `-`, `*`, `/`, `Enter`/`=`, `Backspace`, `Escape`, `C`).
- **💾 Persistência e Portabilidade (JSON):**
  - Salvamento automático do estado da fita no `localStorage` (`fluxcalc_state_v1`) e modal de exportação/cópia rápida.

---

## 🛠️ Arquitetura e Estrutura do Projeto

O projeto é organizado de forma modular, separando claramente o **Motor de Cálculo e Grafo Reativo**, os **Formatadores de Domínio**, os **Componentes Visuais React** e o **Core Python de Referência**:

### 📂 Árvore de Arquivos

```text
FluxCalc/
├── index.html                        # Ponto de entrada HTML5
├── metadata.json                     # Metadados da aplicação no ecossistema AI Studio
├── package.json                      # Dependências e scripts (React 19, Vite, Tailwind v4, TypeScript)
├── tsconfig.json                     # Configuração estrita do TypeScript
├── vite.config.ts                    # Configuração de build e servidor Vite
├── src/
│   ├── main.tsx                      # Inicialização do React DOM
│   ├── index.css                     # Estilos globais e configuração do Tailwind CSS
│   ├── App.tsx                       # Orquestrador de estado, atalhos de teclado e ações da calculadora
│   ├── components/
│   │   ├── Header.tsx                # Barra superior: telemetria (linhas/refs), som, presets e ações
│   │   ├── TapeViewport.tsx          # Visor da fita: histórico de linhas, tokens, refs e edição inline
│   │   ├── Keypad.tsx                # Teclado numérico ergonômico com ações rápidas (C, AC, Notas, Ref)
│   │   ├── ReceiptModal.tsx          # Modal de geração e customização de comprovantes (Linha ou Fita)
│   │   ├── PresetSelectorModal.tsx   # Seletor de cenários práticos ("E se?")
│   │   ├── NoteModal.tsx             # Modal para adição/edição de rótulos (labels) em números
│   │   ├── ExportModal.tsx           # Modal de exportação da memória de cálculo
│   │   └── ClearConfirmModal.tsx     # Confirmação de segurança antes de limpar toda a fita
│   └── utils/
│       ├── calcEngine.ts             # Motor aritmético, resolução de precedência e Grafo Reativo (DAG)
│       ├── calcEngine.test.ts        # Testes unitários do motor de cálculo TypeScript
│       ├── receiptFormatter.ts       # Formatação inteligente de comprovantes (R$, /pessoa, clipboard)
│       ├── receiptFormatter.test.ts  # Testes unitários do gerador de comprovantes
│       ├── presets.ts                # Definição dos cenários pré-configurados
│       └── sound.ts                  # Sintetizador de efeitos sonoros via Web Audio API
├── python/
│   └── fluxcalc/                     # Implementação de referência do domínio em Python
│       ├── __init__.py
│       ├── models.py                 # Dataclasses para Token e Line
│       ├── evaluator.py              # Avaliador de expressões com precedência e tratamento de erros
│       ├── graph.py                  # Grafo Reativo (ReactiveGraph) com ordenação topológica em cascata
│       ├── receipt.py                # Gerador de comprovantes em texto no Python
│       └── persistence.py            # Serialização e desserialização JSON do estado da fita
└── tests/
    └── test_fluxcalc.py              # Suíte de testes automatizados (unittest) do motor Python
```

### 🧩 Responsabilidade dos Módulos Principais

| Módulo / Arquivo | Camada | Responsabilidades Principais |
| :--- | :--- | :--- |
| **`src/utils/calcEngine.ts`** | **Core / Grafo Reativo (TS)** | Define as interfaces `Token` e `Line`. Implementa `evaluateTokens()` (respeitando precedência `*`/`/` antes de `+`/`-`), `recalculateAll()` e `updateTokenValue()` para propagação em cascata nas linhas dependentes. |
| **`src/utils/receiptFormatter.ts`** | **Formatador de Domínio** | Gera comprovantes textuais (`formatSingleLineReceipt` e `formatFullTapeReceipt`), formata moeda (`formatReceiptCurrency`), identifica rótulos de quantidade (`isQuantityLabel`) e copia com fallback seguro (`copyToClipboard`). |
| **`src/App.tsx`** | **Controller / Estado Global** | Gerencia o ciclo de vida das linhas seladas, a linha ativa em digitação (`activeTokens`), o alvo de edição retroativa (`editingTarget`), persistência em `localStorage` e listeners globais de teclado. |
| **`src/components/TapeViewport.tsx`** | **Interface (View)** | Renderiza cada linha da fita, chips de referência (`L1`, `L2`), badges de notas descritivas, inputs de edição inline retroativa e animações de recálculo. |
| **`python/fluxcalc/graph.py`** | **Core / Grafo Reativo (Python)** | Classe `ReactiveGraph` que mapeia `dependencies` e `dependents` entre linhas e executa `recalculate_cascade()` em ordem topológica. |

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v18 ou superior) e **npm** (para a interface web React/Vite).
- **Python 3.10+** (opcional, para executar o motor Python e sua suíte de testes).

### 1. Clone o repositório
```bash
git clone https://github.com/Caualopesrlp/FluxCalc.git
cd FluxCalc
```

### 2. Executando a Aplicação Web (Frontend React + TypeScript)
Instale as dependências e inicie o servidor de desenvolvimento:
```bash
npm install
npm run dev
```
Acesse no navegador: **`http://localhost:3000`**

Para gerar a build de produção ou validar a tipagem:
```bash
npm run lint    # Verifica tipos com TypeScript (tsc --noEmit)
npm run build   # Gera o bundle otimizado na pasta dist/
```

### 3. Executando os Testes Automatizados (Core Python)
Para rodar a suíte de testes unitários do grafo reativo e formatador em Python:
```bash
python3 -m unittest discover -s tests
```

---

## 👤 Autor & Conexão

Desenvolvido com pensamento de engenharia, arquitetura reativa e orquestração de agentes de IA por **Cauã Lopes** durante a **Imersão Engenharia de Software: Dev na Era da IA (Alura + Google)**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Cau%C3%A3%20Lopes-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/caualopesrlp/)
[![GitHub](https://img.shields.io/badge/GitHub-Caualopesrlp-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Caualopesrlp)

---

<div align="center">

**#ImersaoEngenhariadeSoftware** • **Alura + Google**

</div>
