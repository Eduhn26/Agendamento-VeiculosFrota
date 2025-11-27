# 🚗 Sistema de Agendamento de Frota

Aplicação completa para **gestão de veículos**, **agendamentos**, **controle de manutenção** e **administração de usuários**.

Este projeto é dividido em:

* **Backend (Node.js + Express + MongoDB)**
* **Frontend (React + Vite)**
* **Autenticação com JWT**
* **Controle de permissões (Admin / User)**
* **Regra automática de manutenção a cada 30.000 km**

---

## 📚 Índice

* [Funcionalidades](#funcionalidades)
* [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Pré-requisitos](#pré-requisitos)
* [Instalação do Backend](#instalação-do-backend)
* [Instalação do Frontend](#instalação-do-frontend)
* [Variáveis de Ambiente](#variáveis-de-ambiente)
* [Scripts Disponíveis](#scripts-disponíveis)
* [Endpoints Principais](#endpoints-principais)
* [Seed de Dados](#seed-de-dados)
* [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
* [Segurança](#segurança)
* [Licença](#licença)

---

## 🚀 Funcionalidades

### 👤 **Controle de Usuários**

* Cadastro e login com JWT
* Controle de permissões (Admin / Usuário)
* CRUD completo (admin)

### 🚗 **Gerenciamento de Veículos**

* Cadastro de veículos
* Edição, exclusão, listagem
* Upload de imagens
* Controle de quilometragem
* Regras automáticas:

  * A cada 30.000 km → veículo fica indisponível para **manutenção**
  * Apenas admin libera novamente

### 📅 **Sistema de Agendamento**

* Usuários requisitam veículos
* Admin aprova, recusa ou finaliza
* Histórico de uso

### 🛡 Segurança incluída

* Helmet
* CORS restrito
* Validação de entrada
* Tokens JWT com expiração
* Nenhum dado sensível no repositório

---

## 🛠 Tecnologias Utilizadas

### **Backend**

* Node.js
* Express
* MongoDB / Mongoose
* Bcrypt
* Helmet
* JWT
* CORS

### **Frontend**

* React + Vite
* Axios
* React Router
* Componentização completa

---

## 📌 Pré-requisitos

* Node.js 18+
* NPM ou Yarn
* MongoDB Atlas ou servidor MongoDB local

---

## ⚙ Instalação do Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `/backend`:

```bash
cp .env.example .env
```

Depois execute:

```bash
npm run dev
```

---

## 🎨 Instalação do Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação abrirá em:

```
http://localhost:5173
```

---

## 🔑 Variáveis de Ambiente

Arquivo **backend/.env.example**:

```
MONGODB_URI=
JWT_SECRET=
PORT=5000

ADMIN_SEED_PASSWORD=
USER_SEED_PASSWORD=
```

---

## 🧪 Scripts Disponíveis

### Backend

```
npm run dev   # inicia servidor com nodemon
npm start     # modo produção
node seed.js  # popula o banco com dados fictícios
```

### Frontend

```
npm run dev
npm run build
npm run preview
```

---

## 📡 Endpoints Principais

### 🔐 Autenticação

```
POST /api/auth/login
POST /api/auth/register
```

### 🚗 Veículos

```
GET /api/vehicles
POST /api/vehicles
PATCH /api/vehicles/:id
DELETE /api/vehicles/:id
```

### 📅 Agendamentos

```
POST /api/rentals
GET /api/rentals
PATCH /api/rentals/:id/status
```

---

## 🌱 Seed de Dados

Este projeto possui um arquivo `seed.js` que:

* Cria usuários fictícios
* Cria veículos fictícios
* Define senhas via variáveis de ambiente (seguro para GitHub)

Execute:

```bash
node seed.js
```

---

## 🧰 Ambiente de Desenvolvimento

* Backend roda por padrão em **[http://localhost:5000](http://localhost:5000)**
* Frontend roda em **[http://localhost:5173](http://localhost:5173)**
* CORS habilitado apenas para domínios autorizados

---

## 🔒 Segurança

Este projeto segue boas práticas:

* Nenhum `.env` é incluído no repositório
* Não há senhas hardcoded no código
* Conexão MongoDB sem fallback inseguro
* Helmet habilitado
* Sanitização de seed (dados fictícios)
* CORS restrito por domínio

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**.
Sinta-se à vontade para usar e modificar.

---

Se precisar de **badges**, **screenshots**, **instalação Docker**, ou **versão em inglês**, posso gerar também.
