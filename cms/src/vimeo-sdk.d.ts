// @vimeo/vimeo ships no types; only what src/vimeo.ts uses.
declare module '@vimeo/vimeo' {
  export class Vimeo {
    constructor(clientId: string | null, clientSecret: string | null, accessToken?: string)
    request(options: { method?: string; path: string; query?: object }): Promise<{ statusCode: number; body: unknown }>
  }
}
