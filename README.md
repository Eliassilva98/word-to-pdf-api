# Word to PDF API

API REST para conversão de documentos Word (.doc/.docx) em PDF, construída com Node.js, Express, Prisma e MongoDB.

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
- **Registro em banco de dados** — cada conversão é salva no MongoDB com nome original, nome do PDF, link de download e data
- **CORS configurado** — libera requisições apenas de origens autorizadas (frontend em produção e localhost para desenvolvimento)
- **Deploy containerizado** — Dockerfile com Node.js 18 e LibreOffice instalado, pronto para deploy no Railway

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
**Runtime:** Node.js  
**Framework:** Express  
**ORM:** Prisma  
**Banco de dados:** MongoDB Atlas  
**Upload:** Multer  
**Conversão:** LibreOffice  
**Containerização:** Docker  

---

## Como executar
```bash
# Clone o repositório
git clone https://github.com/Eliassilva98/word-to-pdf-api.git

# Instale as dependências
yarn

# Configure as variáveis de ambiente
# Renomeie .env.example para .env e preencha com suas credenciais

# Execute em desenvolvimento
yarn dev
````
Variáveis de ambiente
PORT=5000

DATABASE_URL=your_mongodb_connection_string_here

SOFFICE_PATH=your_libreoffice_path

CORS_ORIGIN=https://seu-frontend.vercel.app

Estrutura do projeto

src/

├── config/
│

├── prisma.js -> Conexão com MongoDB
│   
└── upload.js -> Configuração do Multer

├── controllers/
│   
└── convertController.js -> Lógica de conversão e histórico

├── routes/
│   
└── convert.js -> Definição das rotas da API

└── server.js -> Ponto de entrada do servidor

O que este projeto demonstra:

API REST com Node.js + Express para conversão de documentos

Upload e validação de arquivos com Multer

Processamento assíncrono com conversão via LibreOffice

Persistência de dados com Prisma ORM + MongoDB Atlas

Arquitetura organizada por camadas (config, controllers, routes)

Containerização com Docker para deploy em produção

Proteção de rotas com CORS configurado para origens específicas
<br>
<br>
<br>
Melhorias futuras:

Adicionar autenticação JWT para proteger as rotas

Implementar testes automatizados (unitários e integração)

Criar documentação da API com Swagger

Melhorar tratamento de erros com middleware global

Adicionar paginação no histórico de conversões

Implementar limpeza automática de arquivos antigos

Adicionar rate limiting para proteção contra abusos
