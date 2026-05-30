# Financej

Um gerenciador financeiro pessoal moderno e responsivo, construído com as mais recentes tecnologias web. Controle suas despesas, gerencie suas fontes de renda e tenha uma visão clara da sua saúde financeira.

![Nuxt 4](https://img.shields.io/badge/Nuxt-4.4-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=flat&logo=prisma&logoColor=white)

## ✨ Funcionalidades

### 📊 Dashboard Inteligente

- **Resumo financeiro em tempo real**: Visualize seu saldo, rendas e despesas do período
- **Gráficos interativos**:
  - Gráfico de rosca (donut) com breakdown por categoria
  - Barras horizontais mostrando gastos por categoria
  - Anel de progresso indicando percentual gasto
- **Filtros de período**: Semana, mês, ano ou período personalizado
- **Atividades recentes**: Últimos lançamentos com detalhes

### 💸 Gestão de Despesas

- **Registro rápido**: Modal intuitivo com campos otimizados
- **Seleção visual de categorias**: Botões coloridos com ícones
- **10 categorias disponíveis**:
  - 🍽️ Alimentação
  - 📺 Assinatura
  - ✨ Lazer
  - 👤 Gasto Pessoal
  - 📈 Investimento
  - 📚 Estudo
  - 🔁 Recorrente
  - 🏠 Casa
  - 🚗 Transporte
  - ⚫ Outros
- **Modo contínuo**: Opção de continuar adicionando despesas sem fechar o modal
- **Descrição opcional**: Adicione contexto aos seus gastos

### 💵 Rendas Recorrentes

- **Gestão de fontes de renda**: Cadastre salários, freelances, dividendos, etc.
- **Recorrências flexíveis**: Mensal, quinzenal ou semanal
- **Vigência temporal**: Data de início e fim (opcional)
- **Cálculo automático**: Sistema calcula o total mensal baseado nas recorrências

### 📤 Exportação para Excel

- **Relatórios completos**: Gera arquivos `.xlsx` com:
  - Lista detalhada de despesas
  - Resumo financeiro do período
  - Breakdown por categoria
- **Filtros personalizáveis**: Escolha período e categorias a incluir
- **Formatação profissional**: Células formatadas, cabeçalhos estilizados
- **Multi-idioma**: Exporta conforme idioma selecionado

### 🌍 Internacionalização

- **2 idiomas disponíveis**: Português (PT-BR) e Inglês (EN)
- **4 moedas suportadas**: Real (BRL), Dólar (USD), Euro (EUR), Libra (GBP)
- **Formatação localizada**: Datas, números e moedas respeitam o locale

### 🎨 Temas e Design

- **Dark mode e Light mode**: Alternância suave entre temas
- **Design system moderno**: Baseado em OKLCH para cores vibrantes
- **Cores de destaque**: Paleta de cores personalizável
- **Totalmente responsivo**: Mobile-first, otimizado para todas as telas
- **PWA**: Instale como app nativo no celular

### 🔐 Autenticação e Segurança

- **Login com Clerk**: Autenticação segura e moderna
- **Multi-tenant**: Dados isolados por usuário
- **Headers de segurança**: Proteção contra XSS, CSRF e outras vulnerabilidades
- **Validação de dados**: Backend valida todas as entradas

## 🛠️ Stack Tecnológica

### Frontend

- **[Nuxt 4](https://nuxt.com/)**: Framework Vue meta-framework de última geração
- **[Vue 3](https://vuejs.org/)**: Framework JavaScript progressivo
- **[TypeScript 6](https://www.typescriptlang.org/)**: Tipagem estática para JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)**: Framework CSS utility-first
- **[Nuxt UI](https://ui.nuxt.com/)**: Biblioteca de componentes UI para Nuxt
- **[Nuxt i18n](https://i18n.nuxtjs.org/)**: Internacionalização
- **[Lucide Icons](https://lucide.dev/)**: Ícones modernos e consistentes

### Backend

- **[Nuxt Server](https://nuxt.com/docs/guide/directory-structure/server)**: API Routes serverless
- **[Prisma 7](https://www.prisma.io/)**: ORM type-safe para Node.js
- **[PostgreSQL](https://www.postgresql.org/)**: Banco de dados relacional robusto
- **[Supabase](https://supabase.com/)**: Plataforma de banco de dados gerenciado

### Autenticação

- **[Clerk](https://clerk.com/)**: Plataforma de autenticação completa
- **Webhooks**: Sincronização automática de usuários

### Ferramentas e Bibliotecas

- **[ExcelJS](https://github.com/exceljs/exceljs)**: Geração de planilhas Excel
- **[Nuxt Security](https://nuxt-security.vercel.app/)**: Headers de segurança HTTP
- **[ESLint](https://eslint.org/)**: Linting e code quality
- **[PNPM](https://pnpm.io/)**: Gerenciador de pacotes eficiente

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- PNPM 8+
- PostgreSQL (ou conta no Supabase)
- Conta no Clerk

### Instalação

1. **Clone o repositório**

```bash
git clone <repository-url>
cd finance-manager
```

2. **Instale as dependências**

```bash
pnpm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Clerk
NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
NUXT_CLERK_SECRET_KEY="sk_test_..."
NUXT_CLERK_SIGN_IN_URL="/sign-in"
NUXT_CLERK_SIGN_UP_URL="/sign-up"
CLERK_WEBHOOK_SECRET="whsec_..."
```

4. **Execute as migrações do banco de dados**

```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

5. **Inicie o servidor de desenvolvimento**

```bash
pnpm dev
```

6. **Acesse a aplicação**

```
http://localhost:3000
```

### Build para Produção

```bash
pnpm build
pnpm preview
```

## 📁 Estrutura do Projeto

```
finance-manager/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Design system e variáveis CSS
│   ├── components/
│   │   ├── charts/               # Componentes de gráficos
│   │   ├── ExpenseModal.vue      # Modal de despesas
│   │   ├── ExpenseRow.vue        # Item de despesa
│   │   └── ...
│   ├── composables/
│   │   ├── useDashboard.ts       # Lógica do dashboard
│   │   ├── useExpenses.ts        # Lógica de despesas
│   │   ├── useIncomes.ts         # Lógica de rendas
│   │   └── ...
│   ├── layouts/
│   │   └── dashboard.vue         # Layout principal
│   ├── locales/
│   │   ├── en.json               # Traduções em inglês
│   │   └── pt-BR.json            # Traduções em português
│   ├── middleware/
│   │   └── auth.ts               # Middleware de autenticação
│   ├── pages/
│   │   ├── dashboard.vue         # Página principal
│   │   ├── export.vue            # Página de exportação
│   │   ├── expenses/             # Páginas de despesas
│   │   └── settings/
│   │       └── income.vue        # Gestão de rendas
│   └── utils/
│       └── categories.ts         # Definições de categorias
├── prisma/
│   ├── schema.prisma             # Schema do banco de dados
│   └── migrations/               # Migrações
├── server/
│   ├── api/
│   │   ├── dashboard/            # Endpoints do dashboard
│   │   ├── expenses/             # CRUD de despesas
│   │   ├── incomes/              # CRUD de rendas
│   │   ├── export.get.ts         # Exportação para Excel
│   │   └── webhooks/             # Webhooks do Clerk
│   ├── locales/                  # Traduções server-side
│   └── utils/                    # Utilitários do servidor
└── nuxt.config.ts                # Configuração do Nuxt
```

## 🎯 Próximas Funcionalidades

- [ ] Metas financeiras
- [ ] Notificações de gastos
- [ ] Gráficos de tendência temporal
- [ ] Comparação entre períodos
- [ ] Categorias customizáveis
- [ ] Upload de comprovantes
- [ ] Relatórios em PDF
- [ ] Modo offline (PWA completo)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commitar suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Fazer push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Desenvolvido com ❤️ usando as melhores tecnologias web modernas.

---

**Finance Manager** - Controle suas finanças de forma simples e eficiente 💰✨
