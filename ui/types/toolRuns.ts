export type ToolRunStatus = "completed" | "ready" | "queued";

export type ToolRun = {
  id: string;
  title: string;
  tool: string;
  target: string;
  status: ToolRunStatus;
  time: string;
};
