import { LitElement, css, html } from 'lit';

import { injectGlobal } from '@emotion/css'
import { default as globalStyles } from "../styles/global.js";

// Global styles
const myStyle = injectGlobal`${globalStyles}`;
document.body.classList.add(myStyle);

// Please refresh the page manually if changes are made to the
// convertedbook web component since there aren't methods in the
// CustomElementRegistry for redefining or removing a registered web component

// https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry
let registerWebComponents = () => {
  class ConvertedBookAppBar extends LitElement {
    static styles = css`
      nav {
        text-transform: uppercase;
        top: 0;
        position: sticky;
        margin-bottom: 1rem;
      }
    `;

    @property({ type: Boolean })
    open: boolean = false;

    constructor() {
      super();
    }

    render() {
      return html`${document
        .createRange()
        .createContextualFragment(`
          <nav id="nav" class=${this.open}>
            <button id="button">
              Table of Contents
            </button>
          </nav>
        `)
        }`;
    }

    connectedCallback() {
      super.connectedCallback()
    }

    firstUpdated() {
      this.shadowRoot
        .addEventListener('click', () => {
          this._toggleMenu();
        });
    }

    _toggleMenu() {
      this.open = !this.open;
    }
  }

  // Register the app bar
  customElements.define('convertedbook-app-bar', ConvertedBookAppBar);

  // Create the app bar
  let convertedBookAppBar = document.createElement('convertedbook-app-bar');

  // Insert the app bar into body
  document.body.insertBefore(convertedBookAppBar, document.body.firstChild);
}

// Hot Module Reload
if (import.meta.hot) {

  // Data restoration upon a completion of reload
  import.meta.hot.accept(({ }) => {

    // Restore state on the new module.
  })

  // Data to save before a reload
  import.meta.hot.dispose(() => {
  })
}

// Create the web components
document.addEventListener('DOMContentLoaded', () => {
  registerWebComponents();
});
