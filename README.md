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
convertedbook/1.0.0 linux-x64 node-v14.15.3
$ convertedbook --help [COMMAND]
USAGE
  $ convertedbook COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`convertedbook build`](#convertedbook-build)
* [`convertedbook generate [FOLDERNAME]`](#convertedbook-generate-foldername)
* [`convertedbook help [COMMAND]`](#convertedbook-help-command)
* [`convertedbook serve [FILE]`](#convertedbook-serve-file)

## `convertedbook build`

Generate output format of your choosing from these following formats: html, pdf, and epub

```
USAGE
  $ convertedbook build

OPTIONS
  -a, --args=args
  -d, --dry-run=dry-run  test out the build command to see cli output without generating the actual output file(s)
  -h, --help             show CLI help
  -i, --input=input      path of the input file to convert
  -o, --output=output    path of the output file destination

ALIASES
  $ convertedbook b

EXAMPLE
  $ convertedbook build pdf
```

_See code: [src/commands/build.ts](https://github.com/WilliamHuey/ConvertedBook/blob/v1.0.0/src/commands/build.ts)_

## `convertedbook generate [FOLDERNAME]`

Create a "convertedbook" project folder.

```
USAGE
  $ convertedbook generate [FOLDERNAME]

OPTIONS
  -d, --dry-run                            test out the generate command to see cli output without generating the actual
                                           project folder and files

  -h, --help                               show CLI help

  -n, --name=name                          Generate

  -p, --npm-project-name=npm-project-name  add the package.json's project name field

  -t, --toc                                when present, display the table of contents link on the top of the document

ALIASES
  $ convertedbook g
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

## `convertedbook serve [FILE]`

describe the command here

```
USAGE
  $ convertedbook serve [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/serve.ts](https://github.com/WilliamHuey/ConvertedBook/blob/v1.0.0/src/commands/serve.ts)_
<!-- commandsstop -->
