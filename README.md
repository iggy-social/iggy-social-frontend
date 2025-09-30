# Iggy Social Frontent (Nuxt)

Iggy Social starter template which uses the following stack:

- Nuxt
- Wagmi
- Farcaster (optional, suitable for mini apps)
- Bootstrap

## NPM install

```bash
nvm use 22 # make sure to use NodeJS v22

npm i
```

## Supported network

Set the supported network in the wagmi.ts file in the root folder. It should be only 1 supported network.

## Farcaster Mini App setup

Set Farcaster data in these files:

- `/public/well-known/farcaster.json`
- `app.vue`: edit the Meta tag with `name="fc:miniapp"` if needed, for example the splash bg color
- `/pages/about.vue`: example of a custom Farcaster Meta tag (add custom meta tags on other pages too)

## Cloudflare Tunnel for Farcaster testing

1. Install cloudflared: `npm install -g cloudflared` (or download from [cloudflare.com](https://cloudflare.com))
2. Run the tunnel: `cloudflared tunnel --url http://localhost:3000`
3. Use the generated public URL for Farcaster testing

## Supported tokens

For token swap and sending tokens, edit the `tokens.json` and `wrappedNativeTokens.json` files in the `data/` folder.

## How to connect your Safe to the app

0. Make sure you have WalletConnect project ID in environment variables (check example.env to see how)
1. In the app, click on the "Connect Wallet" button and select "WalletConnect"
2. A small modal will appear. Click on the copy icon (two overlapping squares) to copy the WalletConnect URI
3. Go to https://app.safe.global/ and open your Safe
4. In the navigation bar, click on the "WalletConnect" icon
5. In the modal that appears, enter the WalletConnect URI that you copied in the previous step
6. Wait for the Safe to connect
7. You should now see your Safe address in the app

## WalletConnect

If you want WalletConnect support, make sure to copy `.env.example` in to `.env` and enter your WalletConnect project ID into `VITE_WC_PROJECT_ID`.

If you don't want to use WC, then you can remove it from `wagmi.ts` and `/components/connect/ConnectWalletButton.vue`.
