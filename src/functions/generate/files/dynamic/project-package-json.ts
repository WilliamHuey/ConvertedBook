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
        "@snowpack/plugin-sass": "^1.4.0",
        "latex.css": "^1.5.0",
        "lit": "^2.1.1",
        "lookpath": "^1.2.2",
        "snowpack": "^3.8.8"
      },
      scripts: {
        start: 'snowpack dev',
      },
    });
  }
}
