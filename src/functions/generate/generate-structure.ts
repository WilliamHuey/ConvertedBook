export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        .gitignore
        /config
          /templates
            default.html5
        /site
          .gitkeep
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
          name: 'site',
          content: {
            files: [
              {
                name: '.gitkeep'
              },
            ],
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
