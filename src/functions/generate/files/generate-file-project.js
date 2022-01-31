import { css } from '@linaria/core';
import { default as globalStyles } from "./global.js";

export const globals = css`
  :global() {
    ${globalStyles}
  }
`;