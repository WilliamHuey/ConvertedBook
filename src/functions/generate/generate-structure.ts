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
        snowpack: '^2.17.1',
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
  mount: {
    "site": "/"
  }
};
`;

const sampleTex = `
\\documentclass{article}

\\usepackage[margin=0.5in]{geometry}
\\title{Tex}
\\date{}

\\begin{document}
\\maketitle

\\section{Introduction}

\\end{document}
`;

export class GenerateStructureOutline {
  constructor(projectName: string) {
    /*
      /project-name
        .gitignore
        /config
          /latex
            .gitkeep
        /content
          /latex
            sample.tex
          /site
            favicon.ico
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
                      name: '.gitkeep',
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
                name: 'site',
              },
              {
                name: 'latex',
                content: {
                  files: [
                    {
                      name: 'sample.tex',
                      fileContent: sampleTex,
                    },
                  ],
                },
              },
            ],
            files: [
              {
                name: 'favicon.ico',
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
