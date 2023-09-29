import Toast from 'vue-toastification/dist/index.mjs'

const options = {
  timeout: 5000,
  hideProgressBar: true,
  closeButton: "button",
  position: "top-left",
  closeOnClick: false,
  toastClassName: "custom-toast-bg",

  toastDefaults: {
    // ToastOptions object for each type of toast
    ["info"]: {
        timeout: false,
        icon: false
    }    
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, options)
});