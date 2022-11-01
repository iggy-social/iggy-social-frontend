# Iggy Social

> Work-in-progress (WIP), not production ready yet.

Iggy Social is a Web3 Social frontend website. It uses [Orbis SDK](https://github.com/OrbisWeb3/orbis-sdk) and Ceramic Network in the background.

Development preview: https://iggy-social-frontend.vercel.app/

Landing page: https://iggy.social

If your web3 community has its own Punk Domains extension, it can be used as for usernames instead of addresses.

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
  tldName: ".testrora",
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

## Testing

Orbis test group:

```bash
https://app.orbis.club/group/kjzl6cwe1jw145e1i1agcrjp9375sjpyyk7imu281koehrpve0pr46lvr5e9xco
```
