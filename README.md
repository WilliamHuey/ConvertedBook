ConvertedBook
=============

Convert latex to different ebook formats

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ConvertedBook.svg)](https://npmjs.org/package/ConvertedBook)
[![Downloads/week](https://img.shields.io/npm/dw/ConvertedBook.svg)](https://npmjs.org/package/ConvertedBook)
[![License](https://img.shields.io/npm/l/ConvertedBook.svg)](https://github.com/WilliamHuey/ConvertedBook/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g convertedbook
$ convertedbook COMMAND
running command...
$ convertedbook (-v|--version|version)
convertedbook/1.0.0 linux-x64 node-v15.0.0
$ convertedbook --help [COMMAND]
USAGE
  $ convertedbook COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`convertedbook build`](#convertedbook-build)
* [`convertedbook generate [FILE]`](#convertedbook-generate-file)
* [`convertedbook help [COMMAND]`](#convertedbook-help-command)

## `convertedbook build`

Generate output format of your choosing from these following formats: html, pdf, and epub

```
USAGE
  $ convertedbook build

OPTIONS
  -a, --args=args
  -d, --dry-run=dry-run
  -h, --help             show CLI help
  -i, --input=input
  -o, --output=output

EXAMPLE
  $ convertedbook build pdf
```

_See code: [src/commands/build.ts](https://github.com/WilliamHuey/ConvertedBook/blob/v1.0.0/src/commands/build.ts)_

## `convertedbook generate [FILE]`

describe the command here

```
USAGE
  $ convertedbook generate [FILE]

OPTIONS
  -f, --force
  -h, --help              show CLI help
  -n, --name=name         name to print
  -p ,--npm-project-name  project's npm project name
  -d, --dry-run           test out command without generating folder and files
  -t, --toc               when present, display table of contents for the document
```

_See code: [src/commands/generate.ts](https://github.com/WilliamHuey/ConvertedBook/blob/v1.0.0/src/commands/generate.ts)_

## `convertedbook help [COMMAND]`

display help for convertedbook

```
USAGE
  $ convertedbook help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->
