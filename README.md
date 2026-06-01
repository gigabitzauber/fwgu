# Forked win-get-updates

Third party CLI frontend for [winget](https://en.wikipedia.org/wiki/Windows_Package_Manager) update runs. It lets you interactively choose which package to install.

<img src="./pics/example.jpg" alt="Example screenshot of forked win-get-updates in action" width="650px" />

This is a fork of [win-get-updates](https://github.com/JanMosigItemis/wgu).

## Requirements

Windows with [winget](https://en.wikipedia.org/wiki/Windows_Package_Manager) installed. Supposed to run on cmd.exe.

## Install

```
npm install -g win-get-updates
```

## Run

### Global

```
fwgu
```

### Local development

```
node src\cli.js
```

## Ignore File

fwgu supports ignoring specific packages from the update list using an ignore file.

### Default Location

By default, fwgu loads package IDs to ignore from `~/.fwguignore` (in your home directory). If this file doesn't exist, all packages will be shown.

### Custom Ignore File

You can specify a custom ignore file using the `--ignore-file` option:

```
fwgu --ignore-file C:\path\to\myignore.txt
```

### Format

The ignore file should contain one package ID per line. Package IDs are matched case-insensitively.

Example `.fwguignore`:

```
# Packages I want to update manually
Microsoft.VisualStudioCode
Node.js

# System packages
Microsoft.WindowsTerminal
```

- Lines starting with `#` are treated as comments and ignored
- Empty lines are ignored
- Leading and trailing whitespace is automatically trimmed

## Update dependencies

- Run once:

```
npm install -g npm-check-updates
```

- Run every time:

```
ncu -c 3 --peer -ui
```
