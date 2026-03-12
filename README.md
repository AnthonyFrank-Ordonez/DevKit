# DevKit

DevKit is a comprehensive suite of developer utilities designed to streamline common tasks. Built with Vue 3 and Vite, it offers a polished and efficient experience for developers.

## Features

- **Color Picker**: A powerful tool for selecting and managing colors.
- **Formatter**: A versatile formatter for various data types (JSON, etc.).
- **Regex Builder**: An intuitive interface for building and testing regular expressions.

## Tech Stack

- **Core**: [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Linting**: [ESLint](https://eslint.org/) & [Oxlint](https://oxlint.dev/)
- **Formatting**: [Prettier](https://prettier.io/)

## Folder Structure

```text
devkit/
├── public/              # Static assets
├── src/
│   ├── assets/          # Global styles and images
│   ├── components/      # Reusable UI components
│   ├── layouts/         # Page layout templates
│   ├── router/          # Route definitions
│   ├── stores/          # Pinia state stores
│   ├── types/           # TypeScript type definitions
│   ├── views/           # Main page components (ColorPicker, Formatter, etc.)
│   │   └── __tests__/   # Unit tests for views
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── package.json         # Project dependencies and scripts
└── vite.config.ts       # Vite configuration
```

## Setup Instructions

### Prerequisites

- Node.js (version >= 20.19.0 or >= 22.12.0)
- `pnpm` (recommended)

### Installation

```sh
pnpm install
```

### Local Development

Start the development server with hot-reload:

```sh
pnpm dev
```

### Build for Production

Type-check and build the project for production:

```sh
pnpm build
```

### Testing

Run unit tests with Vitest:

```sh
pnpm test:unit
```

### Linting & Formatting

Lint the project:

```sh
pnpm lint
```

Format the source code:

```sh
pnpm format
```
