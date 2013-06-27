#Topdoc

A tool for generating usage guides for css.

##Installation

Install with npm.  It's meant to be command line tool, so you probably want to install it globally (with `-g`).

```bash
npm install -g topdoc
```

##Usage

Specify a source directory with `-s` or `--source`.  Defaults to `src/`.

```bash
topdoc -s release/css/
```

Specify a destination with `-d` or `--destination`.  Defaults to `docs/`.