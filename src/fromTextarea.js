import CodeOmega from "./model";

export default function fromTextarea(textarea, _options) {
  const options = _options || {};

  const omega = new CodeOmega(textarea, options);
  return omega;
}
