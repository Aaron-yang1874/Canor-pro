import type { NextRequest, NextResponse } from "next/server";

export type NextMiddleware = (
  request: NextRequest
) => NextResponse | Promise<NextResponse>;
