# UniSearch Frontend Design Spec

## Visão Geral
Este documento descreve a arquitetura e o design da interface frontend para o projeto UniSearch, um buscador acadêmico integrado ao Elasticsearch. O objetivo é desenvolver uma aplicação concisa, organizada e fácil de manter, adotando práticas de desenvolvimento modernas focadas na clareza para facilitar o entendimento (estilo "descomplicado").

## Stack Tecnológica
- **Framework/Build Tool:** Vite com React
- **Estilização:** Tailwind CSS (fiel ao protótipo fornecido)
- **Roteamento:** React Router DOM v6+
- **Gerenciamento de Estado:** Context API (nativo do React)

## Estrutura do Projeto
A estrutura de pastas foi pensada de forma simples e modular:

```text
src/
├── components/       # Componentes visuais isolados
│   ├── TopNavBar.jsx
│   ├── SideNavBar.jsx
│   ├── Footer.jsx
│   └── ResultCard.jsx
├── pages/            # Páginas mapeadas nas rotas
│   ├── HomePage.jsx
│   └── ResultsPage.jsx
├── contexts/         # Estado Global (Context API)
│   └── SearchContext.jsx
├── App.jsx           # Declaração das rotas e wrap dos Providers
└── main.jsx          # Ponto de montagem da aplicação
```

## Componentes Principais
1. **TopNavBar**: Barra de navegação superior. Renderiza de forma transparente na `HomePage` e com fundo semi-transparente fixo na `ResultsPage`.
2. **SideNavBar**: Barra lateral para filtros e opções (Histórico, Documentos Salvos). Será usada principalmente na `ResultsPage`.
3. **Footer**: Rodapé com informações institucionais.
4. **ResultCard**: Componente reutilizável para apresentar cada resultado da busca vindo do Elasticsearch.
5. **HomePage**: Página inicial contendo apenas a grande barra de pesquisa centralizada e atalhos de navegação.
6. **ResultsPage**: Tela que mostra os resultados da busca com a `SideNavBar` e a barra de pesquisa reduzida na `TopNavBar` ou topo da página.

## Fluxo de Dados e Estado Global
- O estado da barra de busca (termo pesquisado) será armazenado em um contexto centralizado (`SearchContext`).
- Quando o usuário digitar algo na `HomePage` e enviar o formulário, a aplicação atualizará o contexto com o termo de busca e navegará para a rota `/results`.
- Na rota `/results`, a página observará o termo no contexto e (no futuro) fará as requisições à API do Elasticsearch, atualizando a listagem renderizando vários componentes `ResultCard`.

## Diretrizes de Estilo
- Usar a configuração de tema estendida do Tailwind CSS definida no protótipo (cores: `primary: '#ec5b13'`, `surface: '#111827'`, etc.).
- A fonte padrão é `Public Sans`.
- Utilizar efeitos estilo Glassmorphism (blur e fundos semi-transparentes) descritos nas classes customizadas (`glass-container`, `glass-card-h`, `glass-card-r`) transferindo esses estilos nativamente para classes utilitárias Tailwind sempre que possível, ou usando um arquivo `index.css` conciso.

## Tratamento de Erros e Limites
- Se a busca não retornar resultados, a `ResultsPage` exibirá uma mensagem amigável "Nenhum documento encontrado para a pesquisa".
- Se houver falha de rede ou timeout (ao conectar ao backend em Python), um alerta visual leve deve comunicar que o Elasticsearch está indisponível.

## Testes (Test-Driven Development)
- Utilização de Vitest + React Testing Library.
- Todo novo componente lógico ou regra de negócio (como o envio do formulário de busca ou o gerenciamento de estado no Context) deverá ser precedido por testes (Red -> Green -> Refactor).
