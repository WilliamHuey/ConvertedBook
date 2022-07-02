import { LitElement, css, unsafeCSS, html } from 'lit';
import { property } from 'lit/decorators.js';
import { injectGlobal } from '@emotion/css'
import walk from "dom-walk";

import { default as globalStyles } from "./styles/global.js";

// Forced reload the page when this file changes to ensure that
// style changes are picked up. The web component can not
// be registered on the page once it is already defined.
if (window.customElements.get('convertedbook-app-bar')) {
  location.reload();
}

// Global styles
const myStyle = injectGlobal`${globalStyles}`;
document.body.classList.add(myStyle);

class ConvertedBookAppBar extends LitElement {

  static stylesPrefix: string = 'convertedbook';

  static styles = css`

    :host {
      display: flex;
      justify-content: end;
      width: 100%;
      top: 1rem;
      position: sticky;
      margin-bottom: 1rem;
      font-family: "JetBrains Mono",monospace;
      max-width: 100%;
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-interactions {
      padding: 1rem 2rem;
      border-radius: 0.25rem;
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-button {
      align-items: center;
      appearance: none;
      background-color: #FCFCFD;
      border-radius: 0.25rem;
      border-width: 0;
      box-shadow: rgba(45, 35, 66, 0.4) 0 2px 4px,rgba(45, 35, 66, 0.3) 0 7px 13px -3px,#D6D6E7 0 -3px 0 inset;
      box-sizing: border-box;
      color: #36395A;
      cursor: pointer;
      display: inline-flex;
      min-height: 2rem;
      justify-content: center;
      line-height: 1;
      list-style: none;
      padding-left: 1rem;
      padding-right: 1rem;
      position: relative;
      text-align: left;
      text-decoration: none;
      transition: box-shadow .15s,transform .15s;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      white-space: nowrap;
      will-change: box-shadow,transform;
      font-size: 0.8rem;
      font-weight: bold;
      max-width: 100%;
      width: 100%;
      white-space: normal;
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-button:before {
      content: "► ";
      white-space: pre;
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-button.opened:before {
      content: "▼ ";
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-button:focus {
      box-shadow: #D6D6E7 0 0 0 1.5px inset, rgba(45, 35, 66, 0.4) 0 2px 4px, rgba(45, 35, 66, 0.3) 0 7px 13px -3px, #D6D6E7 0 -3px 0 inset;
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-button:hover {
      box-shadow: rgba(45, 35, 66, 0.4) 0 4px 8px, rgba(45, 35, 66, 0.3) 0 7px 13px -3px, #D6D6E7 0 -3px 0 inset;
      transform: translateY(-2px);
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-button:active {
      box-shadow: #D6D6E7 0 3px 7px inset;
      transform: translateY(2px);
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-table-of-contents-container {
      max-height: 45%;
      font-size: 0.75rem;
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-table-of-contents-container a {
      display: inline-block;
      margin-bottom: 0.25rem;
      padding: 0.125rem;
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-table-of-contents-container nav > ul ul {
      margin-left: 1rem;
    }

    #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-table-of-contents-container nav ul {
      padding-left: 0;
    }

    a {
      background-color: white;
      border: 1px solid gray;
      border-radius: 0.125rem;
    }

    a,
    a:visited {
      text-decoration: none;
      position: relative;
      color: #069;
    }

    a:after,
    a:visited:after {
      content: "";
      height: 3px;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0%;
      background: #069;
      transition: 0.2s;
    }

    a:hover:after,
    a:visited:hover:after {
      width: 100%;
    }

    a.block,
    a:visited.block {
      display: block;
      padding: 0.5em;
    }

    a.block:hover,
    a:visited.block:hover {
      background: #eee;
    }

    title {
      background-color: red;
    }

    @media (max-width: 280px) {
      #${unsafeCSS(ConvertedBookAppBar.stylesPrefix)}-interactions {
        padding: 0;
      }
    }
  `;

  @property({ type: Boolean })
  open: boolean = false;

  constructor() {
    super();
  }

  render() {
    const containerVisibility = this.open ? "opened" : "collapsed";

    return html`${document
      .createRange()
      .createContextualFragment(`
          <div id="convertedbook-interactions">
            <div id="convertedbook-nav">
              <button id="convertedbook-button" class=${containerVisibility}>
                Table of Contents
              </button>
            </div>
            <div id="convertedbook-table-of-contents-container" class=${containerVisibility}
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

let registerWebComponents = () => {

  // Register the app bar
  customElements.define('convertedbook-app-bar', ConvertedBookAppBar);

  // Create the app bar
  let convertedBookAppBar = document.createElement('convertedbook-app-bar');

  // Insert the app bar into body
  document.body.insertBefore(convertedBookAppBar, document.body.firstChild);
}

// Add Hot Module Reload functionality here:
if (import.meta.hot) {

  // Data restoration upon a completion of reload
  import.meta.hot.accept(({ module }) => {

  })

  // Data to save before a reload
  import.meta.hot.dispose(() => {


  })
}

// Create the web components
document.addEventListener('DOMContentLoaded', () => {
  registerWebComponents();
});


export { ConvertedBookAppBar };