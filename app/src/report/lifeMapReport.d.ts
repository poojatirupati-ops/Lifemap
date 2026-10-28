// Types for the vendored renderer (lifeMapReport.js). `data` is the report data from reportData().
interface RenderOptions {
  /** a URL or data URI for media/<name>.jpg */
  photoSrc?: (name: string) => string
}

export declare const LifeMapReport: {
  reportPages(
    data: unknown,
    options?: RenderOptions,
  ): { css: string; pages: string[]; count: number; schemaVersion: string }
  reportDocument(data: unknown, options?: RenderOptions): string
  VERSION: string
  PAGE: { w: number; h: number }
}
