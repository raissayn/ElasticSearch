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

### 2️⃣ Rodando o Frontend (Vite + React)

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
