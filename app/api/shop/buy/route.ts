// app/api/shop/buy/route.ts — comprar un item
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveChild } from "@/lib/queries";

export async function POST(req: Request) {
  const child = await getActiveChild();
  if (!child) return NextResponse.json({ error: "no child" }, { status: 401 });

  const { itemId } = await req.json();
  const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
  if (!item) return NextResponse.json({ error: "no item" }, { status: 404 });

  // Ya lo tiene
  const owned = await prisma.inventory.findUnique({
    where: { childId_itemId: { childId: child.id, itemId } },
  });
  if (owned) return NextResponse.json({ error: "owned" }, { status: 400 });

  if (item.kind === "ACCESSORY") {
    if (child.gems < item.price) return NextResponse.json({ error: "not enough gems" }, { status: 400 });
    await prisma.$transaction([
      prisma.child.update({ where: { id: child.id }, data: { gems: { decrement: item.price } } }),
      prisma.inventory.create({ data: { childId: child.id, itemId } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (item.kind === "HEARTS_REFILL") {
    if (child.gems < item.price) return NextResponse.json({ error: "not enough gems" }, { status: 400 });
    await prisma.child.update({
      where: { id: child.id },
      data: { gems: { decrement: item.price }, hearts: 5 },
    });
    return NextResponse.json({ ok: true });
  }

  // GEMS_PACK requeriría pasarela de pago real (Stripe). Stub:
  return NextResponse.json({ error: "needs payment provider" }, { status: 501 });
}
