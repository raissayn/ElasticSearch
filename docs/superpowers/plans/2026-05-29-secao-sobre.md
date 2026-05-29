# Seção "Sobre" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a responsive, storytelling-oriented "Sobre" section below the home page category cards that disappears when the user performs a search.

**Architecture:** Integrate the new section into `HomePage.jsx` under the `!hasSearched` condition. The section features responsive layout grids, Tailwind animations, and interactive CTA button utilizing React refs to scroll and focus the search input.

**Tech Stack:** React 19, TailwindCSS, Vitest & React Testing Library.

---

### Task 1: Write failing tests in HomePage.test.jsx

**Files:**
- Modify: `frontend/src/pages/HomePage.test.jsx`

- [ ] **Step 1: Write the failing tests**

Modify `frontend/src/pages/HomePage.test.jsx` to append the two new tests checking for the visibility of the "Sobre" section and the CTA behavior.

Target Content (around line 170-174):
```javascript
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=1');
    expect(lastCall).toContain('tipo=secao_texto');
  });
});
```

Replacement Content:
```javascript
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0];
    expect(lastCall).toContain('page=1');
    expect(lastCall).toContain('tipo=secao_texto');
  });
});

test('HomePage renders "Sobre" section and hides it during search', async () => {
  const user = userEvent.setup();
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => mockResponse(),
  });
  vi.stubGlobal('fetch', fetchMock);

  renderHome();

  // "Sobre" section headers should be present initially
  expect(screen.getByRole('heading', { name: /Conheça o UniSearch/i })).toBeDefined();
  expect(screen.getByText(/Como Surgiu/i)).toBeDefined();
  expect(screen.getByText(/O que a Plataforma Faz/i)).toBeDefined();
  expect(screen.getByText(/Nosso Diferencial/i)).toBeDefined();

  // Search for something to transition hasSearched to true
  const input = screen.getByPlaceholderText(/Busque por/i);
  await user.type(input, 'calculo');
  await user.click(screen.getByRole('button', { name: 'Buscar' }));

  // Wait for results to be shown and verify "Sobre" section is hidden
  await screen.findByText(/resultados encontrados/i);
  expect(screen.queryByRole('heading', { name: /Conheça o UniSearch/i })).toBeNull();
});

test('HomePage scrolls and focuses search input when clicking "Ir para o buscador"', async () => {
  const user = userEvent.setup();
  // Mock window.scrollTo
  const scrollToMock = vi.fn();
  vi.stubGlobal('scrollTo', scrollToMock);

  renderHome();

  const ctaButton = screen.getByRole('button', { name: /Ir para o buscador/i });
  await user.click(ctaButton);

  expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  const input = screen.getByPlaceholderText(/Busque por/i);
  expect(document.activeElement).toBe(input);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run command: `npm run test -- --run` in `frontend` directory.

Expected: FAIL on the two new tests because the "Sobre" section and CTA button are not yet implemented.

- [ ] **Step 3: Commit the test changes**

Run command:
```bash
git add frontend/src/pages/HomePage.test.jsx
git commit -m "test: add tests for the new About section"
```

---

### Task 2: Implement "Sobre" section in HomePage.jsx

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

- [ ] **Step 1: Implement "Sobre" section in the template**

Modify `frontend/src/pages/HomePage.jsx` to wrap the home page cards in a React Fragment and add the "Sobre" section directly below the category grid.

Target Content (around line 230-271):
```javascript
        {/* Dynamic Content: Cards OR Results */}
        {!hasSearched ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-12">
            <div 
              onClick={() => {
                setCategory("Disciplinas");
                searchInputRef.current?.focus();
              }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
            >
              <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary text-2xl">layers</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Disciplinas</h3>
              <p className="text-gray-600 text-base leading-relaxed">Acesse ementas, cargas horárias, pré-requisitos e planos de ensino com facilidade.</p>
            </div>
            <div 
              onClick={() => {
                setCategory("Professores");
                searchInputRef.current?.focus();
              }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
            >
              <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary text-2xl">school</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Corpo Docente</h3>
              <p className="text-gray-600 text-base leading-relaxed">Consulte os professores do curso, suas titulações e áreas de atuação.</p>
            </div>
            <div 
              onClick={() => {
                setCategory("Regulamentos");
                searchInputRef.current?.focus();
              }}
              className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
            >
              <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Regulamentos</h3>
              <p className="text-gray-600 text-base leading-relaxed">Encontre normas de TCC, resoluções de estágio e regimentos internos em um só lugar.</p>
            </div>
          </div>
        ) : (
```

Replacement Content:
```javascript
        {/* Dynamic Content: Cards OR Results */}
        {!hasSearched ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-12">
              <div 
                onClick={() => {
                  setCategory("Disciplinas");
                  searchInputRef.current?.focus();
                }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-2xl">layers</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Disciplinas</h3>
                <p className="text-gray-600 text-base leading-relaxed">Acesse ementas, cargas horárias, pré-requisitos e planos de ensino com facilidade.</p>
              </div>
              <div 
                onClick={() => {
                  setCategory("Professores");
                  searchInputRef.current?.focus();
                }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-2xl">school</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Corpo Docente</h3>
                <p className="text-gray-600 text-base leading-relaxed">Consulte os professores do curso, suas titulações e áreas de atuação.</p>
              </div>
              <div 
                onClick={() => {
                  setCategory("Regulamentos");
                  searchInputRef.current?.focus();
                }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Regulamentos</h3>
                <p className="text-gray-600 text-base leading-relaxed">Encontre normas de TCC, resoluções de estágio e regimentos internos em um só lugar.</p>
              </div>
            </div>

            {/* Seção Sobre */}
            <section className="mt-32 max-w-5xl mx-auto space-y-24 px-4 md:px-6">
              {/* Cabeçalho da Seção */}
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                  Conheça o UniSearch
                </h2>
                <p className="text-gray-500 font-medium text-lg md:text-xl">
                  Uma plataforma feita de discentes para discentes.
                </p>
              </div>

              {/* Bloco 1: Como Surgiu */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-unifal-bg text-primary rounded-2xl">
                    <span className="material-symbols-outlined text-2xl font-bold">lightbulb</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-950">Como Surgiu 💡</h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Encontrar informações precisas dentro dos portais da universidade sempre foi um desafio para os estudantes. Horas gastas procurando por uma resolução de estágio específica, tentando descobrir o pré-requisito de uma disciplina ou buscando a área de atuação de um professor geravam frustração. O <strong>UniSearch</strong> surgiu justamente para resolver essa dor. Desenvolvida nesta primeira etapa para o curso de <strong>Ciência da Computação da UNIFAL-MG</strong>, a plataforma centraliza e simplifica o acesso à informação.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg rounded-3xl overflow-hidden border border-blue-100 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-secondary opacity-20 blur-xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary opacity-10 blur-2xl"></div>
                    <div className="relative space-y-3 w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="h-4 w-1/3 bg-primary rounded opacity-25"></div>
                      <div className="h-3 w-full bg-gray-200 rounded"></div>
                      <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                      <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
                      <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                        <span className="text-xs text-primary font-bold">UNIFAL-MG</span>
                        <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 2: O que Faz */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-unifal-bg text-primary rounded-2xl">
                    <span className="material-symbols-outlined text-2xl font-bold">search</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-950">O que a Plataforma Faz 🔍</h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Nós indexamos e processamos documentos universitários complexos (como PDFs de regulamentos, planos pedagógicos de disciplinas e regimentos internos) e os tornamos instantaneamente buscáveis por relevância. Em segundos, você encontra o que precisa sem precisar ler dezenas de páginas.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg rounded-3xl overflow-hidden border border-blue-100 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-primary opacity-20 blur-xl"></div>
                    <div className="relative w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transform rotate-2 hover:rotate-0 transition-transform duration-300 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 bg-unifal-bg text-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">search_insights</span>
                      </div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                      <div className="text-xs font-semibold text-secondary">Busca Semântica Rápida</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Diferencial */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-unifal-bg text-primary rounded-2xl">
                    <span className="material-symbols-outlined text-2xl font-bold">auto_awesome</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-950">Nosso Diferencial ✨</h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Diferente de uma busca comum, o UniSearch utiliza <strong>busca inteligente baseada em Elasticsearch</strong>, oferecendo filtros específicos para <em>Disciplinas</em>, <em>Regulamentos</em> e <em>Corpo Docente</em> em uma interface moderna, rápida e totalmente adaptada para computadores e celulares.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg rounded-3xl overflow-hidden border border-blue-100 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute -top-8 right-0 w-24 h-24 rounded-full bg-secondary opacity-25 blur-2xl"></div>
                    <div className="relative w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transform -rotate-1 hover:rotate-0 transition-transform duration-300 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-bold text-gray-700">Velocidade de Resposta</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">0.03s</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-xs bg-unifal-bg text-primary px-2.5 py-1 rounded-full font-semibold">Elasticsearch v8</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">Busca Semântica</span>
                        <span className="text-xs bg-blue-50 text-secondary px-2.5 py-1 rounded-full font-semibold">Filtros Avançados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA final */}
              <div className="text-center pt-8">
                <div className="inline-block p-8 bg-white border border-gray-200 rounded-3xl shadow-sm max-w-2xl">
                  <p className="text-lg md:text-xl font-medium text-gray-800 mb-5">
                    🚀 Pronto para facilitar sua rotina acadêmica?
                  </p>
                  <button 
                    onClick={() => {
                      searchInputRef.current?.focus();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-primary-dim transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Ir para o buscador
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : (
```

- [ ] **Step 2: Run tests to verify they pass**

Run command: `npm run test -- --run` in `frontend` directory.

Expected: PASS on all tests, including the two new tests.

- [ ] **Step 3: Commit the implementation**

Run command:
```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: implement About section in HomePage"
```
