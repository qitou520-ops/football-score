import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { shouldUseDatabase } from "@/lib/db/is-enabled";
import { requireAdmin } from "@/lib/admin/auth";

const schema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, "新密码至少 6 位"),
});

export async function POST(request: NextRequest) {
  try {
    const user = requireAdmin(request);
    const body = schema.parse(await request.json());

    if (!shouldUseDatabase()) {
      return NextResponse.json(
        {
          error: "文件模式下请修改环境变量 ADMIN_PASSWORD，修改后重启服务",
        },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: user.sub } });
    if (!admin) {
      return NextResponse.json({ error: "管理员不存在" }, { status: 404 });
    }

    const valid = await bcrypt.compare(body.currentPassword, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "当前密码错误" }, { status: 401 });
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await bcrypt.hash(body.newPassword, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "修改失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
