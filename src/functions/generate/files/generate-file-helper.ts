import { LitElement, css, unsafeCSS, html } from 'lit';
import { property } from 'lit/decorators.js';
import { injectGlobal } from '@emotion/css'
import walk from "dom-walk";

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
    static stylesPrefix: string = 'convertedbook';

    static styles = css`
      #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-interactions {
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
      const toggleMenuState = this.open ? 'opened' : 'collapsed';
      return html`${document
        .createRange()
        .createContextualFragment(`
          <div id="convertedbook-interactions">
            <div id="convertedbook-nav">
              <button id="convertedbook-button" class=${toggleMenuState}>
                Table of Contents
              </button>
            </div>
            <div id="convertedbook-table-of-contents-container" class=${toggleMenuState}
             >
            </div>
          </div>
        `)
        }`;
    }

    connectedCallback() {
      super.connectedCallback()
    }

    firstUpdated() {
      this.shadowRoot
        .addEventListener('click', (evt) => {
          const eventEl = (evt.target as HTMLButtonElement),
            elementType = eventEl.nodeName;
          if (elementType === 'BUTTON' &&
            eventEl.id === "convertedbook-button") {
            this._toggleMenu();
          }
        });
    }

    async _toggleMenu() {
      this.open = !this.open;
      await this.updateComplete;
      this._setUpTableOfContents();
    }

    _setUpTableOfContents() {
      if (this.open) {
        const originalToc = document.querySelectorAll('#TOC')[0];
        let clonedToc = originalToc.cloneNode(true);

        // Remove the id attributes from dom nodes from any of the
        // nodes from the 'table of contents' element to avoid
        // conflicts
        walk(clonedToc, function (node) {
          if (node.id)
            node.removeAttribute('id')
        });

        this.shadowRoot
          .getElementById('convertedbook-table-of-contents-container')
          .appendChild(clonedToc)
      }
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
