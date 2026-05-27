# ChuQin

![License](https://img.shields.io/badge/开源许可证-Apache2.0-green)

[English](README.md) | 简体中文

**ChuQin** 是一个围绕用户自有文件系统根目录构建的本地优先个人工作空间助手，帮助个人工作者在同一个桌面工作台中管理文件、项目、知识、对话、应用与可复用工作流。

它围绕该根目录提供沉浸式主区域体验，让文件、项目、知识与工作流保持有序、可见，并能通过集成工具区持续操作。

GUI 是 ChuQin 的主要交付形态，用于在可见上下文中进入个人工作空间，并复用各类工具能力。

CLI 提供桌面应用之外的命令行能力。

## 工作目录

ChuQin 会先使用环境变量 `CHUQIN_DIR` 作为文件系统根目录。如果没有设置 `CHUQIN_DIR`，会尝试读取
`~/.config/chuqin/config.toml` 中的 `workdir`，例如：

```toml
workdir = "/Users/akka/OneDrive"
```

如果两者都不可用，则回退到当前用户的主目录。

## 文档导航

文档按交付形态组织：

- **[CLI](./docs/cli/README.md)**：命令行能力、模块说明与使用方式。
- **[UI](./docs/ui/README.md)**：桌面应用概念、工作流与工具区文档。
