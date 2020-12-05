import React from "react";
import Editor from "./Editor";
import "./styles.css";

function occurrenceCount(source, find) {
  return source.split(find).length - 1;
}

const excludedTags = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];

export default function App() {
  const [value, setValue] = React.useState(`const a = 1;
console.log(a);`);
  React.useEffect(() => {
    setTimeout(() => {
      setValue("const b = 2;");
    }, 1000);
  }, []);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <Editor
        value={value}
        options={{}}
        onChange={(e, textEditor) => {
          const { value, selectionStart } = e.target;
          const text = value.substring(0, selectionStart);
          const result = /<([a-zA-Z][a-zA-Z0-9:\-_.]*)(?:\s+[^<>]*?[^\s/<>=]+?)*?\s?(\/|>)$/.exec(
            text
          );
          if (
            result !== null &&
            occurrenceCount(result[0], "'") % 2 === 0 &&
            occurrenceCount(result[0], '"') % 2 === 0 &&
            occurrenceCount(result[0], "`") % 2 === 0
          ) {
            if (result[2] === ">") {
              if (excludedTags.indexOf(result[1].toLowerCase()) === -1) {
                textEditor
                  .edit((editBuilder) => {
                    editBuilder.insert("</" + result[1] + ">", selectionStart);
                  })
                  .then(() => {
                    textEditor.putCursorTo(selectionStart);
                  });
              }
            } else {
              if (
                value.length <= selectionStart ||
                value[selectionStart] !== ">"
              ) {
                // if not typing "/" just before ">", add the ">" after "/"
                textEditor.edit((editBuilder) => {
                  editBuilder.insert(">", selectionStart);
                });
              }
            }
          }
        }}
      />
    </div>
  );
}
