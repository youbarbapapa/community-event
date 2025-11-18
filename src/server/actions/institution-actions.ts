"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { generateSlug } from "@/lib/utils";
import { InstitutionCategory } from "@/generated/prisma/enums";

const claimSchema = z.object({
  institutionId: z.string().min(1),
  evidenceUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().min(5),
});

export type ClaimActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitClaimAction(
  prevState: ClaimActionState = { status: "idle" },
  formData: FormData,
): Promise<ClaimActionState> {
  void prevState;
  try {
    const user = await requireUser();
    const parsed = claimSchema.safeParse({
      institutionId: formData.get("institutionId"),
      evidenceUrl: formData.get("evidenceUrl"),
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Invalid claim submission.",
      };
    }

    const { institutionId, evidenceUrl, notes } = parsed.data;

    const existing = await prisma.institutionClaim.findFirst({
      where: {
        institutionId,
        userId: user.id,
        status: "PENDING",
      },
    });

    if (existing) {
      return {
        status: "error",
        message: "You already have a pending claim for this institution.",
      };
    }

    await prisma.institutionClaim.create({
      data: {
        institutionId,
        userId: user.id,
        notes,
        evidenceUrl: evidenceUrl || undefined,
      },
    });

    revalidatePath("/institutions");
    revalidatePath("/admin");

    return { status: "success", message: "Claim submitted for review." };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Unable to submit claim right now." };
  }
}

const createInstitutionSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  website: z.string().url().optional().or(z.literal("")),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  borough: z.string().min(2),
  postcode: z.string().min(3),
  category: z.nativeEnum(InstitutionCategory).default("OTHER"),
});

export type CreateInstitutionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function createInstitutionAction(
  prevState: CreateInstitutionState = { status: "idle" },
  formData: FormData,
): Promise<CreateInstitutionState> {
  void prevState;
  try {
    const user = await requireUser();
    const parsed = createInstitutionSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      website: formData.get("website"),
      addressLine1: formData.get("addressLine1"),
      addressLine2: formData.get("addressLine2"),
      city: formData.get("city"),
      borough: formData.get("borough"),
      postcode: formData.get("postcode"),
      category: formData.get("category"),
    });

    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.issues[0]?.message ?? "Please fill all required fields.",
      };
    }

    const slug = generateSlug(parsed.data.name);

    await prisma.institution.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        category: parsed.data.category,
        website: parsed.data.website || undefined,
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2,
        city: parsed.data.city,
        borough: parsed.data.borough,
        postcode: parsed.data.postcode,
        createdById: user.id,
      },
    });

    revalidatePath("/institutions");
    return { status: "success", message: "Institution submitted for review." };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Unable to register institution at the moment.",
    };
  }
}
