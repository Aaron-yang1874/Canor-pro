export enum Role {
  Owner = "owner",
  Editor = "editor",
  Viewer = "viewer",
  Guest = "guest",
}

export enum Permission {
  CreateProject = "create_project",
  EditProject = "edit_project",
  DeleteProject = "delete_project",
  ShareProject = "share_project",
  ManageMembers = "manage_members",
  ExportProject = "export_project",
  ViewProject = "view_project",
  CommentProject = "comment_project",
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.Owner]: [
    Permission.CreateProject,
    Permission.EditProject,
    Permission.DeleteProject,
    Permission.ShareProject,
    Permission.ManageMembers,
    Permission.ExportProject,
    Permission.ViewProject,
    Permission.CommentProject,
  ],
  [Role.Editor]: [
    Permission.CreateProject,
    Permission.EditProject,
    Permission.ExportProject,
    Permission.ViewProject,
    Permission.CommentProject,
  ],
  [Role.Viewer]: [
    Permission.ViewProject,
    Permission.CommentProject,
  ],
  [Role.Guest]: [
    Permission.ViewProject,
  ],
};
