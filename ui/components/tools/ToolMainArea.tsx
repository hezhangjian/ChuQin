import {useEffect, useMemo, useRef, useState, type ReactNode} from "react";
import {ToolForm} from "./ToolForm";
import type {ToolRun} from "../../types/toolRuns";
import type {ToolDefinition} from "../../types/tools";

type ToolMainAreaProps = {
  tasks: ToolRun[];
  tool: ToolDefinition;
  onRun: () => void;
};

export function ToolMainArea({tasks, tool, onRun}: ToolMainAreaProps) {
  return (
    <section className="tool-main-area" aria-label={`${tool.name} main area view`}>
      <div className="tool-main-area-header">
        <div className="tool-main-area-icon" aria-hidden="true">
          {tool.icon}
        </div>
        <div>
          <p>{tool.family}</p>
          <h1>{tool.name}</h1>
          <span>{tool.summary}</span>
        </div>
      </div>

      {isInteractiveTool(tool.id) ? (
        <InteractiveTool tool={tool}/>
      ) : (
        <CommandTool tasks={tasks} tool={tool} onRun={onRun}/>
      )}
    </section>
  );
}

function CommandTool({tasks, tool, onRun}: ToolMainAreaProps) {
  return (
    <div className="tool-main-area-grid">
      <section className="tool-main-area-form" aria-label={`${tool.name} settings`}>
        <div className="pane-heading">
          <h2>Settings</h2>
          <span>Built-in</span>
        </div>
        <div className="tool-main-area-form-body">
          <ToolForm ctaLabel={`Run ${tool.name}`} tool={tool} onRun={onRun}/>
        </div>
      </section>

      <section className="tool-main-area-notes" aria-label={`${tool.name} context`}>
        <div className="pane-heading">
          <h2>Context</h2>
          <span>ChuQin root</span>
        </div>
        <div className="tool-note-list">
          <article>
            <strong>Inputs</strong>
            <span>Use selected files from the file explorer as visible context.</span>
          </article>
          <article>
            <strong>Output</strong>
            <span>Generated files should land back in CHUQIN_DIR.</span>
          </article>
          <article>
            <strong>Command</strong>
            <span>{tool.command}</span>
          </article>
        </div>
      </section>

      <TaskQueue tasks={tasks} tool={tool}/>
    </div>
  );
}

function InteractiveTool({tool}: {tool: ToolDefinition}) {
  switch (tool.id) {
    case "gitlab-batch":
      return <GitLabBatchTool/>;
    case "excalidraw":
      return <SketchTool/>;
    case "git-config":
      return <GitConfigTool/>;
    case "json-format":
      return <JsonTool/>;
    case "md5":
      return <Md5Tool/>;
    case "url-codec":
      return <UrlCodecTool/>;
    case "hex-codec":
      return <HexCodecTool/>;
    case "timestamp":
      return <TimestampTool/>;
    case "huawei-token":
      return <HuaweiTokenTool/>;
    default:
      return null;
  }
}

type GitLabProject = {
  id: number;
  path_with_namespace: string;
  name: string;
  web_url: string;
  branches_count: number;
  protected_branches_count: number;
  open_merge_requests_count: number;
  open_issues_count: number;
  last_activity_at: string;
  star_count: number;
  fork_count: number;
};

type BatchAction =
  "fetch-info"
  | "clone-all"
  | "delete-branches"
  | "create-branch"
  | "protect-branch"
  | "unprotect-branch";

