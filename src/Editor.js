import * as React from "react";
import fromTextarea from "./fromTextarea";

export default class Editor extends React.Component {
  static defaultProps = {
    keyBindingFn: () => null
  };

  componentDidMount() {
    this.initEditor();

    this._editor.on("change", this.props.onChange);
    this.hydrate();
  }

  componentDidUpdate(prev) {
    if (this.props.value !== prev.value) {
      this.hydrate();
    }
  }

  componentWillUnmount() {
    if (this._editor) this._editor.dispose();
  }

  initEditor = () => {
    if (this._input.current) {
      this._editor = fromTextarea(this._input.current, {
        ...(this.props.options || {}),
        keyBindingFn: this.props.keyBindingFn
      });
    }
  };

  hydrate = () => {
    const editorVal = this._editor.getValue();
    if (this.props.value !== editorVal) {
      this._editor.edit((editBuilder) => {
        editBuilder.replace(this.props.value, 0, editorVal.length);
      });
    }
  };

  _input = React.createRef();

  render() {
    return (
      <div>
        <textarea ref={this._input} rows={10} />
      </div>
    );
  }
}
