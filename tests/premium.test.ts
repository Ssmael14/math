import { describe, expect, it } from "vitest";
import {
  addDaysUtc,
  addMonthsUtc,
  hasPremiumAccess,
  premiumStatus,
} from "@/lib/premium";

const now = new Date("2026-06-02T12:00:00.000Z");

describe("premium access", () => {
  it("blocks free users even if a date exists", () => {
    expect(
      hasPremiumAccess({
        plan: "FREE",
        premiumUntil: new Date("2026-07-02T12:00:00.000Z"),
      }),
    ).toBe(false);
  });

  it("allows premium users with a future expiration", () => {
    expect(
      hasPremiumAccess(
        {
          plan: "PREMIUM",
          premiumUntil: new Date("2026-07-02T12:00:00.000Z"),
        },
        now,
      ),
    ).toBe(true);
  });

  it("allows manually activated premium users without an expiration date", () => {
    expect(
      hasPremiumAccess(
        {
          plan: "PREMIUM",
          premiumUntil: null,
        },
        now,
      ),
    ).toBe(true);
    expect(
      premiumStatus(
        {
          plan: "PREMIUM",
          premiumUntil: null,
        },
        now,
      ),
    ).toBe("active");
  });

  it("treats expired premium as expired", () => {
    expect(
      premiumStatus(
        {
          plan: "PREMIUM",
          premiumUntil: new Date("2026-06-01T12:00:00.000Z"),
        },
        now,
      ),
    ).toBe("expired");
  });

  it("marks access expiring within seven days", () => {
    expect(
      premiumStatus(
        {
          plan: "FAMILY",
          premiumUntil: new Date("2026-06-08T12:00:00.000Z"),
        },
        now,
      ),
    ).toBe("expiring_soon");
  });

  it("adds months using UTC month arithmetic", () => {
    expect(addMonthsUtc(now, 3).toISOString()).toBe("2026-09-02T12:00:00.000Z");
  });

  it("adds days using UTC date arithmetic", () => {
    expect(addDaysUtc(now, 1).toISOString()).toBe("2026-06-03T12:00:00.000Z");
  });
});