function GitLabBatchTool() {
  const [gitlabUrl, setGitlabUrl] = useState("https://gitlab.com");
  const [token, setToken] = useState("");
  const [projectIds, setProjectIds] = useState("1,2,3");
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<BatchAction>("fetch-info");
  const [branchName, setBranchName] = useState("feature/new-feature");
  const [actionResult, setActionResult] = useState<string | null>(null);

  async function fetchProjectInfo(projectId: string): Promise<GitLabProject | null> {
    const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}`;
    const res = await fetch(url, {headers: {"PRIVATE-TOKEN": token}});
    if (!res.ok) return null;
    const data = await res.json();
    const branchesRes = await fetch(`${url}/repository/branches?per_page=100`, {
      headers: {"PRIVATE-TOKEN": token},
    });
    const branches = branchesRes.ok ? await branchesRes.json() : [];
    const protectedRes = await fetch(`${url}/protected_branches?per_page=100`, {
      headers: {"PRIVATE-TOKEN": token},
    });
    const protectedBranches = protectedRes.ok ? await protectedRes.json() : [];
    return {
      id: data.id,
      path_with_namespace: data.path_with_namespace,
      name: data.name,
      web_url: data.web_url,
      branches_count: branches.length,
      protected_branches_count: protectedBranches.length,
      open_merge_requests_count: data.open_merge_requests_count ?? 0,
      open_issues_count: data.open_issues_count ?? 0,
      last_activity_at: data.last_activity_at,
      star_count: data.star_count ?? 0,
      fork_count: data.forks_count ?? 0,
    };
  }

  async function handleFetchInfo() {
    setLoading(true);
    setError(null);
    setActionResult(null);
    const ids = projectIds.split(/[\s,]+/).filter(Boolean);
    const results: GitLabProject[] = [];
    for (const id of ids) {
      const project = await fetchProjectInfo(id);
      if (project) results.push(project);
    }
    setProjects(results);
    setSelectedProjects(new Set());
    setLoading(false);
    if (results.length === 0) setError("未获取到任何项目信息");
    else setActionResult(`成功获取 ${results.length} 个项目信息`);
  }

  function toggleProject(id: number) {
    const newSet = new Set(selectedProjects);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedProjects(newSet);
  }

  function toggleAll() {
    if (selectedProjects.size === projects.length) setSelectedProjects(new Set());
    else setSelectedProjects(new Set(projects.map((p) => p.id)));
  }

  async function executeBatchAction() {
    if (selectedProjects.size === 0) {
      setError("请先选择项目");
      return;
    }
    setLoading(true);
    setError(null);
    const selected = projects.filter((p) => selectedProjects.has(p.id));
    const results: string[] = [];
    for (const project of selected) {
      const url = `${gitlabUrl}/api/v4/projects/${project.id}`;
      try {
        if (action === "delete-branches") {
          const branchesRes = await fetch(`${url}/repository/branches?per_page=100`, {
            headers: {"PRIVATE-TOKEN": token},
          });
          const branches = await branchesRes.json();
          const defaultBranch = branches.find((b: {default: boolean}) => b.default)?.name ?? "main";
          for (const branch of branches) {
            if (branch.name !== defaultBranch && !branch.protected) {
              await fetch(`${url}/repository/branches/${encodeURIComponent(branch.name)}`, {
                method: "DELETE",
                headers: {"PRIVATE-TOKEN": token},
              });
            }
          }
          results.push(`${project.path_with_namespace}: 已删除非保护分支`);
        } else if (action === "create-branch") {
          const res = await fetch(`${url}/repository/branches?branch=${encodeURIComponent(branchName)}&ref=main`, {
            method: "POST",
            headers: {"PRIVATE-TOKEN": token},
          });
          if (res.ok) results.push(`${project.path_with_namespace}: 创建分支 ${branchName}`);
          else results.push(`${project.path_with_namespace}: 创建分支失败`);
        } else if (action === "protect-branch") {
          const res = await fetch(`${url}/protected_branches?name=${encodeURIComponent(branchName)}`, {
            method: "POST",
            headers: {"PRIVATE-TOKEN": token},
          });
          if (res.ok) results.push(`${project.path_with_namespace}: 保护分支 ${branchName}`);
          else results.push(`${project.path_with_namespace}: 保护分支失败`);
        } else if (action === "unprotect-branch") {
          const res = await fetch(`${url}/protected_branches/${encodeURIComponent(branchName)}`, {
            method: "DELETE",
            headers: {"PRIVATE-TOKEN": token},
          });
          if (res.ok) results.push(`${project.path_with_namespace}: 取消保护 ${branchName}`);
          else results.push(`${project.path_with_namespace}: 取消保护失败`);
        }
      } catch (e) {
        results.push(`${project.path_with_namespace}: 操作失败 - ${String(e)}`);
      }
    }
    setActionResult(results.join("\n"));
    setLoading(false);
    if (action === "delete-branches") handleFetchInfo();
  }

  const cloneCommands = projects
    .filter((p) => selectedProjects.has(p.id))
    .map((p) => `git clone ${gitlabUrl}/${p.path_with_namespace}.git`)
    .join("\n");

  return (
    <section className="utility-panel utility-panel-wide" aria-label="GitLab batch tool">
      <div className="pane-heading">
        <h2>GitLab批量处理</h2>
        <span>{loading ? "处理中..." : "就绪"}</span>
      </div>
      <div className="utility-body">
        <div className="field-stack">
          <TextField label="GitLab服务器" value={gitlabUrl} onChange={setGitlabUrl}/>
          <TextField label="Access Token" type="password" value={token} onChange={setToken}/>
          <TextArea label="项目ID列表（逗号分隔）" value={projectIds} onChange={setProjectIds}/>
          <button className="run-button" disabled={loading || !token} onClick={handleFetchInfo} type="button">
            获取项目信息
          </button>
        </div>
        {error && <p style={{color: "#a1262f"}}>{error}</p>}
        {actionResult && <pre className="command-preview">{actionResult}</pre>}
        {projects.length > 0 && (
          <>
            <div className="pane-heading" style={{marginTop: 14}}>
              <h2>项目列表</h2>
              <span>{projects.length} 个项目</span>
            </div>
            <div className="item-list" style={{maxHeight: 320, overflow: "auto"}}>
              <div className="main-area-item" style={{background: "#f5f5f6"}}>
                <input
                  checked={selectedProjects.size === projects.length}
                  onChange={toggleAll}
                  style={{width: 16, height: 16}}
                  type="checkbox"
                />
                <strong style={{fontSize: 0.8 + "rem"}}>全选</strong>
                <span></span>
              </div>
              {projects.map((project) => (
                <div className="main-area-item" key={project.id} style={{cursor: "pointer"}}>
                  <input
                    checked={selectedProjects.has(project.id)}
                    onChange={() => toggleProject(project.id)}
                    style={{width: 16, height: 16}}
                    type="checkbox"
                  />
                  <div>
                    <strong>{project.path_with_namespace}</strong>
                    <small>
                      分支: {project.branches_count} | 保护: {project.protected_branches_count} |
                      MR: {project.open_merge_requests_count} | Issues: {project.open_issues_count}
                    </small>
                  </div>
                  <a href={project.web_url} rel="noreferrer" style={{fontSize: 0.75 + "rem"}} target="_blank">
                    打开
                  </a>
                </div>
              ))}
            </div>
            <div style={{marginTop: 14, display: "grid", gap: 10}}>
              <div className="segmented-control">
                {(["fetch-info", "clone-all", "delete-branches", "create-branch", "protect-branch", "unprotect-branch"] as BatchAction[]).map((a) => (
                  <button className={action === a ? "active" : ""} disabled={loading} key={a}
                          onClick={() => setAction(a)} type="button">
                    {a === "fetch-info" ? "刷新信息" : a === "clone-all" ? "批量Clone" : a === "delete-branches" ? "删除分支" : a === "create-branch" ? "创建分支" : a === "protect-branch" ? "保护分支" : "取消保护"}
                  </button>
                ))}
              </div>
              {action !== "fetch-info" && action !== "clone-all" && action !== "delete-branches" && (
                <TextField label="分支名称" value={branchName} onChange={setBranchName}/>
              )}
              {action === "clone-all" && selectedProjects.size > 0 && (
                <ResultBlock label="Clone命令" value={cloneCommands}/>
              )}
              {action !== "fetch-info" && action !== "clone-all" && (
                <button className="run-button" disabled={loading || selectedProjects.size === 0}
                        onClick={executeBatchAction} type="button">
                  执行批量操作 ({selectedProjects.size} 个项目)
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SketchTool() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#242629");
  const [lineWidth, setLineWidth] = useState(4);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function pointerPosition(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    const position = pointerPosition(event);

    if (!context) {
      return;
    }

    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(position.x, position.y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.buttons !== 1) {
      return;
    }

    const context = event.currentTarget.getContext("2d");
    const position = pointerPosition(event);

    if (!context) {
      return;
    }

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = mode === "eraser" ? lineWidth * 3 : lineWidth;
    context.strokeStyle = mode === "eraser" ? "#ffffff" : color;
    context.lineTo(position.x, position.y);
    context.stroke();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <section className="utility-panel utility-panel-wide" aria-label="Sketch canvas">
      <div className="utility-toolbar">
        <div className="segmented-control" aria-label="Drawing mode">
          <button className={mode === "pen" ? "active" : ""} onClick={() => setMode("pen")} type="button">
            Pen
          </button>
          <button
            className={mode === "eraser" ? "active" : ""}
            onClick={() => setMode("eraser")}
            type="button"
          >
            Eraser
          </button>
        </div>
        <label className="inline-control">
          Color
          <input value={color} onChange={(event) => setColor(event.target.value)} type="color"/>
        </label>
        <label className="inline-control">
          Size
          <input
            max="18"
            min="1"
            onChange={(event) => setLineWidth(Number(event.target.value))}
            type="range"
            value={lineWidth}
          />
        </label>
        <button className="secondary-button" onClick={clearCanvas} type="button">
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="sketch-canvas"
        height={620}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        width={1100}
      />
    </section>
  );
}

function GitConfigTool() {
  const [name, setName] = useState("Your Name");
  const [email, setEmail] = useState("you@example.com");
  const [scope, setScope] = useState<"global" | "local">("global");
  const flag = scope === "global" ? "--global " : "";
  const output = [
    `git config ${flag}user.name "${escapeDoubleQuotes(name)}"`,
    `git config ${flag}user.email "${escapeDoubleQuotes(email)}"`,
    `git config ${flag}--list`,
  ].join("\n");

  return (
    <UtilityTwoColumn
      left={
        <>
          <TextField label="User name" value={name} onChange={setName}/>
          <TextField label="User email" value={email} onChange={setEmail}/>
          <div className="segmented-control" aria-label="Git config scope">
            <button className={scope === "global" ? "active" : ""} onClick={() => setScope("global")} type="button">
              Global
            </button>
            <button className={scope === "local" ? "active" : ""} onClick={() => setScope("local")} type="button">
              Local
            </button>
          </div>
        </>
      }
      right={<ResultBlock label="Git commands" value={output}/>}
    />
  );
}

function JsonTool() {
  const [input, setInput] = useState('{"name":"ChuQin","tools":["json","md5","url"]}');
  const [indent, setIndent] = useState(2);
  const result = useMemo(() => {
    try {
      return {ok: true, value: JSON.stringify(JSON.parse(input), null, indent)};
    } catch (error) {
      return {ok: false, value: error instanceof Error ? error.message : String(error)};
    }
  }, [input, indent]);

  return (
    <UtilityTwoColumn
      left={
        <>
          <TextArea label="JSON input" value={input} onChange={setInput}/>
          <label className="inline-control">
            Indent
            <input
              max="8"
              min="0"
              onChange={(event) => setIndent(Number(event.target.value))}
              type="range"
              value={indent}
            />
          </label>
        </>
      }
      right={<ResultBlock label={result.ok ? "Formatted JSON" : "Validation error"} value={result.value}/>}
    />
  );
}

function Md5Tool() {
  const [input, setInput] = useState("ChuQin");
  const digest = useMemo(() => md5(input), [input]);

  return (
    <UtilityTwoColumn
      left={<TextArea label="Input text" value={input} onChange={setInput}/>}
      right={<ResultBlock label="MD5 digest" value={digest}/>}
    />
  );
}

function UrlCodecTool() {
  const [input, setInput] = useState("https://example.com/search?q=ChuQin 工具");
  const encoded = useMemo(() => encodeURIComponent(input), [input]);
  const decoded = useMemo(() => {
    try {
      return decodeURIComponent(input);
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  }, [input]);

  return (
    <UtilityTwoColumn
      left={<TextArea label="URL or text" value={input} onChange={setInput}/>}
      right={
        <>
          <ResultBlock label="Encoded" value={encoded}/>
          <ResultBlock label="Decoded" value={decoded}/>
        </>
      }
    />
  );
}

function HexCodecTool() {
  const [input, setInput] = useState("ChuQin");
  const textToHex = useMemo(() => {
    return Array.from(new TextEncoder().encode(input))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join(" ");
  }, [input]);
  const hexToText = useMemo(() => {
    try {
      const bytes = input
        .replace(/^0x/i, "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .flatMap((part) => (part.length > 2 ? part.match(/.{1,2}/g) ?? [] : [part]))
        .map((part) => Number.parseInt(part, 16));

      if (bytes.some((byte) => Number.isNaN(byte) || byte < 0 || byte > 255)) {
        return "Invalid hex input";
      }

      return new TextDecoder().decode(new Uint8Array(bytes));
    } catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
  }, [input]);

  return (
    <UtilityTwoColumn
      left={<TextArea label="Text or hex" value={input} onChange={setInput}/>}
      right={
        <>
          <ResultBlock label="Text to HEX" value={textToHex}/>
          <ResultBlock label="HEX to text" value={hexToText}/>
        </>
      }
    />
  );
}

function TimestampTool() {
  const nowSeconds = Math.floor(Date.now() / 1000).toString();
  const [timestamp, setTimestamp] = useState(nowSeconds);
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 19));
  const parsedTimestamp = Number(timestamp.length === 13 ? Number(timestamp) : Number(timestamp) * 1000);
  const timestampDate = Number.isFinite(parsedTimestamp) ? new Date(parsedTimestamp) : null;
  const dateValue = new Date(dateTime);
  const output = [
    `Local: ${timestampDate && !Number.isNaN(timestampDate.valueOf()) ? timestampDate.toLocaleString() : "Invalid timestamp"}`,
    `ISO: ${timestampDate && !Number.isNaN(timestampDate.valueOf()) ? timestampDate.toISOString() : "Invalid timestamp"}`,
    `Seconds: ${!Number.isNaN(dateValue.valueOf()) ? Math.floor(dateValue.valueOf() / 1000) : "Invalid date"}`,
    `Milliseconds: ${!Number.isNaN(dateValue.valueOf()) ? dateValue.valueOf() : "Invalid date"}`,
  ].join("\n");

  return (
    <UtilityTwoColumn
      left={
        <>
          <TextField label="Unix timestamp" value={timestamp} onChange={setTimestamp}/>
          <TextField label="Date time" type="datetime-local" value={dateTime} onChange={setDateTime}/>
        </>
      }
      right={<ResultBlock label="Converted time" value={output}/>}
    />
  );
}

function HuaweiTokenTool() {
  const [domain, setDomain] = useState("your-domain");
  const [username, setUsername] = useState("your-user");
  const [password, setPassword] = useState("");
  const [project, setProject] = useState("cn-north-4");
  const payload = JSON.stringify(
    {
      auth: {
        identity: {
          methods: ["password"],
          password: {
            user: {
              name: username,
              password: password || "<password>",
              domain: {name: domain},
            },
          },
        },
        scope: {project: {name: project}},
      },
    },
    null,
    2,
  );
  const curl = [
    "curl -i -X POST https://iam.myhuaweicloud.com/v3/auth/tokens \\",
    "  -H 'Content-Type: application/json' \\",
    `  -d '${payload.replace(/'/g, "'\\''")}'`,
  ].join("\n");

  return (
    <UtilityTwoColumn
      left={
        <>
          <TextField label="Domain name" value={domain} onChange={setDomain}/>
          <TextField label="Username" value={username} onChange={setUsername}/>
          <TextField label="Password" type="password" value={password} onChange={setPassword}/>
          <TextField label="Project/region" value={project} onChange={setProject}/>
        </>
      }
      right={
        <>
          <ResultBlock label="IAM payload" value={payload}/>
          <ResultBlock label="Token request" value={curl}/>
        </>
      }
    />
  );
}

