# Linty

Parse ESLint output to remove warnings and add test commands for easy copy-pasting.

## Installation

```sh
deno task compile
mv linty ~/.local/bin/linty
```

## Usage

```sh
eslint src/ --fix | linty
```
