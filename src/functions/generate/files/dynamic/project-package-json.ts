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
        "@kor-ui/kor": "^1.9.1",
        "@linaria/cli": "^3.0.0-beta.15",
        "@linaria/shaker": "^3.0.0-beta.15",
        "@snowpack/plugin-run-script": "^2.3.0",
        "latex.css": "^1.5.0",
        "lit": "^2.1.1",
        "lookpath": "^1.2.2",
        "postcss": "^8.4.5",
        "postcss-cli": "^9.1.0",
        "postcss-import": "^14.0.2",
        "postcss-smart-asset": "^2.0.6",
        "snowpack": "^3.8.8"
      },
      scripts: {
        start: 'snowpack dev',
      },
    });
  }
}
