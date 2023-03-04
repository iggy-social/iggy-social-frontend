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

## Customize

- Project-specific settings in `nuxt.config.ts`
- CSS files in the `/public/css/` folder
- Favicon and cover/preview images in `/public/img/` folder

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
