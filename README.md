# TACO (Team AI Chat pOrtal) 🌮

A helpful frontend for ChatGPT with the possibility to share the API key with the whole team.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install`
or `yarn`), start a development server:

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

4. (Optional) Seed the database with initial data (no need to manually do it, since it's done
   automatically by the migrate command):

    ```bash
    npx prisma db seed
    ```

5. Your Prisma setup is now complete! You can start using the Prisma client in your application code
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

## Tailwind UI

We use Tailwind UI to style the app. Tailwind UI relies on Headless UI in some parts. We use
a svelte implementation of that library: @rgossiaux/svelte-headlessui. TWUI also relies on
Heroicons, there is also a svelte port of that icon collection @babeard/svelte-heroicons.

You can see all that in action in `src/lib/components/ModalConfirm.svelte`.

## Dark Mode

We changed the default dark mode styling strategy in Tailwind to be class based (see tailwind
config) instead of based in the system preference only. So now, the site respects user pref on dark
mode but also allows us to force dark mode where there's no "non-dark" mode implemented. that can be
done just adding the class `dark` to any part we want to force dark mode. See `Input` component
usage in sign in and sign up for reference.

We control the dark mode toggling here: `src/routes/+layout.svelte`.

## Form validations

We use zod validation library to validate forms. See settings and auth routes for ref. There is
probably a good opportunity for an abstraction there given we use everywhere the same pattern.

## Email provide

As email provider Postmark is used. Email templates are created in some extra ts files. Therefore it should be easy to
switch to another email provider by just switching out the provider in the email file.

## Contribution

Your are very welcome to do any kind of contribution that being issue reporting, code contribution or feature requests! Please take a look into the issue section of this repo to make sure your request isn't already existing. If not feel free to create an issue and tag it with suiting labels.

## About Prototyp

Taco is maintained by [Prototyp](https://www.prototyp.se/en), a code lab building digital products for businesses breaking new ground.

![Prototyp logo](https://github.com/prototypsthlm/taco/blob/dev/prototyp-logo.png?raw=true)

### Looking to break new ground?

Let us tell you more about our working methods, earlier cases, and how we can help you reach the next level together. We are always interested in new contacts and collaborations. [Get in touch](https://www.prototyp.se/en/contact) - and let’s grab a cup of coffee!
