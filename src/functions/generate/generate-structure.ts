class ProjectPackageJson {
  constructor(name: string) {
    Object.assign(this, {
      name: name || '<from cli input name>',
      version: '1.0.0',
      description: '',
      main: 'index.js',
      author: '',
      license: 'ISC',
      dependencies: {
        snowpack: '^3.0.11',

      },
      scripts: {
        start: 'snowpack dev',
      },
    });
  }
}

// Customize node project gitignore from
// https://github.com/github/gitignore/blob/master/Node.gitignore
const gitignore = `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Dependency directories
node_modules/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# dotenv environment variables file
.env
.env.test

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Generated content
build/
`;

const snowpack = `
module.exports = {
  plugins: [
    ['./plugins/latex.js', {/* pluginOptions */ }]
  ]
};
`;

const indexTex = `
\\documentclass{article}

\\usepackage[margin=0.5in]{geometry}
\\title{Tex}
\\date{}

\\begin{document}
\\maketitle

\\section{Introduction}

\\end{document}
`;

const latexPlugin = `
module.exports = function (snowpackConfig, pluginOptions) {
  return {
    name: 'latex',
    load() { },
    resolve: { input: [".tex"], output: [".html"] },
    onChange(change) {
      console.log('changed', change);
    }
  };
};
`;

export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        .gitignore
        /config
          /latex
            index.tex
        /content
          /site
            .gitkeep
          /plugins
            latex.js
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
                name: 'latex',
                content: {
                  files: [
                    {
                      name: 'index.tex',
                      fileContent: indexTex,
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          name: 'content',
          content: {
            folders: [
              {
                name: 'plugins',
                content: {
                  files: [
                    {
                      name: 'latex.js',
                      fileContent: latexPlugin
                    }
                  ]
                }
              },
              {
                name: 'site',
                content: {
                  files: [
                    {
                      name: '.gitkeep',
                    },
                  ],
                }
              },
            ],
            files: [
              {
                name: 'package.json',
                fileContent: JSON.stringify(
                  new ProjectPackageJson(projectName),
                  null,
                  4
                ),
              },
              {
                name: 'snowpack.config.js',
                fileContent: snowpack,
              },
            ],
          },
        },
      ],
      files: [
        {
          name: '.gitignore',
          fileContent: gitignore,
        },
      ],
    });
  }
}
