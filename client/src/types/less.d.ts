declare module 'less' {
  interface RenderOptions {
    filename?: string;
    javascriptEnabled?: boolean;
    processImports?: boolean;
  }

  interface RenderResult {
    css: string;
  }

  interface LessCompiler {
    render(source: string, options?: RenderOptions): Promise<RenderResult>;
  }

  const less: LessCompiler;
  export default less;
}
