/* JWT tests need WebCrypto globals from Node, not the jsdom realm — the
   jsdom realm's Uint8Array fails jose's instanceof checks (cross-realm). */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { signSessionToken, verifySessionToken } from "@/app/lib/jwt";

/* The suite sets a throwaway secret so jwt.ts's lazy check passes. */
process.env.AUTH_SECRET =
  process.env.AUTH_SECRET ?? "test-secret-do-not-use-in-production";

const TEST_USER = {
  sub: "1",
  name: "Admin Demo",
  email: "admin@demo.com",
  role: "Admin",
  image: null,
};

describe("signSessionToken / verifySessionToken", () => {
  it("round-trips a signed token back into the same payload", async () => {
    const token = await signSessionToken(TEST_USER, 60);
    const payload = await verifySessionToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("1");
    expect(payload?.name).toBe("Admin Demo");
    expect(payload?.email).toBe("admin@demo.com");
    expect(payload?.role).toBe("Admin");
    expect(payload?.image).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken(TEST_USER, 60);

    process.env.AUTH_SECRET = "a-different-secret";
    const payload = await verifySessionToken(token);
    process.env.AUTH_SECRET = "test-secret-do-not-use-in-production";

    expect(payload).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signSessionToken(TEST_USER, -1);
    const payload = await verifySessionToken(token);

    expect(payload).toBeNull();
  });

  it("rejects a tampered payload (signature mismatch)", async () => {
    const token = await signSessionToken(TEST_USER, 60);
    const [header, , signature] = token.split(".");

    /* Re-encode the claims with a forged admin id. */
    const forgedClaims = Buffer.from(
      JSON.stringify({ ...TEST_USER, sub: "999" }),
    ).toString("base64url");

    const payload = await verifySessionToken(
      `${header}.${forgedClaims}.${signature}`,
    );

    expect(payload).toBeNull();
  });

  it("rejects garbage without throwing", async () => {
    await expect(verifySessionToken("not-a-jwt")).resolves.toBeNull();
    await expect(verifySessionToken(undefined)).resolves.toBeNull();
    await expect(verifySessionToken("a.b.c")).resolves.toBeNull();
  });

  it("keeps an optional image when present", async () => {
    const token = await signSessionToken(
      { ...TEST_USER, image: "https://example.com/avatar.png" },
      60,
    );
    const payload = await verifySessionToken(token);

    expect(payload?.image).toBe("https://example.com/avatar.png");
  });
});
