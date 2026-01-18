"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../lib/supabaseServer";

type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const normalizeText = (value: FormDataEntryValue | null) => {
  if (!value) return null;
  const trimmed = value.toString().trim();
  return trimmed.length > 0 ? trimmed : null;
};

export async function addVisit(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createSupabaseServerClient();

  const restaurantName = normalizeText(formData.get("restaurantName"));
  const neighborhood = normalizeText(formData.get("neighborhood"));
  const visitDate = normalizeText(formData.get("visitDate"));
  const wesleyRatingValue = normalizeText(formData.get("wesleyRating"));
  const claireRatingValue = normalizeText(formData.get("claireRating"));
  const notes = normalizeText(formData.get("notes"));
  const photoUrl = normalizeText(formData.get("photoUrl"));
  const placeId = normalizeText(formData.get("placeId"));
  const placeAddress = normalizeText(formData.get("placeAddress"));
  const placeLatValue = normalizeText(formData.get("placeLat"));
  const placeLngValue = normalizeText(formData.get("placeLng"));

  if (!restaurantName || !visitDate) {
    return { status: "error", message: "Add a name and date to log a visit." };
  }

  const { error } = await supabase.from("restaurant_visits").insert({
    restaurant_name: restaurantName,
    neighborhood,
    visited_on: visitDate,
    wesley_rating: wesleyRatingValue ? Number(wesleyRatingValue) : null,
    claire_rating: claireRatingValue ? Number(claireRatingValue) : null,
    notes,
    photo_url: photoUrl,
    place_id: placeId,
    place_address: placeAddress,
    place_lat: placeLatValue ? Number(placeLatValue) : null,
    place_lng: placeLngValue ? Number(placeLngValue) : null,
  });

  if (error) {
    return { status: "error", message: "Could not save the visit yet." };
  }

  revalidatePath("/");
  return { status: "success", message: "Visit saved. Great pick!" };
}

export async function updateVisit(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createSupabaseServerClient();
  const id = normalizeText(formData.get("id"));

  if (!id) {
    return { status: "error", message: "Missing visit details." };
  }

  const restaurantName = normalizeText(formData.get("restaurantName"));
  const neighborhood = normalizeText(formData.get("neighborhood"));
  const visitDate = normalizeText(formData.get("visitDate"));
  const wesleyRatingValue = normalizeText(formData.get("wesleyRating"));
  const claireRatingValue = normalizeText(formData.get("claireRating"));
  const notes = normalizeText(formData.get("notes"));
  const photoUrl = normalizeText(formData.get("photoUrl"));
  const placeId = normalizeText(formData.get("placeId"));
  const placeAddress = normalizeText(formData.get("placeAddress"));
  const placeLatValue = normalizeText(formData.get("placeLat"));
  const placeLngValue = normalizeText(formData.get("placeLng"));

  if (!restaurantName || !visitDate) {
    return { status: "error", message: "Add a name and date to save changes." };
  }

  const updates = {
    restaurant_name: restaurantName,
    neighborhood,
    visited_on: visitDate,
    wesley_rating: wesleyRatingValue ? Number(wesleyRatingValue) : null,
    claire_rating: claireRatingValue ? Number(claireRatingValue) : null,
    notes,
    place_id: placeId,
    place_address: placeAddress,
    place_lat: placeLatValue ? Number(placeLatValue) : null,
    place_lng: placeLngValue ? Number(placeLngValue) : null,
  };

  if (photoUrl) {
    updates.photo_url = photoUrl;
  }

  const { error } = await supabase
    .from("restaurant_visits")
    .update(updates)
    .eq("id", id);

  if (error) {
    return { status: "error", message: "Could not save the edits yet." };
  }

  revalidatePath("/");
  return { status: "success", message: "Visit updated." };
}

export async function deleteVisit(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const id = normalizeText(formData.get("id"));

  if (!id) return;

  await supabase.from("restaurant_visits").delete().eq("id", id);
  revalidatePath("/");
}