function UtilityTwoColumn({left, right}: {left: ReactNode; right: ReactNode}) {
  return (
    <div className="utility-grid">
      <section className="utility-panel">
        <div className="pane-heading">
          <h2>Input</h2>
          <span>Local</span>
        </div>
        <div className="utility-body">{left}</div>
      </section>
      <section className="utility-panel">
        <div className="pane-heading">
          <h2>Result</h2>
          <span>Ready</span>
        </div>
        <div className="utility-body result-stack">{right}</div>
      </section>
    </div>
  );
}

function TextField({
                     label,
                     onChange,
                     type = "text",
                     value,
                   }: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)}/>
    </label>
  );
}

function TextArea({
                    label,
                    onChange,
                    value,
                  }: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)}/>
    </label>
  );
}

function ResultBlock({label, value}: {label: string; value: string}) {
  async function copyResult() {
    await navigator.clipboard.writeText(value);
  }

  return (
    <article className="result-block">
      <div>
        <strong>{label}</strong>
        <button onClick={copyResult} type="button">
          Copy
        </button>
      </div>
      <pre>{value}</pre>
    </article>
  );
}

function TaskQueue({tasks, tool}: {tasks: ToolRun[]; tool: ToolDefinition}) {
  return (
    <section className="task-queue" aria-label={`${tool.name} results`}>
      <div className="pane-heading">
        <h2>Results</h2>
        <span>{tasks.length}</span>
      </div>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <article className="task-row" key={task.id}>
            <span className={`status-pill ${task.status}`}>{task.status}</span>
            <div>
              <strong>{task.title}</strong>
              <small>{task.tool}</small>
            </div>
          </article>
        ))
      ) : (
        <p className="empty-results">No runs yet.</p>
      )}
    </section>
  );
}

