export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        .gitignore
        /config
          /templates
            default.html5
        /plugins
          latex.js
        /content
          /styles
            index.scss
          index.tex
          main.js
        index.html
        package.json
        server.js
        snowpack.config.js
    */
    Object.assign(this, {
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
              },
              {
                name: 'main.js',
                fileContent: 'indexJs'
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
