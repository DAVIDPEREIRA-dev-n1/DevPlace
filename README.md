# DevPlace

A social hub for developers.

🌐 Live Demo: devplacesite.netlify.app

DevPlace é uma plataforma social criada para developers, com o objetivo de juntar programadores, projetos e conteúdo tecnológico num único espaço.

A plataforma permite criar contas, iniciar sessão, criar perfis, publicar conteúdo e interagir com outras publicações, através de uma interface pensada especificamente para a comunidade de desenvolvimento.

🚧 Project Status: Early Development / Prototype

## 🚀 Sobre o projeto

O DevPlace nasceu da ideia de criar uma rede social focada especificamente na comunidade de desenvolvimento de software.

Em vez de ser uma rede social genérica, o objetivo é construir um espaço onde o conteúdo, as interações e as funcionalidades sejam pensados tendo developers como público principal.

O projeto começou como um protótipo frontend utilizando LocalStorage e está atualmente a evoluir para uma arquitetura com backend, API e base de dados.

## ✨ Funcionalidades

### 👤 Contas

- Registo de novos utilizadores
- Login e logout
- Persistência da sessão
- Perfil de utilizador
- Edição do perfil
- Avatar
- Localização e biografia
- Definições da conta
- Eliminação de conta

### 🔐 Autenticação

- Registo através de API
- Login através de API
- Ligação à base de dados
- Password hashing
- Verificação segura de passwords
- Utilização de PHP e PDO

### 📰 Feed

- Criação de publicações
- Publicações apenas com texto
- Upload de imagens
- Upload de vídeos
- Feed ordenado pelas publicações mais recentes
- Contador de likes
- Contador de comentários
- Contador de partilhas
- Eliminação das próprias publicações
- Indicador de tempo relativo da publicação

### 🎨 Interface

- Interface responsiva
- Tema claro
- Tema escuro
- Sidebar de navegação
- Secção de tendências
- Interface inspirada em redes sociais modernas

## 🛠️ Tecnologias

Atualmente, o projeto utiliza tecnologias web nativas e uma stack backend em desenvolvimento:

- **HTML5** — estrutura da aplicação
- **CSS3** — interface e design
- **JavaScript** — lógica e funcionalidades
- **PHP** — backend e API
- **MariaDB** — base de dados
- **PDO** — comunicação com a base de dados
- **Apache** — servidor web
- **XAMPP** — ambiente de desenvolvimento local
- **phpMyAdmin** — gestão da base de dados
- **Git & GitHub** — controlo de versões

## 📁 Estrutura

text
DevPlace/

├── index.html

├── style.css

├── script.js

├── logo.ico

├── README.md

│

└── api/
    ├── db.php
    ├── register.php
    └── login.php

    ▶️ Executar localmente

O projeto utiliza atualmente PHP, Apache e MariaDB para as funcionalidades de backend.


O projeto começou utilizando localStorage para armazenar os dados localmente no browser.

Atualmente, o sistema de contas já utiliza uma base de dados MariaDB através de uma API PHP.

O registo e o login são processados pelo backend e os dados dos utilizadores são armazenados na base de dados.

A migração das restantes funcionalidades para o backend será feita progressivamente.

🔐 Segurança

As passwords dos utilizadores não são armazenadas diretamente.

Durante o registo, as passwords são protegidas através de hashing utilizando:

password_hash()

Durante o login, a password é validada através de:

password_verify()

A comunicação com a base de dados utiliza PDO e prepared statements.

O sistema de autenticação ainda se encontra em desenvolvimento e serão adicionadas mais medidas de segurança antes de uma possível utilização em produção.

🧭 Roadmap

O objetivo é evoluir progressivamente o DevPlace de um protótipo frontend para uma plataforma social completa.

Backend
Base de dados
API REST
Autenticação segura
Sistema de sessões
Sistema real de comentários
Sistema de likes por utilizador
Sistema de seguidores
Perfis públicos
Pesquisa de developers
Projetos e portefólios
Comunidades
Notificações
Mensagens privadas
Sistema de hashtags
Feed personalizado
Deploy online
🎯 Visão

O objetivo a longo prazo do DevPlace é tornar-se mais do que uma simples rede social.

A ideia é criar um hub para developers, onde seja possível:

Discover. Build. Share. Connect.

Um espaço onde programadores possam mostrar aquilo que estão a construir, encontrar pessoas com interesses semelhantes, aprender uns com os outros e criar uma comunidade centrada em tecnologia e desenvolvimento.

📌 Estado atual

Prototype / Early Development

O DevPlace encontra-se atualmente numa fase inicial de desenvolvimento.

A versão atual demonstra a experiência e as funcionalidades principais da interface, enquanto o backend e a base de dados estão a ser implementados progressivamente.

Neste momento, o sistema de registo e login já está ligado à base de dados MariaDB, representando o início da transição do protótipo frontend para uma aplicação com backend.

📄 Licença

Este projeto ainda não possui uma licença definida.

Agradecimentos,

David M Pereira





