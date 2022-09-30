# Punk Nuxt Starter (WIP)

> Work-in-progress (WIP), not production ready yet.

Punk Nuxt Starter is a starter template that can help you set up a Web3 Social website for your web3 community. It uses [Orbis SDK](https://github.com/OrbisWeb3/orbis-sdk) and Ceramic Network in the background.

If your web3 community has it's own Punk Domains extensions (like .klima or .smol), it can be used as usernames instead of addresses.

What's included:

- [Orbis SDK](https://github.com/OrbisWeb3/orbis-sdk)
- [Nuxt 3](https://v3.nuxtjs.org/)
- [Vue Dapp](https://vue-dapp-docs.netlify.app/)
- [Ethers 5](https://ethers.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Toastification](https://github.com/Maronato/vue-toastification/tree/next)

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
  alchemyMumbaiKey: process.env.NUXT_ALCHEMY_MUMBAI_KEY,
  tldName: ".wagmi",
  projectName: "My project name",
  projectUrl: "https://my.website.url"
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
