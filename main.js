if (import.meta.main) {
  const lines = [];
  for await (
    const text of Deno.stdin.readable.pipeThrough(new TextDecoderStream())
  ) {
    text.split('\n').forEach((line) => {
      if (line.trim()) {
        lines.push(line);
      }
    });
  }
  const files = [];
  const lineRegex = /^(?:.*?)(?<lineNum>\d+):(?<colNum>\d+)\s+(?<errorLevel>.*?)(\s+)(?<message>.*)/
  const fileNameRegex = /^(?<fileName>\/.*)/

  let currentFile = null;
  for (const line of lines) {
    const fileNameMatch = line.match(fileNameRegex);
    if (fileNameMatch?.groups?.fileName) {
      if (!currentFile || currentFile.fileName !== fileNameMatch.groups.fileName) {
        currentFile = {
          fileName: fileNameMatch.groups.fileName,
          errors: []
        };
        files.push(currentFile);
      }
    } else {
      const lineMatch = lineRegex.exec(line);
      if (lineMatch && currentFile) {
        const { lineNum, colNum, errorLevel, message } = lineMatch.groups;
        if (errorLevel === 'error') {
          currentFile.errors.push(
            {
              lineNum: parseInt(lineNum),
              colNum: parseInt(colNum),
              errorLevel,
              message
            }
          );
        }
      }
    }
  }
  console.log(
    files.filter(({ errors }) => errors.length > 0).reduce(
      (acc, { fileName, errors }) => {
        const errorLines = errors.map(({ lineNum, colNum, errorLevel, message }) => {
          return `\t${lineNum}:${colNum} ${errorLevel} ${message}`;
        }).join('\n');
        const testString = fileName.endsWith('.test.js') ? `\nnpm test ${fileName.split('/').at(-1)}` : '';
        return `${acc}${fileName}\n${errorLines}${testString}\n\n`;
      }, '')
  );
}

