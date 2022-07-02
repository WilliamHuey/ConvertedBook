export class ProjectPackageJson {
  constructor(name: string) {
    Object.assign(this, {
      name: name || 'placeholder-name',
      version: '1.0.0',
      description: '',
      main: 'index.js',
      author: '',
      license: 'ISC',
      dependencies: {
        "@emotion/css": "^11.9.0",
        "@linaria/cli": "^3.0.0-beta.21",
        "@linaria/shaker": "^3.0.0-beta.21",
        "dom-walk": "^0.1.2",
        "latex.css": "^1.7.1",
        "lit": "^2.2.6",
        "lookpath": "^1.2.2",
        "vite": "^2.9.12"
      },
      scripts: {
        "dev": "vite -d",
        "build": "vite build",
        "preview": "vite preview"
      },
    });
  }
}
