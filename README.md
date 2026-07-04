# 🔍 UniSearch — Busca Inteligente de Documentos Universitários

> Encontre ementas, regulamentos e informações do corpo docente da UNIFAL em segundos. Uma ferramenta de busca semântica e estruturada de alta performance baseada em Elasticsearch.

---

## 🌟 O que é o UniSearch?

O **UniSearch** é uma plataforma moderna desenvolvida para simplificar a vida acadêmica de estudantes e professores do curso de Ciência da Computação da **UNIFAL**. 

Se você já passou horas procurando por uma resolução de estágio específica, tentando descobrir o pré-requisito de uma disciplina nas grades antigas ou procurando a área de atuação de um professor, o UniSearch é a solução. Ele indexa e processa documentos universitários complexos (como PDFs de regulamentos, planos pedagógicos e ementas) e os torna instantaneamente buscáveis por relevância.

---

## ✨ Recursos Principais

*   **Filtros Inteligentes**: Segmente sua busca por **Disciplinas**, **Regulamentos** ou **Corpo Docente** em uma única interface.
*   **Resultados por Relevância**: Encontra correspondências exatas ou trechos aproximados de textos longos dentro de documentos PDF.
*   **Design Premium & Responsivo**: Interface limpa, minimalista, moderna e adaptada para dispositivos móveis com a identidade visual da instituição.
*   **Paginação e Ordenação**: Navegue facilmente pelos resultados e ordene por relevância ou data de indexação.

---

## 🛠️ Stack Tecnológica

O projeto foi construído utilizando tecnologias modernas e de alta performance no mercado:

*   **Frontend**: React (V19), Vite, TailwindCSS (design moderno, rápido e responsivo).
*   **Backend API**: FastAPI (Python 3) — leve, extremamente rápido e com documentação automática via OpenAPI (Swagger).
*   **Motor de Busca**: Elasticsearch (V8) — o mecanismo de busca distribuído mais popular do mundo.
*   **Painel de Monitoramento**: Kibana (V8) — para visualização de dados e análise de buscas.
*   **Processamento de Arquivos**: Ingestão otimizada de PDFs utilizando bibliotecas Python de processamento de texto.
*   **Infraestrutura**: Docker & Docker Compose para orquestração fácil de ambientes.

---

## 🚀 Como Executar o Projeto Localmente

Subir o UniSearch na sua máquina é muito simples. Siga o passo a passo abaixo:

### 📋 Pré-requisitos
Antes de começar, certifique-se de ter instalado:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (com o Docker Compose ativo)
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)

---

### 1️⃣ Subindo o Backend & Elasticsearch (Docker)

1. Abra o **Docker Desktop** na sua máquina para garantir que o serviço de contêineres está rodando.
2. No seu terminal, acesse a pasta raiz do projeto e execute:
   ```bash
   docker compose up -d
   ```
   *Este comando irá baixar e configurar o Elasticsearch, o Kibana e a API FastAPI automaticamente em segundo plano.*

3. Verifique se a API está ativa acessando a documentação interativa:
   👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

### 2️⃣ Ingestão de Documentos (Indexando no Elasticsearch)

Para que a busca semântica funcione, os documentos PDF localizados na pasta [backend/app/data/pdfs](file:///C:/Users/vinic/code/codeW/UniSearch/ElasticSearch/backend/app/data/pdfs) precisam ser processados e indexados no Elasticsearch. O processo usa um **manifest** (`backend/data/documents_manifest.example.json`) que mapeia cada PDF ao seu `source_id`, título e URL pública oficial (ex.: do portal da UNIFAL), garantindo que os links "Ver documento" apontem para o local correto.

> [!IMPORTANT]
> Sempre crie o índice **antes** da primeira ingestão. Isso aplica o mapping correto (ex.: `source_id` como `keyword`) e impede que o Elasticsearch crie o índice automaticamente com dynamic mapping, o que quebraria ordenação, agregações e collapse.

#### Opção A: Pelo Docker (Mais fácil)
Com os contêineres rodando, execute na **raiz** do projeto:

1. Crie o índice (apenas na primeira vez, ou após `--recreate`):
   ```bash
   docker compose exec api python scripts/create_unisearch_index.py
   ```
2. Ingeste os documentos usando o manifest:
   ```bash
   docker compose exec api python scripts/ingest_pdfs.py --manifest data/documents_manifest.example.json
   ```

> [!NOTE]
> Se você adicionar ou atualizar arquivos PDF no seu computador local, precisará reconstruir a imagem do container (`docker compose build api`) antes de executar o script acima para atualizar o conteúdo interno.

<details>
<summary>Recriar o índice do zero (opcional)</summary>

Se o índice foi criado com mapping errado ou você quer limpar documentos antigos, recrie e reingeste:
```bash
docker compose exec api python scripts/create_unisearch_index.py --recreate
docker compose exec api python scripts/ingest_pdfs.py --manifest data/documents_manifest.example.json
```
</details>

#### Opção B: Localmente (Recomendado para desenvolvimento ativo)
1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```
2. Ative o ambiente virtual (venv):
   *   **Windows (PowerShell):**
       ```powershell
       .\venv\Scripts\Activate.ps1
       ```
   *   **Linux / macOS:**
       ```bash
       source venv/bin/activate
       ```
3. Garanta que as dependências do Python estejam instaladas:
   ```bash
   pip install -r requirements.txt
   ```
4. Crie o índice (apenas na primeira vez, ou após `--recreate`):
   ```bash
   python scripts/create_unisearch_index.py
   ```
5. Ingeste os documentos usando o manifest:
   ```bash
   python scripts/ingest_pdfs.py --manifest data/documents_manifest.example.json
   ```

---

### 3️⃣ Rodando o Frontend (Vite + React)

1. No terminal, acesse a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências necessárias:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Agora é só abrir a aplicação no seu navegador:
   👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## 📂 Estrutura do Projeto

*   `/backend`: API FastAPI, lógica de ingestão de PDFs e configuração do cliente Elasticsearch.
*   `/frontend`: Interface do usuário construída com React, Vite e TailwindCSS.

---

## 🤝 Contribuição

Gostou do projeto ou quer adicionar novos documentos à base? Fique à vontade para abrir uma issue ou enviar um pull request!
