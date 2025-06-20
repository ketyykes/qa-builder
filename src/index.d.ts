declare module 'primelocale/zh-TW' {
  const locale: {
    'zh-TW': {
      [key: string]:
        | string[]
        | string
        | number
        | {
            [key: string]: string
          }
        | boolean
    }
  }
  export default locale
}
