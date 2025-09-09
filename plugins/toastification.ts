import Toast from 'vue-toastification'

interface ToastOptions {
  timeout: number | false
  hideProgressBar: boolean
  closeButton: string
  position: string
  closeOnClick: boolean
  toastClassName: string
  toastDefaults: {
    [key: string]: {
      timeout: number | false
      icon: boolean
    }
  }
}

const options: ToastOptions = {
  timeout: 5000,
  hideProgressBar: true,
  closeButton: 'button',
  position: 'top-left',
  closeOnClick: false,
  toastClassName: 'custom-toast-bg',

  toastDefaults: {
    // ToastOptions object for each type of toast
    ['info']: {
      timeout: false,
      icon: false,
    },
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, options)
})
