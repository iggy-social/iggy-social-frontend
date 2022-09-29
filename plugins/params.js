export default defineNuxtPlugin(() => {
  //const config = useRuntimeConfig();

  const tldName = ".wagmi"; // if taken from env vars, use config.tldNameKey (and set tldNameKey in nuxt.config.ts/publicRuntimeConfig)

  return {
    provide: {
      tldName
    }
  }
});

