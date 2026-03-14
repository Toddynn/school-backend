# School project - Backend

API REST desenvolvida como de gerenciamento de cursos, turmas, matrículas e usuários.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Executando o Projeto](#executando-o-projeto)
- [Documentação da API](#documentação-da-api)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Regras de Negócio](#regras-de-negócio)

## Sobre o Projeto

Este projeto é uma API para gerenciamento de uma plataforma educacional, permitindo:

- **Usuários**: Cadastro e gerenciamento de usuários
- **Cursos**: Criação de cursos com temas específicos (inovação, tecnologia, marketing, empreendedorismo, agro)
- **Turmas**: Gerenciamento de turmas vinculadas aos cursos, com controle de vagas, datas e status
- **Matrículas**: Sistema de matrículas com validações de regras de negócio

## Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 22+ | Runtime JavaScript |
| **NestJS** | 11.x | Framework Node.js |
| **TypeScript** | 5.7+ | Linguagem de programação |
| **TypeORM** | 0.3.x | ORM para banco de dados |
| **PostgreSQL** | 18 | Banco de dados relacional |
| **Jest** | 30.x | Framework de testes |
| **Swagger/OpenAPI** | - | Documentação da API |
| **Scalar** | - | Interface alternativa para documentação |
| **Zod** | 4.x | Validação de schemas |
| **Biome** | 2.x | Linter e formatter |

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (v22 ou superior)
- [pnpm](https://pnpm.io/) (gerenciador de pacotes)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (opcional, para rodar o banco de dados)
- [PostgreSQL](https://www.postgresql.org/) 18+ (se não usar Docker)

## Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/Toddynn/school-backend.git
cd school-backend
```

2. **Instale as dependências**

```bash
pnpm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .sample.env .env
```

Edite o arquivo `.env` conforme necessário.

## Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `APP_NAME` | Nome da aplicação | `dot-grp-backend-challenge` |
| `APP_PROTOCOL` | Protocolo da API | `http` |
| `APP_DOMAIN` | Domínio da API | `localhost` |
| `APP_PORT` | Porta da API | `3000` |
| `FRONT_END_PROTOCOL` | Protocolo do frontend (CORS) | `http` |
| `FRONT_END_DOMAIN` | Domínio do frontend (CORS) | `localhost` |
| `FRONT_END_PORT` | Porta do frontend (CORS) | `5173` |
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_USER` | Usuário do PostgreSQL | `pguser` |
| `DB_PASSWORD` | Senha do PostgreSQL | `pgpassword` |
| `DB_DATABASE` | Nome do banco de dados | `postgres` |
| `DB_SCHEMA` | Schema do banco | `public` |
| `DB_SYNC` | Sincronização automática do TypeORM | `true` |

## Executando o Projeto

### Com Docker (Recomendado)

O projeto inclui um `docker-compose.yaml` que configura:
- **PostgreSQL 18 Alpine**: Banco de dados
- **pgAdmin**: Interface web para gerenciar o PostgreSQL (porta 8085)
- **App**: Aplicação NestJS em modo desenvolvimento

#### Opção 1: Tudo com Docker

```bash
# Subir todos os containers (banco + pgAdmin + aplicação)
docker compose up --build -d

# Ver logs da aplicação
docker compose logs -f app
```

#### Opção 2: Apenas banco de dados com Docker

```bash
# Subir apenas banco de dados e pgAdmin
docker compose up --build -d pgsql pgadmin

# Executar a aplicação localmente
pnpm run start:dev
```

> **Importante:** Ao rodar a aplicação localmente, configure `DB_HOST=localhost (ou o seu ip)` no `.env`. Ao rodar com Docker, configure `DB_HOST=pgsql (nome do container)`.

> **Observação** Ao rodar a aplicação com Docker, o NODE_ENV está marcado como development apenas para disponibilizar a documentação

**Acesso ao pgAdmin:**
- URL: http://localhost:8085
- Email: `admin@teste.com`
- Senha: `Admin123`

**Acesso à Aplicação:**
- URL: http://localhost:3000

### Sem Docker

1. Certifique-se de ter o PostgreSQL 18+ instalado e rodando
2. Crie o banco de dados e configure as credenciais no `.env`
3. Execute:

```bash
pnpm run start:dev
```

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm run start` | Inicia a aplicação |
| `pnpm run start:dev` | Inicia em modo de desenvolvimento (hot reload) |
| `pnpm run start:debug` | Inicia em modo debug |
| `pnpm run start:prod` | Inicia em modo produção |
| `pnpm run build` | Compila o projeto |
| `pnpm run test` | Executa os testes unitários |
| `pnpm run test:watch` | Executa testes em modo watch |
| `pnpm run test:cov` | Executa testes com cobertura |
| `pnpm run test:e2e` | Executa testes end-to-end |
| `pnpm run biome:check` | Verifica lint e formatação |

## Documentação da API

Após iniciar a aplicação, a documentação interativa estará disponível em:

| Interface | URL | Descrição |
|-----------|-----|-----------|
| **Swagger UI** | http://localhost:3000/api/swagger/reference | Interface clássica do Swagger |
| **Scalar** | http://localhost:3000/api/scalar/reference | Interface moderna e interativa |

> **Nota:** A documentação só está disponível em ambientes de desenvolvimento (`NODE_ENV !== 'production'`).

### Endpoints Principais

| Módulo | Base Path | Descrição |
|--------|-----------|-----------|
| Usuários | `/users` | CRUD de usuários |
| Cursos | `/courses` | CRUD de cursos |
| Turmas | `/classes` | CRUD de turmas |
| Matrículas | `/enrollments` | Gestão de matrículas |

## Testes

O projeto possui uma suíte completa de testes unitários cobrindo todas as regras de negócio.

```bash
# Executar todos os testes
pnpm run test

# Executar com cobertura
pnpm run test:cov

# Executar testes de um módulo específico
pnpm run test -- --testPathPatterns="modules/enrollments"
```

### Cobertura de Testes

Os testes cobrem:
- **Repositórios**: Queries, filtros, paginação
- **Use Cases**: Todas as regras de negócio
- **Erros**: Validação de exceções customizadas

## Estrutura do Projeto

```
src/
├── configs/                    # Configurações (database, documentation)
├── modules/
│   ├── users/                  # Módulo de usuários
│   │   ├── models/             # Entidades, DTOs, interfaces
│   │   ├── repository/         # Repositório TypeORM
│   │   ├── use-cases/          # Casos de uso (CRUD)
│   │   ├── errors/             # Exceções customizadas
│   │   └── shared/             # Constantes, enums
│   ├── courses/                # Módulo de cursos
│   ├── classes/                # Módulo de turmas
│   └── enrollments/            # Módulo de matrículas
└── shared/                     # Código compartilhado
    ├── dto/                    # DTOs genéricos (paginação)
    ├── entities/               # Entidades base
    ├── helpers/                # Funções utilitárias
    └── pipes/                  # Pipes de validação
```

## Regras de Negócio

### Cursos
- Possuem título, descrição, URL e temas
- **Temas disponíveis**: inovação, tecnologia, marketing, empreendedorismo, agro
- Suportam filtros por título, descrição e temas

### Turmas
- Vinculadas a um curso
- Possuem título, vagas (spots), status, data de início e fim
- **Status**: `disponível` ou `encerrado`
- Suportam filtros por curso, status e datas

### Matrículas (Regras Críticas)

| Regra | Descrição | Exceção |
|-------|-----------|---------|
| **Status** | Só é possível matricular-se em turmas com status `disponível` | `CourseClassNotAvailableException` |
| **Data** | A data atual deve estar entre a data de início e fim da turma | `CourseClassOutOfRangeException` |
| **Vagas** | A turma deve ter vagas disponíveis (spots > 0) | `CourseClassFullException` |
| **Anti-duplicidade** | Um usuário não pode ter duas matrículas no mesmo curso | `UserAlreadyEnrolledInCourseException` |
| **Unicidade** | Um usuário não pode se matricular duas vezes na mesma turma | `EnrollmentAlreadyExistsException` |

### Gestão de Vagas
- Ao criar uma matrícula, os spots da turma são **decrementados**
- Ao deletar uma matrícula, os spots da turma são **incrementados**
