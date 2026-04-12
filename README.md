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

ChuQin 是一个基于 PyWebview + Vue 3 + OpenTiny 的桌面 Agent 助手。
它支持：

- 桌面聊天界面
- 读取环境变量 `ChuQIN_DIR/resources/skills` 下的 skills
- 在对话时按需勾选 skill 作为上下文
- 对带入口脚本的本地 skill 进行真实执行
- 将执行产出的 PNG 图表转成 base64 后直接回显到界面
- 配置 `OPENAI_API_KEY` 后接入 OpenAI 兼容接口
- 未配置模型时以离线占位模式运行，便于先调通桌面应用

## Requirements

- Python 3.11+
- Node.js 20+
- pnpm 或 npm

## Dependencies

- [Python](https://www.python.org)
- [pywebview](https://pywebview.flowrl.com)

## Environment

可选环境变量：

- `CHUQIN_DIR`: ChuQin 工作空间根目录，程序会优先读取这个变量
- `ChuQIN_DIR`: 兼容旧写法，作用同上
- `OPENAI_API_KEY`: 启用在线模型
- `OPENAI_MODEL`: 默认 `gpt-4o-mini`
- `OPENAI_BASE_URL`: 默认 `https://api.openai.com/v1`

也支持把配置写到 `CHUQIN_DIR/.chuqin/config.toml`：

```toml
[openai]
api_key = ""
model = "gpt-4o-mini"
base_url = "https://api.openai.com/v1"

[volcengine]
ak = ""
sk = ""
visual_host = "visual.volcengineapi.com"
region = "cn-north-1"
video_req_key = "jimeng_t2v_v30"
```

Windows 下如果路径里有 `\`，不要直接写成普通 TOML 字符串，例如：

```toml
[paths]
skills_dir = "C:\Users\akka\OneDrive\resources\skills" # 这会报错
```

请改成下面任意一种：

```toml
[paths]
skills_dir = "C:\\Users\\akka\\OneDrive\\resources\\skills"
```

```toml
[paths]
skills_dir = 'C:\Users\akka\OneDrive\resources\skills'
```

```toml
[paths]
skills_dir = "C:/Users/akka/OneDrive/resources/skills"
```

优先级：

1. 环境变量
2. `CHUQIN_DIR/.chuqin/config.toml`
3. 内置默认值

## CLI

In addition to the desktop application, ChuQin also provides a `chuqin` command-line tool. It is useful for calling individual capabilities directly from the terminal, wiring ChuQin into scripts, or handling lightweight tasks without opening the GUI.

The current CLI is built with `Typer` and follows a grouped command structure:

```bash
chuqin <group> <resource> <action>
```

For example:

```bash
chuqin version
chuqin volcengine video gen "一只橘猫在海边奔跑"
chuqin gitee repo list
```

The CLI and desktop app share the same configuration system. By default, the CLI reads from `CHUQIN_DIR/.chuqin/config.toml`; if `CHUQIN_DIR` is not set, it falls back to the current user's home directory.

The CLI is a good fit for:

- running a single ChuQin capability directly from the terminal
- integrating ChuQin into shell scripts or automation workflows
- verifying configuration without launching the desktop app
- extending ChuQin with new command groups as the project grows

The currently available command areas include:

- `version`: show the installed version
- `volcengine video`: video generation commands
- `gitee repo`: Gitee repository commands

See the CLI docs for commands, options, and examples:

- [CLI Documentation](./docs/cli/README.md)

## Skill Execution

当前版本已经内置一条最小可执行 skill 链路：

- 在界面中选择或自动识别本地输入文件
- Python 侧真实调用 skill 目录中的入口脚本
- 文本结果回显到界面
- 生成的 PNG 图表会转成 base64 后展示在界面中

当前兼容以下入口约定，按顺序匹配：

- `run(file_path, run_dir)` 或 `run(file_path=..., run_dir=...)`
- `main(file_path, run_dir)` 或 `main(file_path=..., run_dir=...)`
- 旧版兼容：`summarize_csv(file_path)`

也就是说，现有 `csv-data-summarizer` 这类 skill 还能继续跑，但运行时本身不再绑定 CSV 专用方法名。

执行结果默认优先写入：

1. `CHUQIN_DIR/.chuqin/runs`
2. 当前项目目录下的 `.chuqin/runs`
3. `/tmp/chuqin-runs`

## Development

安装 Python 依赖：

```bash
pip install -e ".[dev]"
```

安装前端依赖：

```bash
cd portal
pnpm install
```

构建前端：

```bash
cd portal
pnpm build
```

启动桌面应用：

```bash
python app/main.py
```

## Skills Layout

`$ChuQIN_DIR/resources/skills` 支持两种形式：

- 每个 skill 一个目录，优先读取其中的 `SKILL.md`
- 直接放置 `.md` 或 `.txt` 文件

## Packaging

构建桌面应用：

```bash
python build.py
```
