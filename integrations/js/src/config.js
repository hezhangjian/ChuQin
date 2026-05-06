import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import TOML from "toml";

const CONFIG_ENV_VAR = "CHUQIN_DIR";
const CONFIG_DIR_NAME = ".chuqin";
const CONFIG_FILE_NAME = "config.toml";

function resolveRootDir() {
  const envRoot = (process.env[CONFIG_ENV_VAR] || "").trim();
  return envRoot ? path.resolve(envRoot) : os.homedir();
}

export function getConfigDir() {
  return path.join(resolveRootDir(), CONFIG_DIR_NAME);
}

export function getConfigPath() {
  return path.join(getConfigDir(), CONFIG_FILE_NAME);
}

function getString(value) {
  return typeof value === "string" ? value : "";
}

function getSection(data, key) {
  const value = data[key];
  return value && typeof value === "object" ? value : {};
}

function defaultConfig() {
  return {
    openai: { model: "", base_url: "", api_key: "" },
    huaweicloud: { username: "", password: "", project_id: "" },
    volcengine: { ak: "", sk: "" },
    github: { token: "" },
    gitee: { token: "" },
    gitcode: { token: "" }
  };
}

export function loadConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return defaultConfig();
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const data = TOML.parse(raw);
  const openai = getSection(data, "openai");
  const huaweicloud = getSection(data, "huaweicloud");
  const volcengine = getSection(data, "volcengine");
  const github = getSection(data, "github");
  const gitee = getSection(data, "gitee");
  const gitcode = getSection(data, "gitcode");

  return {
    openai: {
      model: getString(openai.model),
      base_url: getString(openai.base_url),
      api_key: getString(openai.api_key)
    },
    huaweicloud: {
      username: getString(huaweicloud.username),
      password: getString(huaweicloud.password),
      project_id: getString(huaweicloud.project_id)
    },
    volcengine: {
      ak: getString(volcengine.ak),
      sk: getString(volcengine.sk)
    },
    github: {
      token: getString(github.token)
    },
    gitee: {
      token: getString(gitee.token)
    },
    gitcode: {
      token: getString(gitcode.token)
    }
  };
}

function tomlString(value) {
  return JSON.stringify(typeof value === "string" ? value : "");
}

export function saveConfig(config) {
  fs.mkdirSync(getConfigDir(), { recursive: true });

  const lines = [
    "[openai]",
    `model = ${tomlString(config.openai?.model)}`,
    `base_url = ${tomlString(config.openai?.base_url)}`,
    `api_key = ${tomlString(config.openai?.api_key)}`,
    "",
    "[huaweicloud]",
    `username = ${tomlString(config.huaweicloud?.username)}`,
    `password = ${tomlString(config.huaweicloud?.password)}`,
    `project_id = ${tomlString(config.huaweicloud?.project_id)}`,
    "",
    "[volcengine]",
    `ak = ${tomlString(config.volcengine?.ak)}`,
    `sk = ${tomlString(config.volcengine?.sk)}`,
    "",
    "[github]",
    `token = ${tomlString(config.github?.token)}`,
    "",
    "[gitee]",
    `token = ${tomlString(config.gitee?.token)}`,
    "",
    "[gitcode]",
    `token = ${tomlString(config.gitcode?.token)}`,
    ""
  ];

  const configPath = getConfigPath();
  fs.writeFileSync(configPath, `${lines.join("\n")}\n`, "utf8");
  return configPath;
}
