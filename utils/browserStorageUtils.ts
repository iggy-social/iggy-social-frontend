import { isAddress, zeroAddress } from 'viem'

const usernameExtension = '-username'
const collectionExtension = '-collection'
const referrerKey = 'referrer'

export function fetchCollection(window: Window | null, cAddress: string) {
  if (!window) {
    console.log('No window object in fetchCollection')
    return null
  }

  try {
    const config = useRuntimeConfig()
    const expiration = config.public.expiryCollections // in milliseconds
    const currentTime = new Date().getTime()

    const objectString = window.localStorage.getItem(String(cAddress).toLowerCase() + collectionExtension)

    if (!objectString) {
      return null
    }

    const obj = JSON.parse(objectString)

    // check if expired (expiration = 0 means never expire)
    if (expiration != 0 && obj.stored + expiration < currentTime) {
      return null
    }

    if (typeof obj == 'object') {
      return obj
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

/**
 *
 * @param {Window | null} window
 * @param {string} addressOrName Blockchain address of smart contract or EOA or domain name
 * @param {string} objType E.g. 'nft', 'image', 'collection'
 * @param {number} expiration In milliseconds (0 means never expire, fetch from the config file)
 * @returns
 */
export function fetchData(window: Window | null, addressOrName: string, objType: string, expiration: number) {
  if (!window) {
    console.log(`No window object for ${objType} in storageUtils/fetchData`)
    return null
  }

  try {
    const currentTime = new Date().getTime()

    const objectString = window.localStorage.getItem(String(addressOrName).toLowerCase() + '-' + objType)

    if (!objectString) {
      return null
    }

    const obj = JSON.parse(objectString)

    // check if expired (expiration = 0 means never expire)
    if (expiration != 0 && obj.stored + expiration < currentTime) {
      return null
    }

    if (typeof obj == 'object') {
      return obj
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

export function fetchReferrer(window: Window | null) {
  if (!window) {
    console.log('No window object in fetchReferrer')
    return zeroAddress
  }

  try {
    const referrerAddress = window.localStorage.getItem(referrerKey)

    if (!referrerAddress) {
      return zeroAddress
    }

    // if not a valid address, return 0x0
    if (!isAddress(referrerAddress)) {
      return zeroAddress
    }

    return referrerAddress
  } catch (error) {
    console.log(error)
    return zeroAddress
  }
}

export function fetchUsername(window: Window | null, userAddress: string) {
  if (!window) {
    console.log('No window object in fetchUsername')
    return null
  }

  try {
    const config = useRuntimeConfig()
    const expiration = config.public.expiryUsernames // in milliseconds
    const currentTime = new Date().getTime()

    const usernameObjectString = window.localStorage.getItem(String(userAddress).toLowerCase() + usernameExtension)

    if (!usernameObjectString) {
      return null
    }

    const usernameObject = JSON.parse(usernameObjectString)

    // check if username is expired (expiration = 0 means never expire)
    if (expiration != 0 && usernameObject.stored + expiration < currentTime) {
      return null
    }

    if (usernameObject.username) {
      return usernameObject.username
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

export function storeCollection(window: Window | null, cAddress: string, collectionObject: any) {
  if (!window) {
    console.log('No window object in storeCollection')
    return null
  }

  const timestamp = new Date().getTime()

  collectionObject['stored'] = timestamp

  window.localStorage.setItem(String(cAddress).toLowerCase() + collectionExtension, JSON.stringify(collectionObject))
}

/**
 *
 * @param {Window | null} window
 * @param {string} addressOrName Blockchain address of smart contract or EOA or domain name
 * @param {any} dataObject Data object to store
 * @param {string} objType E.g. 'nft', 'image', 'collection'
 * @returns
 */
export function storeData(window: Window | null, addressOrName: string, dataObject: any, objType: string) {
  if (!window) {
    console.log(`No window object for ${objType} in storageUtils/storeData`)
    return { success: false, message: `No window object for ${objType} in storageUtils/storeData` }
  }

  const timestamp = new Date().getTime()

  dataObject['stored'] = timestamp

  window.localStorage.setItem(String(addressOrName).toLowerCase() + '-' + objType, JSON.stringify(dataObject))

  return { success: true, message: `${objType} with address or name ${addressOrName} stored successfully` }
}

export function storeReferrer(window: Window | null, referrerAddress: string) {
  if (!window) {
    console.log('No window object in storeReferrer')
    return null
  }

  window.localStorage.setItem(referrerKey, referrerAddress)
}

export function storeUsername(window: Window | null, userAddress: string, username: string) {
  if (!window) {
    console.log('No window object in storeUsername')
    return null
  }

  const timestamp = new Date().getTime()

  const usernameObject = {
    username: username,
    stored: timestamp,
  }

  window.localStorage.setItem(String(userAddress).toLowerCase() + usernameExtension, JSON.stringify(usernameObject))
}

/**
 *
 * @param {Window | null} window
 * @param {string} address Blockchain address of smart contract or EOA
 * @param {string} objType E.g. 'nft', 'image', 'collection'
 * @param {string} fieldName Field name to update in an existing object in local storage
 * @param {any} fieldValue New field value for a given field name
 * @returns
 */
export function updateObjectField(window: Window | null, address: string, objType: string, fieldName: string, fieldValue: any) {
  if (!window) {
    console.error(`No window object for ${fieldName} in storageUtils/updateObjectField`)
    return { success: false, message: `No window object for ${fieldName} in storageUtils/updateObjectField` }
  }

  try {
    const objectString = window.localStorage.getItem(String(address).toLowerCase() + '-' + objType)

    if (!objectString) {
      console.error(`No object found for ${fieldName} in storageUtils/updateObjectField`)
      return { success: false, message: `No object found for ${fieldName} in storageUtils/updateObjectField` }
    }

    const obj = JSON.parse(objectString)

    obj[fieldName] = fieldValue

    window.localStorage.setItem(String(address).toLowerCase() + '-' + objType, JSON.stringify(obj))

    return { success: true, message: `Field ${fieldName} updated successfully` }
  } catch (error) {
    console.log(error)
    return { success: false, message: (error as Error).message }
  }
}
