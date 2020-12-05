const splitLinesAuto = (string) => string.split(/\r\n?|\n/);

export default class TextDocument {
  constructor(textarea, firstLine = 0, lineSep) {
    this.first = firstLine;
    this.lineSep = lineSep;
    this.textarea = textarea;
  }

  getLines() {
    let text = this.textarea.value;
    if (typeof text === "string") text = this.splitLines(text);
    this.lines = text;
    this.size = text.length;
    return { lines: text, size: text.length };
  }

  lineFromPos = (p, text) => {
    let count = -1;
    for (var i = 0; i < p; i++) {
      if (text[i] === "\n") count++;
    }
    return count + 1;
  };

  lineAt(pos) {
    const { lines } = this.getLines();
    const line = this.lineFromPos(pos, this.textarea.value);
    if (typeof line !== "number" || line < 0 || line >= lines.length) {
      throw new Error("Illegal value for `line`");
    }
    return this.lines[line];
  }

  lineCount() {
    const { size } = this.getLines();
    return size;
  }

  firstLine() {
    return this.first;
  }

  lastLine() {
    const { size } = this.getLines();
    return this.first + size - 1;
  }

  splitLines(str) {
    if (this.lineSep) return str.split(this.lineSep);
    return splitLinesAuto(str);
  }

  lineSeparator() {
    return this.lineSep || "\n";
  }
}
