// app/api/shop/equip/route.ts — equipar/desequipar accesorio
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveChild } from "@/lib/queries";

export async function POST(req: Request) {
  const child = await getActiveChild();
  if (!child) return NextResponse.json({ error: "no child" }, { status: 401 });

  const { itemId } = await req.json();

  // Desequipar todos los accesorios y equipar éste
  await prisma.$transaction([
    prisma.inventory.updateMany({ where: { childId: child.id }, data: { equipped: false } }),
    prisma.inventory.update({
      where: { childId_itemId: { childId: child.id, itemId } },
      data: { equipped: true },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
