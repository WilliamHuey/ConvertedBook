Convertedbook
=================

![Logo](https://github.com/WilliamHuey/ConvertedBook/raw/main/assets/convertedbook-banner.png)


[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

A live reload server previewer for working with LaTeX documents. Syncs document changes to a web page in the browser to visualize rendered changes.

You have the option to convert your LaTeX files to these output formats:

* HTML
* PDF
* EPUB

<!-- tocheader -->
<strong><h1>Table of Contents</h1></strong>

<!-- tocheaderstop -->

<!-- toc -->
* [Purpose](#purpose)
* [Dependencies](#dependencies)
* [Compatibility](#compatibility)
* [Installation](#installation)
* [Quick Start](#quick-start)
* [Commands](#commands)
* [Development / Local Install](#development--local-install)
* [Project Structure](#project-structure)
* [Tests](#tests)
* [Notes](#notes)
* [License](#license)
<!-- tocstop -->

<!-- purpose -->
# Purpose

Here is a listing of reasons for why you might want to use this tool

* Render your LaTeX document in the way that is represented in your HTML for predictability in output
* Quicker preview of the changes you make in your LaTeX document using the browser
* Control over the rendering of the final document rendering when custom css through the convertedbook project folder

<!-- purposestop -->

# Dependencies

Ensure that you have the requisite software before installing convertedbook

* [pandoc](https://pandoc.org/installing.html)
* [nodejs](https://nodejs.org/en/download)
* [texlive](https://tug.org/texlive/) (extra font packages might be needed)
  * You can substitute
  *  textlive with [MikTeX](https://miktex.org/download)
  for a more minimal install of LaTeX dependencies

# Compatibility

This library was developed and tested only on Linux and Windows.
It will most likely work on MacOs because the dependencies are relatively standard.

The versions of dependencies listed below are known to work with this library

* pandoc - v3.7.0.2
* nodejs - v24.1.0
* pdfTeX (from texlive) - 3.141592653-2.6-1.40.27

# Installation

Install convertedbook with npm globally for use as a general cli tool. 

<!-- usage -->
```sh-session
$ npm install -g convertedbook
$ convertedbook COMMAND
running command...
$ convertedbook (--version)
convertedbook/1.0.1 linux-x64 node-v24.7.0
$ convertedbook --help [COMMAND]
USAGE
  $ convertedbook COMMAND
...
```
<!-- usagestop -->

<!-- usagealternative -->

## Tarball Install

Alternatively, you can use the convertedbook binary through the tarball
without having nodejs installed. Download, extract and execute the binary.

``` sh-session
tar -xzvf <convertedbook-filename>.tar.gz -C "$(basename convertedbook-filename.tar.gz .tar.gz)"

./bin/convertedbook
```
<!-- usagealternativestop -->

<!-- quickstartusage -->
# Quick Start

After installing convertedbook,

Create your project

``` bash
convertedbook generate my-new-project
cd my-new-project
```

Navigate into the newly created project folder and run the server.
Make changes to the src/index.tex file to see the live preview changes.

``` bash
convertedbook serve
```

The index.html file serves as the default output. If you want to output
into a different file format, you can use the build command to
change the output file type.

There is no need to specify the input file path because it is inferred from the
within a project folder

``` bash
convertedbook build pdf
```

<!-- quickstartusagestop -->

# Commands
<!-- commands -->
* [`convertedbook b [DESCRIPTION]`](#convertedbook-b-description)
* [`convertedbook build [DESCRIPTION]`](#convertedbook-build-description)
* [`convertedbook g NAME`](#convertedbook-g-name)
* [`convertedbook generate NAME`](#convertedbook-generate-name)
* [`convertedbook help [COMMAND]`](#convertedbook-help-command)
* [`convertedbook s`](#convertedbook-s)
* [`convertedbook serve`](#convertedbook-serve)
* [`convertedbook server`](#convertedbook-server)

## `convertedbook b [DESCRIPTION]`

Convert the LaTeX file to HTML, EPUB or PDF. This command works with either a convertedbook project folder or on a single LaTeX file outside a project folder.

```
USAGE
  $ convertedbook b [DESCRIPTION...] [-h] [-f] [-e] [-i <value>] [-o <value>] [-d] [--port <value>]

ARGUMENTS
  DESCRIPTION...  Generate output format of your choosing from these following formats: html, pdf, and epub

FLAGS
  -d, --dry-run         Test out the build command to see cli output without generating the actual output file(s)
  -e, --exact           Only for pdf output. Generate pdf based on html instead of using Pandoc
  -f, --force           Overwrite an existing output file
  -h, --help            Show CLI help.
  -i, --input=<value>   Path of the input file to convert
  -o, --output=<value>  Path of the output file destination
      --port=<value>    Build server port

DESCRIPTION
  Convert the LaTeX file to HTML, EPUB or PDF. This command works with either a convertedbook project folder or on a
  single LaTeX file outside a project folder.

ALIASES
  $ convertedbook b

EXAMPLES
  One-off build - Operate on an LaTeX file that resides
  outside of a project folder.

  This outputs to an html file and assumes that destination file resides in
  the same location as the input file. The input option is required

    $ convertedbook b html --input="./index.tex"

  One-off build - Can specify an "exact" option for the
  output pdf file to use playwright to get an precise mirror representation
  of the document based on the web page display of the document.

    $ convertedbook b pdf --input="./index.tex" --exact
```

## `convertedbook build [DESCRIPTION]`

Convert the LaTeX file to HTML, EPUB or PDF. This command works with either a convertedbook project folder or on a single LaTeX file outside a project folder.

```
USAGE
  $ convertedbook build [DESCRIPTION...] [-h] [-f] [-e] [-i <value>] [-o <value>] [-d] [--port <value>]

ARGUMENTS
  DESCRIPTION...  Generate output format of your choosing from these following formats: html, pdf, and epub

FLAGS
  -d, --dry-run         Test out the build command to see cli output without generating the actual output file(s)
  -e, --exact           Only for pdf output. Generate pdf based on html instead of using Pandoc
  -f, --force           Overwrite an existing output file
  -h, --help            Show CLI help.
  -i, --input=<value>   Path of the input file to convert
  -o, --output=<value>  Path of the output file destination
      --port=<value>    Build server port

DESCRIPTION
  Convert the LaTeX file to HTML, EPUB or PDF. This command works with either a convertedbook project folder or on a
  single LaTeX file outside a project folder.

ALIASES
  $ convertedbook b

EXAMPLES
  One-off build - Operate on an LaTeX file that resides
  outside of a project folder.

  This outputs to an html file and assumes that destination file resides in
  the same location as the input file. The input option is required

    $ convertedbook build html --input="./index.tex"

  One-off build - Can specify an "exact" option for the
  output pdf file to use playwright to get an precise mirror representation
  of the document based on the web page display of the document.

    $ convertedbook build pdf --input="./index.tex" --exact
```

_See code: [src/commands/build.ts](https://github.com/WilliamHuey/Convertedbook/blob/v1.0.1/src/commands/build.ts)_

## `convertedbook g NAME`

Create a new "convertedbook" project folder with files.

```
USAGE
  $ convertedbook g NAME [-h] [-n <value>] [-f] [-p <value>] [-d] [-t]

FLAGS
  -d, --dry-run                   Test out the generate command to see cli output without generating the actual project
                                  folder and files
  -f, --force                     Overwrite an existing folder
  -h, --help                      Show CLI help.
  -n, --name=<value>              Generate
  -p, --npm-project-name=<value>  Add the package.json's project name field
  -t, --toc                       When present, display the table of contents link on the top of the document

DESCRIPTION
  Create a new "convertedbook" project folder with files.

ALIASES
  $ convertedbook g

EXAMPLES
  Generate a project with the name of 'my-folder' and the package.json project key of 'a-projectname'

    $ convertedbook g my-folder --npm-project-name="a-projectname"

  Dry run of the command above for testing

    $ convertedbook g my-folder --npm-project-name="a-projectname" --dry-run
```

## `convertedbook generate NAME`

Create a new "convertedbook" project folder with files.

```
USAGE
  $ convertedbook generate NAME [-h] [-n <value>] [-f] [-p <value>] [-d] [-t]

FLAGS
  -d, --dry-run                   Test out the generate command to see cli output without generating the actual project
                                  folder and files
  -f, --force                     Overwrite an existing folder
  -h, --help                      Show CLI help.
  -n, --name=<value>              Generate
  -p, --npm-project-name=<value>  Add the package.json's project name field
  -t, --toc                       When present, display the table of contents link on the top of the document

DESCRIPTION
  Create a new "convertedbook" project folder with files.

ALIASES
  $ convertedbook g

EXAMPLES
  Generate a project with the name of 'my-folder' and the package.json project key of 'a-projectname'

    $ convertedbook generate my-folder --npm-project-name="a-projectname"

  Dry run of the command above for testing

    $ convertedbook generate my-folder --npm-project-name="a-projectname" --dry-run
```

_See code: [src/commands/generate.ts](https://github.com/WilliamHuey/Convertedbook/blob/v1.0.1/src/commands/generate.ts)_

## `convertedbook help [COMMAND]`

Display help for convertedbook.

```
USAGE
  $ convertedbook help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for convertedbook.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.32/src/commands/help.ts)_

## `convertedbook s`

Run a live server to view real-time updates on document changes in the browser. You must change into the directory of your convertedbook project before you are able to run this command. To change the server port, edit the port value in server-config.js.

```
USAGE
  $ convertedbook s [-h] [-n <value>] [-p <value>] [-o <value>]

FLAGS
  -h, --help             Show CLI help.
  -n, --name=<value>     Serve
  -o, --options=<value>  General options
  -p, --pandoc=<value>   Pandoc options

DESCRIPTION
  Run a live server to view real-time updates on document changes in the browser. You must change into the directory of
  your convertedbook project before you are able to run this command. To change the server port, edit the port value in
  server-config.js.


ALIASES
  $ convertedbook s
  $ convertedbook server

EXAMPLES
  $ convertedbook s
```

## `convertedbook serve`

Run a live server to view real-time updates on document changes in the browser. You must change into the directory of your convertedbook project before you are able to run this command. To change the server port, edit the port value in server-config.js.

```
USAGE
  $ convertedbook serve [-h] [-n <value>] [-p <value>] [-o <value>]

FLAGS
  -h, --help             Show CLI help.
  -n, --name=<value>     Serve
  -o, --options=<value>  General options
  -p, --pandoc=<value>   Pandoc options

DESCRIPTION
  Run a live server to view real-time updates on document changes in the browser. You must change into the directory of
  your convertedbook project before you are able to run this command. To change the server port, edit the port value in
  server-config.js.


ALIASES
  $ convertedbook s
  $ convertedbook server

EXAMPLES
  $ convertedbook serve
```

_See code: [src/commands/serve.ts](https://github.com/WilliamHuey/Convertedbook/blob/v1.0.1/src/commands/serve.ts)_

## `convertedbook server`

Run a live server to view real-time updates on document changes in the browser. You must change into the directory of your convertedbook project before you are able to run this command. To change the server port, edit the port value in server-config.js.

```
USAGE
  $ convertedbook server [-h] [-n <value>] [-p <value>] [-o <value>]

FLAGS
  -h, --help             Show CLI help.
  -n, --name=<value>     Serve
  -o, --options=<value>  General options
  -p, --pandoc=<value>   Pandoc options

DESCRIPTION
  Run a live server to view real-time updates on document changes in the browser. You must change into the directory of
  your convertedbook project before you are able to run this command. To change the server port, edit the port value in
  server-config.js.


ALIASES
  $ convertedbook s
  $ convertedbook server

EXAMPLES
  $ convertedbook server
```
<!-- commandsstop -->

<!-- developmentsheader -->
# Development / Local Install

  Clone this repository to your machine
  Change into root directory install dependencies

  ``` bash
  npm install
  ```

  Assuming you do not have ```convertedbook``` installed,
  you can

  ``` bash
  npm link
  ```

  to alias the ```convertedbook``` command to point to the source entry file for ease of reference.

  If you already have ```convertedbook``` installed through

  ``` bash
  npm install -g convertedbook
  ```

  then you will need to uninstall that first before using this development repository.


  Run the following build command once because the ```npm link``` convertedbook points to the dist
  folder files.

  This provides the commands for ```convertedbook```.

  ``` bash
  npm run build
  ```

  After making changes to source files run

  ``` bash
  npm run build
  ```

  for the ```convertedbook``` cli to pick up the changes.

<!-- developmentsheaderstop -->

<!-- projectstructure -->
# Project Structure

After you have run the convertedbook ```generate``` command it will create a npm project folder
which has the following contents

``` text
.
├── build
├── convert.js
├── node_modules
├── package.json
├── package-lock.json
├── server-config.js
├── server.js
└── src
    ├── config
    ├── helper.js
    ├── index.tex
    └── styles
```

## File Descriptions

The generated folder is a [Parcel](https://parceljs.org/) frontend application. You are given the ability
to customize any of the files used to create the HTML. The files that are bolded are recommended for modification.

* build - The output folder for serving contents (convertedbook server)
* convert.js - File which performs the conversion of LaTeX file to HTML for the preview server
* node_modules - Npm node modules folder for dependencies
* **package.json** - Npm package declaration file
* package-lock.json - Lock file for package.json file
* **server-config.js** - File to configure the server. Allows you to customize the port for the server.
* server.js - Starts the server
* src/ - Folder which stores the source LaTeX assets
* **config/templates/default.html5** - The template which pandoc uses for rendering the output to html for the server
* **helper.js** - JavaScript logic for the HTML
* **index.tex** - Main LaTeX source file
* **styles/global.js** - General styles file that you can add styles to customize the look of the page
* **styles/project.js** - Configuration for your global.js file
* **styles/vendor.css** - External css files you include in addition to the ones you define in the global.js file

Files that are auto-generated for this folder and shouldn't be modified directly:

* index.html - The main html file used by the live server

<!-- projectstructurestop -->

<!-- testsheader -->
# Tests

After making development changes, run the tests to ensure that existing functionalities are preserved.

``` bash
npm run test
```

To run tests for the ```build``` or ```generate``` commands selectively

``` bash
npm run test:build
npm run test:generate
```

Running the following command is the same as running the two commands above

``` bash
npm run test:nodownloads
```

Certain test will require you to be connected to the internet because
a converted project will require downloading npm modules.

``` bash
npm run test:downloads
```

For when you want to run download test specifically for certain commands

``` bash
npm run test:downloadbuild
npm run test:downloadgenerate
```
<!-- testsheaderstop -->

<!-- notesheader -->

# Notes

## Live LaTeX Preview Alternatives

* [Overleaf](https://github.com/overleaf/overleaf)
* [VSCode Extension - LaTeX-Workshop](https://github.com/James-Yu/LaTeX-Workshop)
* [Softcover](https://github.com/softcover/softcover)

Although there are other live preview solutions out there,
Convertedbook caters to a single user workflow that allows
you to customize your LaTeX project with the help of
Npm and HTML.

<!-- notesheaderstop -->

# License

MIT
