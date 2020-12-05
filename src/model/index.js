import TextDocument from "./doc";
import { on, off } from "./event";

function isEventHandled(value) {
  return value === "handled" || value === true;
}

class TextEditorEdit {
  _collectedEdits = [];
  _finalized = false;

  finalize() {
    this._finalized = true;
    return {
      edits: this._collectedEdits
    };
  }

  _throwIfFinalized() {
    if (this._finalized) {
      throw new Error("Edit is only valid while callback runs");
    }
  }

  insert(value, from) {
    this._throwIfFinalized();
    const range = [from, from];
    this._pushEdit(range, value);
  }
  replace(value, from, to) {
    this._throwIfFinalized();
    const range = [from, to ? to : from];
    this._pushEdit(range, value);
  }
  delete(from, to) {
    this.replace("", from, to);
  }

  _pushEdit(range, text) {
    this._collectedEdits.push({
      range,
      text
    });
  }
}

export default class CodeOmega {
  _dispose = false;
  _listener = {};
  constructor(target, options) {
    this.options = options;
    this.textarea = target;

    let doc = options.value || "";
    doc = new TextDocument(target, null);
    this.doc = doc;
    // event handler
    on(this.textarea, "input", this._onInput);
    on(this.textarea, "keydown", this._onKeyDown);
  }

  _onInput = (e) => {
    const cb = this._listener["change"];
    if (cb) cb(e, this);
  };

  _onKeyDown = (e) => {
    const command = this.options.keyBindingFn(e);
    if (command == null || command === "") return;
    if (command === "undo") {
      return;
    }
    e.preventDefault();
    const cb = this._listener["keydown"];
    if (cb && isEventHandled(cb(e, this))) return;
    // run default command
  };

  on(event, cb) {
    if (this._listener[event]) return;
    this._listener[event] = cb;
  }

  dispose() {
    off(this.textarea, "input", this._onInput);
    off(this.textarea, "keydown", this._onKeyDown);
    this._dispose = true;
    this._listener = {};
  }

  getValue() {
    return this.textarea.value;
  }

  getDoc() {
    return this.doc;
  }

  edit(cb, options) {
    if (this._disposed) {
      return Promise.reject(
        new Error("CodeOmega#edit not possible on closed editors")
      );
    }
    const edit = new TextEditorEdit(this.doc, options);
    cb(edit);
    return this._applyEdit(edit);
  }

  _applyEdit(editBuilder) {
    const editData = editBuilder.finalize();
    editData.edits.forEach((edit) => {
      const [from, to] = edit.range;
      this.replaceText({ text: edit.text, from, to });
    });
    return Promise.resolve(null);
  }

  replaceText({ text, from, to }) {
    const textLeft = this.textarea.value.substring(0, from);
    const textRight = this.textarea.value.substring(to);
    this.textarea.value = `${textLeft}${text}${textRight}`;
    this.textarea.selectionEnd = from + text.length;
    this._onInput({ target: this.textarea });
  }

  select({ from, to, length }) {
    this.textarea.setSelectionRange(from, to || from + (length || 0));
  }

  putCursorTo(location) {
    this.textarea.selectionEnd = location || 0;
  }
}
