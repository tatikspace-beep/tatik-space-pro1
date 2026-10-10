export const previewStylesheetExtensions = /\.(?:css|scss|sass|less)$/i;
export const previewPreprocessorExtensions = /\.(?:scss|sass|less)$/i;

export async function compilePreviewStylesheet(filePath: string, source: string): Promise<string> {
  const extension = filePath.split(/[?#]/, 1)[0]?.split('.').pop()?.toLowerCase() || '';
  if (extension === 'css') return source;

  if (/@(?:import|use|forward)\b/i.test(source)) {
    throw new Error('Stylesheet imports are not supported in this preview yet. Inline the imported styles first.');
  }

  if (extension === 'scss' || extension === 'sass') {
    const sass = await import('sass');
    return (await sass.compileStringAsync(source, {
      style: 'expanded',
      syntax: extension === 'sass' ? 'indented' : 'scss',
    })).css;
  }

  if (extension === 'less') {
    const less = (await import('less')).default;
    const result = await less.render(source, {
      filename: filePath,
      javascriptEnabled: false,
      processImports: false,
    });
    return result.css;
  }

  throw new Error(`Unsupported preview stylesheet: ${filePath}`);
}
