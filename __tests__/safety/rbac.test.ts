import { Role, Permission } from "@/lib/rbac/types";
import { checkPermission, getPermissions, hasAnyPermission, hasAllPermissions } from "@/lib/rbac/permissions";

describe("RBAC Permissions", () => {
  describe("Owner Role", () => {
    const ownerRole = Role.Owner;

    test("Owner has all permissions", () => {
      const allPermissions = [
        Permission.CreateProject,
        Permission.EditProject,
        Permission.DeleteProject,
        Permission.ShareProject,
        Permission.ManageMembers,
        Permission.ExportProject,
        Permission.ViewProject,
        Permission.CommentProject,
      ];

      for (const perm of allPermissions) {
        expect(checkPermission(ownerRole, perm)).toBe(true);
      }
    });

    test("Owner can delete project", () => {
      expect(checkPermission(ownerRole, Permission.DeleteProject)).toBe(true);
    });

    test("Owner can manage members", () => {
      expect(checkPermission(ownerRole, Permission.ManageMembers)).toBe(true);
    });
  });

  describe("Editor Role", () => {
    const editorRole = Role.Editor;

    test("Editor cannot delete project", () => {
      expect(checkPermission(editorRole, Permission.DeleteProject)).toBe(false);
    });

    test("Editor cannot manage members", () => {
      expect(checkPermission(editorRole, Permission.ManageMembers)).toBe(false);
    });

    test("Editor can create and edit project", () => {
      expect(checkPermission(editorRole, Permission.CreateProject)).toBe(true);
      expect(checkPermission(editorRole, Permission.EditProject)).toBe(true);
    });

    test("Editor can export project", () => {
      expect(checkPermission(editorRole, Permission.ExportProject)).toBe(true);
    });
  });

  describe("Viewer Role", () => {
    const viewerRole = Role.Viewer;

    test("Viewer can only view and comment", () => {
      expect(checkPermission(viewerRole, Permission.ViewProject)).toBe(true);
      expect(checkPermission(viewerRole, Permission.CommentProject)).toBe(true);
    });

    test("Viewer cannot edit project", () => {
      expect(checkPermission(viewerRole, Permission.EditProject)).toBe(false);
    });

    test("Viewer cannot create project", () => {
      expect(checkPermission(viewerRole, Permission.CreateProject)).toBe(false);
    });

    test("Viewer cannot delete project", () => {
      expect(checkPermission(viewerRole, Permission.DeleteProject)).toBe(false);
    });

    test("Viewer cannot manage members", () => {
      expect(checkPermission(viewerRole, Permission.ManageMembers)).toBe(false);
    });

    test("Viewer cannot share project", () => {
      expect(checkPermission(viewerRole, Permission.ShareProject)).toBe(false);
    });
  });

  describe("Guest Role", () => {
    const guestRole = Role.Guest;

    test("Guest can only view", () => {
      expect(checkPermission(guestRole, Permission.ViewProject)).toBe(true);
    });

    test("Guest cannot comment", () => {
      expect(checkPermission(guestRole, Permission.CommentProject)).toBe(false);
    });

    test("Guest cannot edit project", () => {
      expect(checkPermission(guestRole, Permission.EditProject)).toBe(false);
    });

    test("Guest cannot create project", () => {
      expect(checkPermission(guestRole, Permission.CreateProject)).toBe(false);
    });

    test("Guest cannot delete project", () => {
      expect(checkPermission(guestRole, Permission.DeleteProject)).toBe(false);
    });
  });

  describe("getPermissions", () => {
    test("getPermissions returns all permissions for Owner", () => {
      const perms = getPermissions(Role.Owner);
      expect(perms).toHaveLength(8);
      expect(perms).toContain(Permission.DeleteProject);
      expect(perms).toContain(Permission.ManageMembers);
    });

    test("getPermissions returns limited permissions for Viewer", () => {
      const perms = getPermissions(Role.Viewer);
      expect(perms).toHaveLength(2);
      expect(perms).toContain(Permission.ViewProject);
      expect(perms).toContain(Permission.CommentProject);
    });

    test("getPermissions returns single permission for Guest", () => {
      const perms = getPermissions(Role.Guest);
      expect(perms).toHaveLength(1);
      expect(perms).toContain(Permission.ViewProject);
    });
  });

  describe("hasAnyPermission", () => {
    test("returns true if role has any of the permissions", () => {
      expect(hasAnyPermission(Role.Editor, [Permission.DeleteProject, Permission.EditProject])).toBe(true);
    });

    test("returns false if role has none of the permissions", () => {
      expect(hasAnyPermission(Role.Viewer, [Permission.DeleteProject, Permission.ManageMembers])).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    test("returns true if role has all permissions", () => {
      expect(hasAllPermissions(Role.Owner, [Permission.ViewProject, Permission.EditProject])).toBe(true);
    });

    test("returns false if role is missing some permissions", () => {
      expect(hasAllPermissions(Role.Viewer, [Permission.ViewProject, Permission.EditProject])).toBe(false);
    });
  });
});
