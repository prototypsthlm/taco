# TACO (Team AI Chat pOrtal) 🌮

![GitHub Actions Status](https://github.com/prototypsthlm/taco/actions/workflows/test.yml/badge.svg)

TACO is an open-source frontend for ChatGPT built with <b>SvelteKit</b> that allows teams to collaborate effectively by sharing a single API key, providing easy access to AI-powered chat functionality.

Official website: https://www.tacoai.app/

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Setup](#setup)
-   [Usage](#usage)
-   [Prisma Setup](#prisma-setup)
-   [Building](#building)
-   [Testing](#testing)
-   [Technical Details](#technical-details)
-   [Contribution](#contribution)
-   [About Prototyp](#about-prototyp)

## Prerequisites

Before you begin, ensure you have met the following requirements:

-   **Node.js**: Version 16.x or later
-   **Docker**: For containerized environments (check with `docker --version`)

## Setup

1. Clone the project and install dependencies with `npm install` (or `pnpm install`
   or `yarn`)

2. Set up environment variables by copying the `.env.example` file to `.env`:

    ```bash
    cp .env.example .env
    ```

3. Follow [Prisma setup](#prisma-setup) to add a database for local development

## Usage

To start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Prisma Setup

Follow these steps to initialize Prisma in your project:

1. Start by running Docker Compose to set up the PostgreSQL database for your development
   environment:

    ```bash
    docker-compose up -d
    ```

2. Copy the `.env.example` file to `.env`:

    ```bash
    cp .env.example .env
    ```

3. Run the Prisma migration command to apply database schema changes:

    ```bash
    npx prisma migrate dev
    ```

4. Your Prisma setup is now complete! You can start using the Prisma client in your application code
   to interact with the database.

Make sure to configure your database connection details and any other necessary settings in
the `.env` file before running the migration and seed commands.

For more information on Prisma and its usage, refer to
the [Prisma documentation](https://www.prisma.io/docs/).

### Helpers

run

```
npx prisma studio
```

to get a browser view of the database

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for
> your target environment.

## Testing

run

```
npx playwright test
```

to run the E2E tests.

Use `--debug` or `--headed` flags to run the tests in browser.

## Technical Details

### Tailwind UI

We use Tailwind UI to style the app. Tailwind UI relies on Headless UI in some parts. We use
a svelte implementation of that library: @rgossiaux/svelte-headlessui. TWUI also relies on
Heroicons, there is also a svelte port of that icon collection @babeard/svelte-heroicons.

You can see all that in action in `src/lib/components/ModalConfirm.svelte`.

### Dark Mode

We have changed the default dark mode styling strategy in Tailwind CSS to be class-based (see tailwind.config.ts), rather than relying solely on system preferences. This adjustment allows the site to respect user preferences for dark mode while also enabling us to enforce dark mode in areas where a light mode is not implemented.

To force dark mode, simply add the class dark to any element where you want it to take effect. For reference, you can see the usage in the Input component on the sign-in and sign-up pages.

We manage the dark mode toggling in src/routes/+layout.svelte.

### Email provider

We utilize <b>Postmark</b> as our email provider. Email templates are created in separate TypeScript files, making it easy to switch to another email provider by simply changing the provider configuration in the email file.

## Contribution

We welcome all contributions, whether through issue reporting, code contributions, or feature requests! Please check the [Issues](https://github.com/prototypsthlm/taco/issues) section of this repository to ensure your request has not already been submitted. If you don't find an existing issue, feel free to create a new one and tag it with the appropriate labels.

## About Prototyp

Taco is maintained by [Prototyp](https://www.prototyp.se/en), a code lab building digital products for businesses breaking new ground.

![Prototyp logo](https://github.com/prototypsthlm/taco/blob/dev/prototyp-logo.png?raw=true)

### Looking to break new ground?

Let us tell you more about our working methods, earlier cases, and how we can help you reach the next level together. We are always interested in new contacts and collaborations. [Get in touch](https://www.prototyp.se/en/contact) - and let’s grab a cup of coffee!
