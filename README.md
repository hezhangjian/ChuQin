# ChuQin

![License](https://img.shields.io/badge/license-Apache2.0-green)

English | [简体中文](README_CN.md)

**ChuQin** is an AI-native personal assistant.

## Cli

In addition to the desktop application, ChuQin also provides a `chuqin` command-line tool. It is useful for calling individual capabilities directly from the terminal.

See the Cli [docs](./docs/cli/README.md) for details.

## Working Directory

ChuQin supports an optional `root_path` as its working directory.

- By default, `root_path` uses the current user's home directory.
- You can override it with the `CHUQIN_DIR` environment variable.

## Requirements

- Python 3.11+

## Dependencies

- [Python](https://www.python.org)
- [pywebview](https://pywebview.flowrl.com)
