# Iggy Social Frontent (Nuxt)

Iggy Social starter template which uses the following stack:

- Nuxt
- Wagmi
- Farcaster (optional, suitable for mini apps)
- Bootstrap
- PWA (Progressive Web App) support

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

## PWA (Progressive Web App) Setup

This template includes full PWA support out of the box! 🚀

### What's Included

- ✅ **Service Worker**: Automatic caching and offline support
- ✅ **Web App Manifest**: App metadata and installation prompts
- ✅ **PWA Icons**: Multiple sizes for different devices
- ✅ **Install Prompt**: Users can install your app to their home screen
- ✅ **Offline Support**: Basic offline functionality

### Generate PWA icons

#### Option A: Automated Script (Recommended)

The script requires your logo to be at `public/img/logo.svg` and will generate all required PWA icon sizes automatically.

Run the script:

```bash
# Generate icons from your logo (requires logo at public/img/logo.svg)
npm run generate-pwa-icons
```

This script will replace the placeholder icons in the `public/img/` directory:

```bash
# Replace these files with your own icons:
public/pwa-192x192.png    # 192x192 icon
public/pwa-512x512.png    # 512x512 icon  
public/favicon.ico        # Favicon
public/apple-touch-icon.png # Apple touch icon
```

#### Option B: Manual Creation
1. Open your logo in an image editor (Photoshop, GIMP, Figma, etc.)
2. Export at each required size
3. Save with the correct filenames in `public/img/`

**Icon Requirements:**
- **pwa-192x192.png**: 192x192 pixels (minimum for Android)
- **pwa-512x512.png**: 512x512 pixels (recommended for Android)
- **favicon.ico**: 16x16, 32x32, 48x48 pixels
- **apple-touch-icon.png**: 180x180 pixels (for iOS)

**Pro Tips:**
- Ensure your icons have good contrast and are recognizable at small sizes
- Test your icons on both light and dark backgrounds
- Keep icon files under 1MB for better performance

### Update PWA Configuration

Edit `/public/manifest.webmanifest` to customize your PWA settings:

```json
{
  "name": "Iggy Social Demo | Web3 Social Template For Your DAO",
  "short_name": "Iggy Demo",
  "description": "This is a demo website presenting Iggy Social, a web3 social template for your DAO.",
  "start_url": "/",
  ...
```

### Test Your PWA

1. **Build and serve your app:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Test PWA features:**
   - Open Chrome DevTools → Application tab
   - Check "Manifest" and "Service Workers" sections
   - Look for the install prompt in the address bar


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

## World MiniKit

World MiniKit is not natively supported in this project, but you can implement it yourself by installing `@worldcoin/minikit-js` library and adapting the code, more precisely in files:

- /components/connect/ConnectWalletButton.vue
- /composables/useAccountData.ts
- /composables/useWeb3.ts

And maybe in some others too.