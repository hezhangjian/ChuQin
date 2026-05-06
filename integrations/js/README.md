# ChuQin JS Integration

This package is a thin Node.js integration layer for the ChuQin Python toolkit.

Scope:
- resolve the ChuQin config path
- read and write `config.toml`
- prepare future Node.js wrappers around the Python CLI

Non-goals:
- reimplement ChuQin core logic in JavaScript
- define a schema separate from Python

The Python implementation in `app/` remains the single source of truth.
