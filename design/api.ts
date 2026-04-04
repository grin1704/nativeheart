import { db } from "~/server/db";
import { getAuth, upload } from "~/server/actions";

/**
 * Public: list all memories, newest first
 */
export async function listMemories() {
  try {
    const memories = await db.memory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return memories;
  } catch (error) {
    console.error("listMemories error", error);
    throw new Error("Failed to load memories");
  }
}

type CreateMemoryInput = {
  name: string;
  message: string;
  email?: string;
  photoBase64?: string;
};

/**
 * Public: create a new memory (no auth required)
 */
export async function createMemory(input: CreateMemoryInput) {
  try {
    const name = input.name.trim();
    const message = input.message.trim();
    const email = input.email?.trim() || undefined;

    if (!name) {
      throw new Error("Name is required");
    }
    if (!message || message.length < 10) {
      throw new Error("Please share at least a short memory (10+ characters).");
    }

    let photoUrl: string | undefined;
    if (input.photoBase64) {
      try {
        photoUrl = await upload({
          bufferOrBase64: input.photoBase64,
          fileName: `memories/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}.jpg`,
        });
      } catch (error) {
        console.error("createMemory upload error", error);
        throw new Error("Failed to upload photo. Please try again.");
      }
    }

    const memory = await db.memory.create({
      data: {
        name,
        message,
        email,
        photoUrl,
      },
    });

    return memory;
  } catch (error) {
    console.error("createMemory error", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to save memory");
  }
}

/**
 * Public: like a memory (simple counter)
 */
export async function likeMemory({ id }: { id: string }) {
  try {
    const updated = await db.memory.update({
      where: { id },
      data: {
        likeCount: {
          increment: 1,
        },
      },
    });
    return updated;
  } catch (error) {
    console.error("likeMemory error", error);
    throw new Error("Failed to like memory");
  }
}

type CreateRsvpInput = {
  firstName: string;
  lastName: string;
  attending: boolean;
  email?: string;
  phone?: string;
  note?: string;
};

/**
 * Public: create a new RSVP (no auth required)
 */
export async function createRsvp(input: CreateRsvpInput) {
  try {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    if (!firstName || !lastName) {
      throw new Error("First and last name are required.");
    }

    const rsvp = await db.rsvp.create({
      data: {
        firstName,
        lastName,
        attending: input.attending,
        email: input.email?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        note: input.note?.trim() || undefined,
      },
    });

    return rsvp;
  } catch (error) {
    console.error("createRsvp error", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to submit RSVP");
  }
}

/**
 * Helper: assert current user is admin, throw otherwise
 */
async function assertAdmin() {
  const auth = await getAuth({ required: true });
  const user = await db.user.findUnique({ where: { id: auth.userId } });
  if (!user?.isAdmin) {
    throw new Error("Admin access required");
  }
  return user;
}

/**
 * Public: lightweight admin status check without forcing login
 */
export async function getAdminStatus() {
  try {
    const auth = await getAuth({ required: false });
    if (auth.status !== "authenticated" || !auth.userId) {
      return { isAdmin: false, authenticated: false };
    }
    const user = await db.user.findUnique({ where: { id: auth.userId } });
    return {
      isAdmin: !!user?.isAdmin,
      authenticated: true,
    };
  } catch (error) {
    console.error("getAdminStatus error", error);
    return { isAdmin: false, authenticated: false };
  }
}

/**
 * Public (admin-only when called from frontend): ensure admin, throws otherwise
 */
export async function ensureAdminAccess() {
  try {
    await assertAdmin();
    return { ok: true };
  } catch (error) {
    console.error("ensureAdminAccess error", error);
    throw error;
  }
}

/**
 * Internal: make current authenticated user an admin.
 * Intended to be called once via runRpcEndpoint with onBehalfOfCurrentUser: true.
 */
export async function _makeUserAdmin() {
  try {
    const auth = await getAuth({ required: true });
    const user = await db.user.upsert({
      where: { id: auth.userId },
      update: { isAdmin: true },
      create: {
        id: auth.userId,
        isAdmin: true,
      },
    });
    return user;
  } catch (error) {
    console.error("_makeUserAdmin error", error);
    throw new Error("Failed to promote user to admin");
  }
}

/**
 * Admin: list RSVPs (most recent first)
 */
export async function listRsvps() {
  try {
    await assertAdmin();
    const rsvps = await db.rsvp.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rsvps;
  } catch (error) {
    console.error("listRsvps error", error);
    throw new Error("Failed to load RSVPs");
  }
}

/**
 * Admin: simple dashboard stats
 */
export async function getDashboardStats() {
  try {
    await assertAdmin();
    const [memoryCount, rsvpCount] = await Promise.all([
      db.memory.count(),
      db.rsvp.count(),
    ]);
    return { memoryCount, rsvpCount };
  } catch (error) {
    console.error("getDashboardStats error", error);
    throw new Error("Failed to load dashboard stats");
  }
}
