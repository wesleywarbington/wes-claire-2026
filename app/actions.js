"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../lib/supabaseServer";

const normalizeText = (value) => {
  if (!value) return null;
  const trimmed = value.toString().trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function addVisit(formData) {
  const supabase = createSupabaseServerClient();

  const restaurantName = normalizeText(formData.get("restaurantName"));
  const neighborhood = normalizeText(formData.get("neighborhood"));
  const visitDate = normalizeText(formData.get("visitDate"));
  const ratingValue = normalizeText(formData.get("rating"));
  const notes = normalizeText(formData.get("notes"));
  const returnPlan = normalizeText(formData.get("returnPlan"));

  if (!restaurantName || !visitDate) {
    return;
  }

  let photoUrl = null;
  const mealPhoto = formData.get("mealPhoto");

  if (mealPhoto && typeof mealPhoto === "object" && mealPhoto.size > 0) {
    const fileExtension = mealPhoto.name?.split(".").pop() || "jpg";
    const filePath = `${randomUUID()}.${fileExtension}`;
    const arrayBuffer = await mealPhoto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("meal-photos")
      .upload(filePath, buffer, {
        contentType: mealPhoto.type || "image/jpeg",
      });

    if (!uploadError) {
      const { data } = supabase.storage
        .from("meal-photos")
        .getPublicUrl(filePath);
      photoUrl = data.publicUrl;
    }
  }

  await supabase.from("restaurant_visits").insert({
    restaurant_name: restaurantName,
    neighborhood,
    visited_on: visitDate,
    rating: ratingValue ? Number(ratingValue) : null,
    notes,
    return_plan: returnPlan,
    photo_url: photoUrl,
  });

  revalidatePath("/");
}
