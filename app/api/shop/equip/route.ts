// app/api/shop/equip/route.ts — equipar/desequipar accesorio
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveChild } from "@/lib/queries";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const child = await getActiveChild();
  if (!child) return NextResponse.json({ error: "no child" }, { status: 401 });

  const limited = rateLimit(`shop:equip:${child.id}`, 40, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || !("itemId" in body) || typeof body.itemId !== "string") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const itemId = body.itemId;
  const owned = await prisma.inventory.findUnique({
    where: { childId_itemId: { childId: child.id, itemId } },
    include: { item: true },
  });
  if (!owned || !owned.item.isActive) {
    return NextResponse.json({ error: "item_not_owned" }, { status: 404 });
  }
  if (owned.item.kind !== "ACCESSORY") {
    return NextResponse.json({ error: "item_not_equippable" }, { status: 400 });
  }

  // Desequipar todos los accesorios y equipar éste
  await prisma.$transaction([
    prisma.inventory.updateMany({
      where: { childId: child.id, item: { kind: "ACCESSORY" } },
      data: { equipped: false },
    }),
    prisma.inventory.update({
      where: { childId_itemId: { childId: child.id, itemId } },
      data: { equipped: true },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
