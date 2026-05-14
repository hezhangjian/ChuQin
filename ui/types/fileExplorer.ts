import type {FileNode} from "./fileTree";

export type FlatFileNode = FileNode & {
  depth: number;
};
