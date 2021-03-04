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
        snowpack: '^3.0.13',

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

const childProcess = require('child_process'),
  path = require('path'),
  { spawn } = childProcess;

const textExtWithDot = '.tex';

module.exports = function (_snowpackConfig, _pluginOptions) {
  return {
    name: 'latex',
    load() { },
    resolve: { input: [textExtWithDot], output: ['.html'] },
    onChange: ({ filePath }) => {
      const lastCharIndex = filePath.length - 1,
        texExtIndex = filePath.lastIndexOf(textExtWithDot),
        texFileChange = (lastCharIndex - textExtWithDot.length + 1) ===
          texExtIndex;

      // Only allow changes from .tex file to be made or else html
      // and other changes will get pick up causing an endless loop
      if (!texFileChange) return;

      const cwd = process.cwd()

      const ls = spawn('convertedbook',
        ['build', 'html', '-i',
          path.join(cwd, '/config/latex/index.tex'), '-o',
          path.join(cwd, '/index.html')])

      ls.stdout.on('error', (error) => {
        console.log(error);
      });
    }
  };
};


`;

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

</body>
</html>
`;

export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        .gitignore
        /config
          /latex
            index.tex
        /site
          .gitkeep
        /plugins
          latex.js
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
                name: 'latex',
                content: {
                  files: [
                    {
                      name: 'index.tex',
                      fileContent: indexTex,
                    },
                  ],
                },
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
          name: '.gitignore',
          fileContent: gitignore,
        },
        {
          name: 'index.html',
          fileContent: indexHtml
        },
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
    });
  }
}
