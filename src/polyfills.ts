import { Buffer } from "buffer";

window.global = window.global ?? window;
window.Buffer = window.Buffer ?? Buffer;
window.process = window.process ?? { env: {} };

export {};

//https://github.com/rainbow-me/rainbowkit/blob/main/examples/with-create-react-app/src/polyfills.ts
