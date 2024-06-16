import { ThirdwebStorage } from '@thirdweb-dev/storage'

export async function uploadFileToThirdWeb(file) {
  const config = useRuntimeConfig()

  const storage = new ThirdwebStorage({
    clientId: config.thirdwebClientId,
  })

  const fileUri = await storage.upload(file)

  return fileUri
}
