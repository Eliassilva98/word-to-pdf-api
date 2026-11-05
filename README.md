# Word to PDF API

API REST para conversão de documentos Word (.doc/.docx) em PDF, construída com Node.js, Express, Prisma e PostgreSQL (Neon).

---

## Sobre o projeto

Esta API recebe arquivos Word enviados pelo frontend, converte para PDF utilizando o LibreOffice como motor de conversão, armazena o arquivo convertido e registra a operação no banco de dados. O PDF gerado fica disponível para download através de um link público.

---

## Funcionalidades

- **Conversão de documentos** — recebe arquivos `.doc` e `.docx` e converte para PDF mantendo o nome original
- **Upload com validação** — aceita apenas formatos permitidos (.doc/.docx) e gera nomes únicos para evitar conflitos
- **Histórico de conversões** — consulta das últimas 50 conversões realizadas, ordenadas da mais recente para a mais antiga
- **Download de arquivos** — acesso direto aos PDFs convertidos via rota estática
- **Health check** — endpoint para verificar se o servidor está online
- **Registro em banco de dados** — cada conversão é salva no PostgreSQL (Neon) com nome original, nome do PDF, link de download e data
- **CORS configurado** — libera requisições apenas de origens autorizadas (frontend em produção e localhost para desenvolvimento)
- **Deploy containerizado** — Dockerfile com Node.js 20 (Debian 12 Bookworm) e LibreOffice instalado, pronto para deploy no Railway

---

## Regras de negócio

- **Validação de formato:** apenas arquivos .doc e .docx são aceitos. Qualquer outro formato é rejeitado antes do processamento
- **Nomes únicos no upload:** cada arquivo recebe um identificador único (timestamp + número aleatório) para evitar sobrescrita
- **Preservação do nome original:** o PDF gerado mantém o nome do arquivo original (ex: relatorio.docx → relatorio.pdf)
- **Criação automática de diretório:** a pasta de uploads é criada automaticamente se não existir
- **Registro obrigatório:** toda conversão bem-sucedida é registrada no PostgreSQL com nome original, nome do PDF, link de download e data
- **Histórico limitado:** as últimas 50 conversões são retornadas, ordenadas da mais recente para a mais antiga
- **Link de download dinâmico:** a URL é gerada com o domínio do servidor no momento da conversão
- **CORS restrito:** apenas origens autorizadas (frontend em produção e localhost) podem consumir a API

---

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Verifica se o servidor está online |
| `POST` | `/api/convert` | Envia um arquivo .doc/.docx para conversão |
| `GET` | `/api/history` | Retorna as últimas 50 conversões |
| `GET` | `/uploads/:arquivo.pdf` | Download do PDF convertido |

---

## Tecnologias

**Linguagem:** JavaScript  
**Runtime:** Node.js 20  
**Framework:** Express  
**ORM:** Prisma  
**Banco de dados:** PostgreSQL (Neon)  
**Upload:** Multer  
**Conversão:** LibreOffice  
**Gerenciador de pacotes:** Yarn  
**Containerização:** Docker  
**Deploy:** Railway  

---

## Como executar

### Pré-requisitos

- Node.js 20+
- Yarn
- LibreOffice instalado na máquina
- Um banco PostgreSQL (ex: projeto gratuito no [Neon](https://neon.tech))

### Passo a passo

```bash
# Clone o repositório
git clone https://github.com/Eliassilva98/word-to-pdf-api.git
cd word-to-pdf-api

# Instale as dependências
yarn

# Configure as variáveis de ambiente
# Copie .env.example para .env e preencha com suas credenciais

# Crie as tabelas no banco e gere o Prisma Client
npx prisma db push

# Execute em desenvolvimento
yarn dev
```

### Variáveis de ambiente

```env
PORT=5000
DATABASE_URL="postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require"
SOFFICE_PATH=caminho_do_libreoffice   # opcional, ex: C:\Program Files\LibreOffice\program\soffice.exe
```

A `DATABASE_URL` é a connection string do Neon (botão **Connect** no painel do projeto). Mantenha o `?sslmode=require` no final.

---

## Deploy (Railway)

O projeto é publicado via Docker. A cada push na branch `master`, o Railway constrói a imagem a partir do `Dockerfile`, que:

1. Usa a imagem `node:20-bookworm` e instala o LibreOffice
2. Instala as dependências com `yarn install --frozen-lockfile`
3. Gera o Prisma Client (`npx prisma generate`)
4. Ao iniciar, sincroniza as tabelas (`npx prisma db push`) e sobe o servidor (`yarn start`)

Configure a variável `DATABASE_URL` com a connection string do Neon no painel **Variables** do serviço.

---

## Estrutura do projeto

```
├── prisma/
│   └── schema.prisma          # Modelo Conversion (PostgreSQL)
├── src/
│   ├── config/
│   │   ├── prisma.js          # Instância do Prisma Client
│   │   └── upload.js          # Configuração do Multer
│   ├── controllers/
│   │   └── convertController.js   # Lógica de conversão e histórico
│   ├── routes/
│   │   └── convert.js         # Definição das rotas da API
│   └── server.js              # Ponto de entrada do servidor
├── Dockerfile
└── package.json
```

---

## O que este projeto demonstra

- API REST com Node.js + Express para conversão de documentos
- Upload e validação de arquivos com Multer
- Processamento assíncrono com conversão via LibreOffice
- Persistência de dados com Prisma ORM + PostgreSQL (Neon)
- Migração de banco de dados (MongoDB → PostgreSQL) mantendo a API funcionando
- Arquitetura organizada por camadas (config, controllers, routes)
- Containerização com Docker e deploy contínuo no Railway
- Proteção de rotas com CORS configurado para origens específicas

---

## Melhorias futuras

- Adicionar autenticação JWT para proteger as rotas
- Implementar testes automatizados (unitários e integração)
- Criar documentação da API com Swagger
- Melhorar tratamento de erros com middleware global
- Adicionar paginação no histórico de conversões
- Implementar limpeza automática de arquivos antigos
- Adicionar rate limiting para proteção contra abusos
