export type NodeType = "file" | "folder";

export interface BaseNode {
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