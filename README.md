TaskMaster ✔️
Bem-vindo ao TaskMaster! 🚀 Um aplicativo de gerenciamento de tarefas moderno e intuitivo, projetado para ajudar você a organizar seu dia a dia, aumentar sua produtividade e nunca mais perder um prazo.

📋 Índice
✨ Funcionalidades Principais

📸 Screenshots

💻 Tecnologias Utilizadas

🏁 Como Começar

📂 Estrutura do Projeto

🤝 Como Contribuir

📄 Licença

✨ Funcionalidades Principais
O TaskMaster vem com um conjunto de funcionalidades para tornar sua vida mais fácil:

🔐 Autenticação de Usuário: Sistema completo de login e cadastro para manter suas tarefas seguras.

📝 Gerenciamento de Tarefas (CRUD): Crie, leia, atualize e delete tarefas de forma simples e rápida.

ιε Sub-tarefas: Divida tarefas complexas em passos menores e mais gerenciáveis.

📅 Visualização em Calendário: Veja suas tarefas organizadas em um calendário interativo para planejar seus prazos.

📄 Visualização em Lista: Uma visão clássica de lista para um acompanhamento direto das suas tarefas.

🎨 Tema Claro e Escuro (Dark/Light): Mude o tema da aplicação para melhor conforto visual.

🔍 Filtros e Ordenação: Encontre facilmente suas tarefas com filtros por status ou prioridade.

🔔 Notificações (Em breve): Receba lembretes para não esquecer de suas tarefas importantes.

📸 Screenshots
(Aqui você pode adicionar screenshots da sua aplicação para mostrar como ela é!)

Tela de Login

Dashboard Principal

Visualização em Calendário

[Imagem da Tela de Login]

[Imagem do Dashboard]

[Imagem do Calendário]

💻 Tecnologias Utilizadas
Este projeto foi construído com as seguintes tecnologias e ferramentas:

Frontend:

React.js - Biblioteca para a construção da interface de usuário.

Vite - Ferramenta de build extremamente rápida.

React Router DOM - Para gerenciamento de rotas.

CSS Modules / Tailwind CSS - Para estilização.

Backend (BaaS):

Appwrite - Plataforma de backend como serviço para autenticação e banco de dados.

Gerenciamento de Estado:

React Context API: Para um gerenciamento de estado global de forma nativa e eficiente.

🏁 Como Começar
Siga os passos abaixo para configurar e rodar o projeto em sua máquina local.

Pré-requisitos
Node.js (versão 18.x ou superior)

npm ou yarn

Instalação e Configuração
Clone o repositório:

git clone https://github.com/seu-usuario/taskmaster_v1.git
cd taskmaster_v1

Instale as dependências:

npm install

ou

yarn install

Configure o Appwrite:

O backend deste projeto usa o Appwrite. Você precisará de uma conta e um projeto Appwrite configurado.

Crie um arquivo .env.local na raiz do projeto.

Adicione as seguintes variáveis de ambiente com as credenciais do seu projeto Appwrite:

VITE_APPWRITE_PROJECT_ID="SEU_PROJECT_ID"
VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1" # Ou seu endpoint self-hosted
VITE_APPWRITE_DATABASE_ID="SEU_DATABASE_ID"
VITE_APPWRITE_TASKS_COLLECTION_ID="SUA_COLLECTION_ID"

Rode o projeto:

npm run dev

ou

yarn dev

Abra http://localhost:5173 (ou a porta indicada no terminal) no seu navegador para ver a aplicação.

📂 Estrutura do Projeto
A estrutura de pastas do projeto foi organizada para manter o código modular e escalável:

taskmaster_v1/
├── public/
├── src/
│   ├── api/
│   │   └── appwrite.js      # Configuração e inicialização do Appwrite
│   ├── assets/              # Imagens, fontes, etc.
│   ├── components/
│   │   ├── auth/            # Componentes de autenticação (Login, Signup)
│   │   ├── calendar/        # Componentes da visualização de calendário
│   │   ├── layout/          # Componentes de layout (Header, Navbar)
│   │   ├── tasks/           # Componentes relacionados a tarefas (Form, Item, List)
│   │   └── ui/              # Componentes de UI reutilizáveis (Button, Card, Input)
│   ├── context/
│   │   ├── AuthContext.jsx  # Contexto de autenticação
│   │   ├── TasksContext.jsx # Contexto de tarefas
│   │   └── ThemeContext.jsx # Contexto do tema (dark/light)
│   ├── hooks/
│   │   ├── useAuth.js       # Hook para lógica de autenticação
│   │   └── useTasks.js      # Hook para lógica de tarefas
│   ├── views/
│   │   ├── DashboardView.jsx # Página principal do dashboard
│   │   ├── CalendarView.jsx  # Página da visualização de calendário
│   │   └── ListView.jsx      # Página da visualização em lista
│   ├── App.jsx              # Componente principal e rotas
│   ├── main.jsx             # Ponto de entrada da aplicação
│   └── index.css            # Estilos globais
├── .gitignore
├── package.json
└── README.md

🤝 Como Contribuir
Contribuições são o que tornam a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será muito apreciada.

Faça um Fork do projeto.

Crie uma nova Branch (git checkout -b feature/sua-feature-incrivel).

Faça o Commit das suas alterações (git commit -m 'Adiciona sua-feature-incrivel').

Faça o Push para a Branch (git push origin feature/sua-feature-incrivel).

Abra um Pull Request.

📄 Licença
Distribuído sob a licença MIT. Veja LICENSE para mais informações.

Feito com ❤️ por Rafael