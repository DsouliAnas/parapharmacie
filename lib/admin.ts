import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RequireAdminSuccess {
  authorized: true;
  session: NonNullable<
    Awaited<ReturnType<typeof getServerSession>>
  >;
}

interface RequireAdminFailure {
  authorized: false;
  status: 401 | 403;
  error: string;
}

export type RequireAdminResult =
  | RequireAdminSuccess
  | RequireAdminFailure;

export async function requireAdmin(): Promise<RequireAdminResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authorized: false,
      status: 401,
      error: "Not authenticated",
    };
  }

  if (session.user.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden",
    };
  }

  return {
    authorized: true,
    session,
  };
}