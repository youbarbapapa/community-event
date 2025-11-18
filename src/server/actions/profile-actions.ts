"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed."),
  postcode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/,
      "Enter a valid UK postcode (e.g. N1 2XH).",
    ),
});

export type OnboardingState = {
  status: "idle" | "error" | "success";
  message?: string;
  values?: {
    username?: string;
    postcode?: string;
  };
};

const initialState: OnboardingState = { status: "idle" };

export async function completeOnboardingAction(
  prevState: OnboardingState = initialState,
  formData: FormData,
): Promise<OnboardingState> {
  void prevState;
  try {
    const user = await requireUser();
    const parsed = onboardingSchema.safeParse({
      username: formData.get("username"),
      postcode: formData.get("postcode"),
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        status: "error",
        message: issue?.message ?? "Please correct the highlighted fields.",
        values: {
          username: String(formData.get("username") ?? ""),
          postcode: String(formData.get("postcode") ?? ""),
        },
      };
    }

    const { username, postcode } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing && existing.id !== user.id) {
      return {
        status: "error",
        message: "That username is already taken.",
        values: { username, postcode },
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        postcode,
        onboardingCompleted: true,
      },
    });

    revalidatePath("/");

    return {
      status: "success",
      message: "Profile updated. Redirecting...",
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "Something went wrong while saving your details.",
    };
  }
}
