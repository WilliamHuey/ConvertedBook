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
        snowpack: '^3.8.8',
        "latex.css": "^1.5.0",
        '@snowpack/plugin-sass': '^1.4.0',
        "lookpath": "^1.2.2",
      },
      scripts: {
        start: 'snowpack dev',
      },
    });
  }
}
