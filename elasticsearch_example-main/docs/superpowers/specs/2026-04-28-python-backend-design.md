# Design: Conversao do Backend Java para Python

## Objetivo

Criar uma nova pasta no repositorio com uma versao Python do backend atual, mantendo o backend Java original intacto. A versao Python deve preservar o comportamento principal da API existente para facilitar comparacao e estudo.

## Escopo

O trabalho cobre:

- Criacao de uma nova pasta para o backend Python
- Migracao da API `GET /v1/search`
- Preservacao dos parametros `query` e `page`
- Preservacao do formato de resposta com os campos `title`, `url` e `abs`
- Preservacao da logica de paginacao e limpeza de texto
- Criacao de documentacao em HTML explicando a estrutura e o fluxo do backend Python

O trabalho nao cobre:

- Remocao do backend Java existente
- Mudancas de contrato da API
- Refatoracoes amplas no comportamento de busca
- Automatizacao avancada de geracao a partir do OpenAPI

## Contexto Atual

O backend Java atual usa Spring Boot e possui uma estrutura simples em camadas:

- `SearchController` expoe o endpoint HTTP
- `SearchService` trata a resposta do Elasticsearch
- `EsClient` abre a conexao e executa a busca

O endpoint atual:

- rota: `GET /v1/search`
- parametros: `query` e `page`
- indice consultado: `wikipedia`
- campo pesquisado: `content`
- tamanho de pagina: `10`

## Abordagem Escolhida

A implementacao sera feita com FastAPI em camadas, espelhando a organizacao logica do projeto Java. Essa abordagem foi escolhida porque:

- facilita comparacao direta entre Java e Python
- preserva uma arquitetura clara para estudo
- oferece tipagem e documentacao automatica
- mantem o contrato HTTP simples e previsivel

## Estrutura Proposta

O backend Python sera criado em uma nova pasta dedicada. Estrutura proposta:

```text
python_backend/
  app/
    main.py
    controllers/
      search_controller.py
    services/
      search_service.py
    domain/
      es_client.py
    schemas/
      result.py
    core/
      config.py
  requirements.txt
  README.md
```

## Arquitetura

### 1. Inicializacao da aplicacao

`app/main.py` sera o ponto de entrada da API FastAPI. Ele criara a aplicacao, definira metadados basicos e registrara o roteador de busca com prefixo `/v1`.

### 2. Camada de controller

`app/controllers/search_controller.py` definira a rota `GET /search`. Essa camada:

- recebe `query` e `page`
- valida entradas basicas pela tipagem do FastAPI
- chama a camada de servico
- devolve a lista de resultados

### 3. Camada de service

`app/services/search_service.py` contera a regra de negocio. Essa camada:

- chama o cliente Elasticsearch
- extrai os documentos retornados
- monta a resposta final
- limpa o campo `content` para gerar `abs`

A limpeza seguira a mesma ideia do Java:

- remover tags como `som` e `math`
- remover caracteres especiais
- normalizar espacos
- remover espacos iniciais

### 4. Camada de dominio

`app/domain/es_client.py` sera responsavel pela conexao com o Elasticsearch e pela operacao de busca. Essa camada:

- cria o cliente Python do Elasticsearch
- usa host local com autenticacao
- faz a busca no indice `wikipedia`
- aplica a paginacao com base em `page`

### 5. Modelos de resposta

`app/schemas/result.py` definira um modelo Pydantic com os campos:

- `title: str`
- `url: str`
- `abs: str`

## Fluxo da Requisicao

1. O cliente chama `GET /v1/search?query=...&page=...`
2. O controller recebe os parametros
3. O service chama o cliente Elasticsearch
4. O cliente executa a busca no indice `wikipedia`
5. O service transforma os hits em objetos de resposta
6. A API retorna uma lista JSON com `title`, `url` e `abs`

## Configuracao

Para manter o projeto simples e didatico, a configuracao inicial sera local e explicita. O backend Python usara:

- host: `https://localhost:9200`
- usuario: `elastic`
- senha: `user123`
- indice: `wikipedia`
- campo de busca: `content`

Se necessario, essa configuracao pode ser centralizada em `core/config.py`.

## Tratamento de Erros

O backend Python deve tratar pelo menos estes cenarios:

- falha de conexao com o Elasticsearch
- resposta inesperada do Elasticsearch
- parametros invalidos como pagina menor que 1

Na primeira versao, o tratamento sera simples e didatico, priorizando clareza do fluxo em vez de uma camada complexa de excecoes.

## Testes

Como base inicial para estudo, o foco sera primeiro em uma versao executavel e clara. Se houver tempo na etapa seguinte, testes podem ser adicionados para:

- validacao do tratamento de texto
- validacao da transformacao de hits em resposta
- comportamento do endpoint com parametros basicos

## Documentacao HTML

Sera criado um arquivo HTML explicativo com foco didatico. Esse arquivo deve mostrar:

- objetivo da migracao
- comparacao entre a estrutura Java e Python
- papel de cada pasta e arquivo
- fluxo completo da requisicao
- explicacao da conexao com o Elasticsearch
- explicacao da limpeza do campo `content`
- instrucoes de execucao

## Decisoes e Trade-offs

- FastAPI foi escolhido no lugar de Flask para manter tipagem e documentacao automatica
- a estrutura em camadas foi mantida para facilitar o estudo comparativo com Java
- a especificacao OpenAPI existente sera preservada como referencia, mas nao sera a fonte de geracao automatica nesta etapa
- o backend Java sera mantido para permitir comparacao lado a lado

## Resultado Esperado

Ao final desta etapa, o repositorio tera:

- o backend Java original intacto
- uma nova pasta com backend Python funcional
- uma documentacao HTML explicando o que foi feito e por que foi feito

Isso deve permitir estudar a mesma ideia de backend em duas stacks diferentes antes de avancar para proximas etapas da disciplina.
