export type NodeType = "file" | "folder";

export interface BaseNode {
  id: string;
  type: NodeType;
  name: string;
}

export interface FileNode extends BaseNode {
  type: "file";
}

export interface FolderNode extends BaseNode {
  type: "folder";
  children: FileSystemNode[];
}

export type FileSystemNode = FileNode | FolderNode;

export interface ContextMenu {
  show: boolean;
  x: number;
  y: number;
  data: null | FileSystemNode;
};
