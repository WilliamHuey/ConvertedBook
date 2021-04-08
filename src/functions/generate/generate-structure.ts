export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        .gitignore
        /config
          /styles
            index.scss
          /templates
            default.html5
          main.js
        /plugins
          latex.js
        /content
          index.tex
        index.html
        package.json
        snowpack.config.js
    */
    Object.assign(this, {
      folders: [
        {
          name: 'config',
          content: {
            folders: [
              {
                name: 'styles',
                content: {
                  files: [
                    {
                      name: 'index.module.scss'
                    }
                  ]
                }
              },
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
            ],
            files: [
              {
                name: 'main.js',
                fileContent: 'indexJs'
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
            files: [
              {
                name: 'index.tex',
                fileContent: 'indexTex',
              },
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
          name: 'index.html',
          fileContent: 'indexHtml'
        },
        {
          name: 'package.json',
          fileContent: 'packageJson',
          data: { projectName }
        },
        {
          name: 'snowpack.config.js',
          fileContent: 'snowpack'
        },
      ],
    });
  }
}
