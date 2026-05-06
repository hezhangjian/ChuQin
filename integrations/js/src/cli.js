#!/usr/bin/env node

import { getConfigPath, loadConfig } from "./config.js";

const command = process.argv[2] || "show";

if (command === "path") {
  console.log(getConfigPath());
  process.exit(0);
}

if (command === "show") {
  console.log(JSON.stringify(loadConfig(), null, 2));
  process.exit(0);
}

console.error(`Unsupported command: ${command}`);
process.exit(1);
