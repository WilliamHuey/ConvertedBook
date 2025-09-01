export class ProjectPackageJson {
  constructor(name: string) {
    Object.assign(this, {
      name: name || 'placeholder-name',
      version: '1.0.1',
      description: '',
      main: 'index.js',
      author: '',
      license: 'ISC',
      "targets": {
        "main": false
      },
      dependencies: {
        "@emotion/css": "^11.13.5",
        "@linaria/cli": "^5.0.4",
        "@linaria/shaker": "^5.0.3",
        "@parcel/config-default": "^2.14.4",
        "@parcel/core": "^2.14.4",
        "@parcel/watcher": "^2.5.1",
        "cross-spawn": "^7.0.6",
        "dom-walk": "^0.1.2",
        "latex.css": "^1.12.0",
        "lit": "^3.3.0",
        "lodash": "^4.17.21",
        "path-exists": "^5.0.0"
      },
      "type": "module"
    });
  }
}
