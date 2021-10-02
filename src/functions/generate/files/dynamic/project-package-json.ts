export class ProjectPackageJson {
  constructor(name: string) {
    Object.assign(this, {
      name: name || '<from cli input name>',
      version: '1.0.0',
      description: '',
      main: 'index.js',
      author: '',
      license: 'ISC',
      dependencies: {
        snowpack: '^3.8.3',
        '@snowpack/plugin-sass': '^1.4.0'
      },
      scripts: {
        start: 'snowpack dev',
      },
    });
  }
}
