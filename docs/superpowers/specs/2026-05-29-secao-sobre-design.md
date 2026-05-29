# Design Spec: Seção "Sobre" no UniSearch

**Autor:** Antigravity (AI assistant)  
**Data:** 2026-05-29  
**Status:** Aprovado pelo usuário  

---

## 🔍 Visão Geral e Objetivos

Esta especificação define o design e a implementação da seção **"Sobre"** na aplicação UniSearch. O objetivo é tornar a plataforma mais convidativa e explicar de forma clara aos usuários:
1. **Como o UniSearch surgiu:** Resolvendo as dificuldades dos discentes da UNIFAL-MG em localizar informações nos portais acadêmicos.
2. **O que faz:** Processamento e busca instantânea baseada em relevância de documentos complexos (como PDFs de regulamentos, planos de ensino, etc.).
3. **Qual o diferencial:** Busca semântica inteligente usando Elasticsearch com filtros estruturados.

---

## 📐 Requisitos de Design e Fluxo

- **Posicionamento:** A seção deve ficar posicionada diretamente abaixo da grade de cards principais (Disciplinas, Corpo Docente, Regulamentos).
- **Visibilidade:** Assim como a grade de cards atuais, a seção "Sobre" deve sumir de forma dinâmica quando o usuário realiza uma pesquisa (`hasSearched === true`).
- **Layout:** Storytelling vertical em zigue-zague (alternando texto e elementos gráficos).
- **Design System:** Utilizar as cores definidas no design system da plataforma (`primary`, `secondary`, `unifal-bg`, `white`, tons de cinza do Tailwind).
- **Sem Imagens Externas:** Usar ilustrações CSS e Tailwind responsivas com micro-animações (como hover/rotação) para simular documentos e telas da plataforma.

---

## 🛠️ Detalhes da Implementação

### Componentes Afetados

#### [MODIFY] [HomePage.jsx](file:///C:/Users/vinic/Documents/code/UniSearch/ElasticSearch/frontend/src/pages/HomePage.jsx)
- Inserir a seção `<section>` dentro do bloco condicional `{!hasSearched ? (...) : (...)}`.
- Adicionar o manipulador no botão "Ir para o buscador" para focar no campo de busca (`searchInputRef.current?.focus()`) e rolar a tela suavemente para o topo.

---

## 🧪 Plano de Verificação

### Verificação Manual
1. Abrir a página inicial do UniSearch.
2. Rolar para baixo e confirmar a presença da seção "Sobre" com a estrutura em zigue-zague e os elementos interativos.
3. Verificar se o hover nos cartões ilustrativos funciona (rotações suaves e efeitos de sombra).
4. Clicar no botão "Ir para o buscador" no fim da seção e conferir se a tela sobe suavemente e o foco é direcionado ao input de pesquisa.
5. Digitar um termo de busca (ex: "estágio") e clicar em buscar; garantir que a seção "Sobre" e os cards desapareçam dos resultados.
6. Limpar a busca clicando no botão "X" ou limpando o input; garantir que a seção "Sobre" retorne ao seu local original.

### Testes Automatizados
- Executar os testes do frontend usando Vitest para garantir que nenhuma regressão foi introduzida:
  ```bash
  cd frontend
  npm run test
  ```
