export const isIosSafari = (ua: string, standalone: boolean) =>
  /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua) && !standalone
