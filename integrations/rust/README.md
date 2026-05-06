# ChuQin Rust Integration

This crate is a thin Rust integration layer for the ChuQin Python toolkit.

Scope:
- resolve the ChuQin config path
- read and write `config.toml`
- prepare future Rust wrappers around the Python CLI

Non-goals:
- reimplement ChuQin core logic in Rust
- define a schema separate from Python

The Python implementation in `app/` remains the single source of truth.
