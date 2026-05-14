import {useMemo, useState} from "react";
import {tools} from "../data/tools";
import type {FileNode} from "../types/fileTree";
import type {ToolRun} from "../types/toolRuns";
import type {ToolDefinition, ToolId} from "../types/tools";

export type ToolRunnerState = {
  activeTool: ToolDefinition;
  activeToolId: ToolId;
  runTool: (targetNode: FileNode | null | undefined) => void;
  setActiveToolId: (toolId: ToolId) => void;
  tasks: ToolRun[];
};

export function useToolRunner(): ToolRunnerState {
  const [activeToolId, setActiveToolId] = useState<ToolId>("pdf-to-ppt");
  const [tasks, setTasks] = useState<ToolRun[]>([]);

  const activeTool = useMemo(() => {
    return tools.find((tool) => tool.id === activeToolId) ?? tools[0];
  }, [activeToolId]);

  function runTool(targetNode: FileNode | null | undefined) {
    if (!targetNode) {
      return;
    }

    const nextTask: ToolRun = {
      id: `task-${Date.now()}`,
      title: activeTool.fields[1]?.defaultValue || activeTool.name,
      tool: activeTool.name,
      target: targetNode.path,
      status: "ready",
      time: "Now",
    };

    setTasks((currentTasks) => [nextTask, ...currentTasks]);
  }

  return {
    activeTool,
    activeToolId,
    runTool,
    setActiveToolId,
    tasks,
  };
}
