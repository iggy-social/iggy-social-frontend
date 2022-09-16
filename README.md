# Punk Nuxt Starter

Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.

What's included:

- Nuxt 3
- Vue Dapp
- Ethers 5
- Pinia
- Orbis SDK

## Hosting

This template does not work properly on GitHub Pages. Use Netlify or Vercel instead (make sure to use the `npm run generate` command instead of `npm run build` there).

## Environment variables

You need to set env vars in two different places: `.env` file and also in the `nuxt.config.ts` file (the `publicRuntimeConfig` section).

`.env` file:

```bash
NUXT_ALCHEMY_POLYGON_KEY=value
NUXT_ALCHEMY_MUMBAI_KEY=value
NUXT_ALCHEMY_OPTIMISM_KEY=value
NUXT_ALCHEMY_ARBITRUM_KEY=value
NUXT_ALCHEMY_ETHEREUM_KEY=value
```

`nuxt.config.ts` file:

```ts
publicRuntimeConfig: {
  alchemyEthereumKey: process.env.NUXT_ALCHEMY_ETHEREUM_KEY,
  alchemyPolygonKey: process.env.NUXT_ALCHEMY_POLYGON_KEY,
  alchemyOptimismKey: process.env.NUXT_ALCHEMY_OPTIMISM_KEY,
  alchemyArbitrumKey: process.env.NUXT_ALCHEMY_ARBITRUM_KEY,
  alchemyMumbaiKey: process.env.NUXT_ALCHEMY_MUMBAI_KEY
},
```

If you'll use the same keys as in this template, then you only need to enter values in the `.env` file. But of you'll add a new env var, you need to edit both `.env` and `nuxt.config.ts`.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install --shamefully-hoist
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run generate
```

Locally preview production build:

```bash
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.
