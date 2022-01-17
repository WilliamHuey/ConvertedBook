import '@kor-ui/kor'
import { LitElement, html } from 'lit';

let registerWebComponents = () => {
  class ConvertedBookAppBar extends LitElement {

    render() {
      return html`${document
        .createRange()
        .createContextualFragment(`
           <kor-app-bar slot="top" label="Table of Contents"></kor-app-bar>
          `)
        }`;
    }
  }

  // Register the app bar
  customElements.define('converted-book-app-bar', ConvertedBookAppBar);

  // Create the app bar
  let convertedBookAppBar = document.createElement('converted-book-app-bar');

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

// Creat the web components
document.addEventListener('DOMContentLoaded', () => {
  registerWebComponents();
});
