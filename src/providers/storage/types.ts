export interface StorageProvider {
  save(file: Buffer, filename: string): Promise<string>; // returns public URL
}
