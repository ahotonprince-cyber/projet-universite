/// <reference types="vite/client" />

interface ImportMeta {
  readonly glob: <T = any>(
    pattern: string,
    options?: {
      eager?: boolean;
    }
  ) => Record<string, T>;
}