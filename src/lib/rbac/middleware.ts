import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { Permission } from "./types";
import { checkPermission } from "./permissions";
import { Role } from "./types";

export function withRbac(requiredPermission: Permission) {
  return function (
    handler: (request: NextRequest) => Promise<NextResponse>
  ): (request: NextRequest) => Promise<NextResponse> {
    return async (request: NextRequest) => {
      const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const token = authHeader.slice(7);
      const result = await verifyToken(token);

      if (!result.valid) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const userRole = (result.role || Role.Guest) as Role;
      const userId = result.userId;

      if (!checkPermission(userRole, requiredPermission)) {
        return NextResponse.json(
          {
            error: "Forbidden",
            required: requiredPermission,
            currentRole: userRole,
          },
          { status: 403 }
        );
      }

      (request as NextRequest & { userId?: string; userRole?: string }).userId = userId;
      (request as NextRequest & { userRole?: string }).userRole = userRole;

      return handler(request);
    };
  };
}
