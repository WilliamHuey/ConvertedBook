if (import.meta.hot) {

  // Data restoration upon a completion of reload
  import.meta.hot.accept(({ }) => {

    // Restore state on the new module.

  })

  // Data to save before a reload
  import.meta.hot.dispose(() => {
  })
}

import "latex.css";
import "../styles/index.module.scss";