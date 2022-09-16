import { Orbis } from "@orbisclub/orbis-sdk"

const orbis = new Orbis();

export default defineNuxtPlugin(() => {
  return {
    provide: {
      orbis
    }
  }
})
