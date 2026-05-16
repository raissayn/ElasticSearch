# UniSearch Design System

## 1. Core Philosophy
O UniSearch foi desenhado para ser uma ferramenta de busca acadêmica simples, direta e intuitiva, inspirando-se na identidade visual e no prestígio da UNIFAL-MG. A experiência é construída em uma única tela ("Single Page Search"), permitindo ao usuário (discente, docente ou técnico) navegar rapidamente sem trocas desnecessárias de contexto.

## 2. Cores e Identidade Visual (UNIFAL-MG)
As cores refletem a paleta institucional, utilizando variações do Azul para denotar confiança, estabilidade e conhecimento:

- **Primary Dark Blue (`#07378d`)**: Cor de destaque primária para botões, tipografia de títulos principais, bordas e detalhes que necessitam de contraste forte.
- **Primary Dim (`#00318a`)**: Variante ligeiramente mais escura do primary, usada primariamente para efeitos de `:hover` em botões principais e elementos focais.
- **Secondary Light Blue (`#0fafee`)**: Um azul mais claro e moderno, usado para micro-interações, hover states e gradientes de fundo.
- **Secondary Dim (`#0d9bdb`)**: Variante escurecida do secondary.
- **Soft Background (`#eef7fc`)**: Utilizado em backgrounds e áreas com as quais o usuário interage frequentemente, criando áreas de "respiro" suaves, sem precisar do branco puro e mantendo as caixas legíveis.

## 3. Tipografia
O projeto utiliza uma hierarquia clara. As fontes devem ser limpas, sem serifa, para transmitir clareza tecnológica (ex. Public Sans/Inter/Roboto).
- **Hero Title**: Muito grande (ex. 72px) e "apertada" (tracking-tight) para impacto imediato (`<h1 className="text-4xl md:text-[72px] font-bold text-primary tracking-tight">`).
- **Body & Labels**: Tamanho e peso neutros para manter foco na legibilidade da busca.
- **Botões e Tags**: Maior ênfase na espessura da fonte (bold/medium) para indicar possibilidade de clique.

## 4. Componentes e Padrões

### 4.1 A Barra de Pesquisa Integrada (Omnibar)
- **Drop-down Embutido**: A pesquisa não requer múltiplos campos; utiliza uma barra robusta arredondada (`rounded-full`) que contém tanto o input de texto quanto um dropdown nativo customizado no final da barra, mantendo o aspecto clean.
- **Micro-interações**: Fechamento automático ao clicar fora e ícones `material-symbols-outlined` rotacionados garantem feedback visual claro (setinhas girando no dropdown).

### 4.2 Hero Section com Gradientes Suaves
A área de boas-vindas não utiliza imagens que pesem o site. Para compensar, são criados *blobs* circulares de gradientes sutis (`radial-gradient`), amarrados nos cantos (`rounded-3xl` ou `rounded-[2rem]`) em um container de fundo pastel (`bg-unifal-bg`), dando profundidade.

### 4.3 Padrão "Cards vs. Results"
O estado da aplicação transiciona o layout fluido:
1. **Empty State**: Exibe "Feature Cards" grandes (Ementas, Horários, Regulamentos) que orientam o usuário a pesquisar.
2. **Searched State**: Esses Feature Cards somem automaticamente (`!hasSearched ? ... : ...`), dando lugar a uma coluna centralizada e linear de resultados (Componente `<ResultCard />`). Isso torna obsoleto o roteamento pesado para outras páginas; a mudança ocorre instantaneamente na `HomePage.jsx`.

### 4.4 Result Card (Os Resultados)
- Caixas brancas limpas com bordas sutis. 
- Transição de borda e sombra (`hover:border-secondary hover:shadow-md transition-all`) orienta o clique do mouse e destaca o conteúdo ativo.
- Badges e informações secundárias (professores, horas, tipo de documento) são separadas por pipings visuais (`w-px h-4 bg-gray-300`) ou dispostas com ícones limpos em cores cinza médias para não ofuscarem o título azul forte.

## 5. Responsividade ("Mobile First")
A aplicação foi otimizada para ser manuseada por discentes via celular entre aulas:
- Fontes adaptativas (ex: de text-4xl para text-6xl no desktop).
- Os cards de Features empilham em 1 coluna no mobile (`grid-cols-1 md:grid-cols-3`).
- A Barra de Pesquisa flexiona seus elementos, sobrepondo o botão sob a barra principal quando falta largura.

## 6. Limpeza e Estrutura Arquitetural
Com o paradigma de Centralização de Busca, componentes legados foram eliminados:
- Sem `<SideNavBar>` (os filtros agora vivem dentro do Dropdown da omnibar).
- Sem `<ResultsPage>` e `<TopNavBar>` separados (rota unificada no `/`).
- Essa centralização diminui a dívida técnica, reduz pacotes de rotas complexas e aumenta drasticamente a velocidade de renderização da experiência para o estudante.