function isInteractiveTool(toolId: ToolDefinition["id"]) {
  return [
    "gitlab-batch",
    "excalidraw",
    "git-config",
    "json-format",
    "md5",
    "url-codec",
    "hex-codec",
    "timestamp",
    "huawei-token",
  ].includes(toolId);
}

function escapeDoubleQuotes(value: string) {
  return value.replace(/"/g, '\\"');
}

function md5(input: string) {
  const message = new TextEncoder().encode(input);
  const originalBitLength = message.length * 8;
  const paddedLength = (((message.length + 8) >> 6) + 1) << 6;
  const buffer = new Uint8Array(paddedLength);
  const words = new Uint32Array(buffer.buffer);

  buffer.set(message);
  buffer[message.length] = 0x80;
  words[paddedLength / 4 - 2] = originalBitLength;

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  const s = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  const k = Array.from({length: 64}, (_, index) =>
    Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32),
  );

  for (let offset = 0; offset < words.length; offset += 16) {
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i += 1) {
      let f = 0;
      let g = 0;

      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const temp = d;
      const rotate = s[Math.floor(i / 16) * 4 + (i % 4)];
      const sum = (a + f + k[i] + words[offset + g]) >>> 0;
      d = c;
      c = b;
      b = (b + leftRotate(sum, rotate)) >>> 0;
      a = temp;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  return [a0, b0, c0, d0]
    .flatMap((word) => [word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, word >>> 24])
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function leftRotate(value: number, shift: number) {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0;
}
