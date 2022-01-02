export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        .gitignore
        /plugins
          latex.js
        /content
          /config
            /templates
              default.html5
          /styles
            index.scss
          /javascript
            main.js
          index.tex
        index.html
        package.json
        server.js
        snowpack.config.js
    */
    Object.assign(this, {
      folders: [
        {
          name: 'plugins',
          content: {
            files: [
              {
                name: 'latex.js',
                fileContent: 'latexSnowpackPlugin'
              }
            ]
          }
        },
        {
          name: 'content',
          content: {
            folders: [
              {
                name: 'config',
                content: {
                  folders: [
                    {
                      name: 'templates',
                      content: {
                        files: [
                          {
                            name: 'default.html5',
                            fileContent: 'texHtml5Template'
                          }
                        ],
                      }
                    }
                  ]
                },
              },
              {
                name: 'javascript',
                content: {
                  files: [
                    {
                      name: 'main.js',
                      fileContent: 'indexJs'
                    }
                  ]
                }
              },
              {
                name: 'styles',
                content: {
                  files: [
                    {
                      name: 'index.module.scss',
                      fileContent: 'configStylesIndex'
                    }
                  ]
                }
              }
            ],
            files: [
              {
                name: 'index.tex',
                fileContent: 'indexTex',
              },
              {
                name: 'index.html',
                fileContent: 'indexHtml'
              }
            ],
          },
        }
      ],
      files: [
        {
          name: '.gitignore',
          fileContent: 'gitignore',
        },
        {
          name: 'package.json',
          fileContent: 'packageJson',
          data: { projectName }
        },
        {
          name: 'server.js',
          fileContent: 'server'
        },
        {
          name: 'snowpack.config.js',
          fileContent: 'snowpack'
        },
      ],
    });
  }
}
