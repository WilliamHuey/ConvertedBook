// @ts-nocheck
import { css } from '@linaria/core';
import { default as globalStyles } from "./global.js";

const globals = css`
  :global() {
    ${globalStyles}
  }
`;

export default globals;