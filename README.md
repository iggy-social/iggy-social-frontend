# Iggy Social Template

Iggy Social is a Web3 Social frontend website based on the [Iggy Social](https://iggy.social) template. It uses [Orbis SDK](https://useorbis.com) and [Ceramic Network](https://ceramic.network/) in the background. For usernames it uses [Punk Domains](https://punk.domains/).

Demo 1 (Netlify): https://demo.iggy.social/
Demo 2 (Vercel): https://demo2.iggy.social/

## Delete the .github folder

This folder (and the main.yml file) is just for the purpose of mirroring this repo to other git servers (for backup reasons). You don't need this in your cloned project.

## .env

Create a `.env` file from `.env.example`.

> Make sure to also enter these vars in your hosting settings!

## Hosting

We recommend to use Netlify for hosting the site. Netlify allows you to easily deploy the site from this repo (or from a fork of this repository).

Make sure to use the the `npm run generate` command instead of `npm run build` for build instructions on Netlify.

If you want to use optional features such as GIFs and image upload, make sure to enter proper environment variables (see `.env.example`).

### 4everland

[4everland](https://4everland.org/) is a decentralized hosting provider which stores your website on IPFS.

If you have your code on GitHub, the `build.yml` script will build your app via GitHub Actions and create a `build` branch.

Make sure you add all the necessary env vars (tenor, web3 storage etc.) to the organization variables for actions on GitHub.

Also make sure you have Workflow permissions on the organization level on GitHub set to read & write.

Then, when you create a project on 4everland, make sure you select the `build` branch. 

And in the build section delete the command and set build folder to empty (or `./`). The preset can be set to `Other`. No install command is needed either.

![](https://bafkreid6mzglrk5hklraua267sker6gqsfpy2ezmjj7yc2oqmx2arbynru.ipfs.w3s.link)

## GIFs (Tenor)

If you want to have GIF search implemented, create your own Tenor API Key on Google Cloud Console. Follow the instructions here: https://developers.google.com/tenor/guides/quickstart. 

Then enter the key in environment variables (`TENOR_KEY`).

## Image upload (Web3 Storage)

To support image uploads on IPFS please create an API key on Web3 Storage: https://web3.storage/ 

Then enter the key in environment variables (`WEB3_STORAGE_KEY`).

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

Or run Netlify dev server on http://localhost:8888 (to get link previews):

```bash
netlify dev
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
