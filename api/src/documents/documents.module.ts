import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DOCUMENT_READER, documentReader } from "./reader";

@Module({
  // DOC_READER picks the adapter: http (the provider) or example (dev and tests); see reader.ts.
  providers: [DocumentsService, { provide: DOCUMENT_READER, useFactory: () => documentReader() }],
})
export class DocumentsModule {}
