"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../lib/supabaseServer";

type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EDIT_PASSWORD = process.env.UI_EDIT_PASSWORD;

const normalizeText = (value: FormDataEntryValue | null) => {
  if (!value) return null;
  const trimmed = value.toString().trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getPasswordError = (formData: FormData): ActionState | null => {
  const password = normalizeText(formData.get("editPassword"));
  if (!EDIT_PASSWORD) {
    return { status: "error", message: "Edit password not configured." };
  }
  if (!password) {
    return {
      status: "error",
      message: "Password required to make changes.",
    };
  }
  if (password !== EDIT_PASSWORD) {
    return { status: "error", message: "Incorrect password." };
  }
  return null;
};

export async function addVisit(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const passwordError = getPasswordError(formData);
  if (passwordError) return passwordError;

  const supabase = createSupabaseServerClient();

  const restaurantName = normalizeText(formData.get("restaurantName"));
  const neighborhood = normalizeText(formData.get("neighborhood"));
  const visitDate = normalizeText(formData.get("visitDate"));
  const mealCostValue = normalizeText(formData.get("mealCost"));
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

  const mealCost =
    mealCostValue && !Number.isNaN(Number(mealCostValue))
      ? Number(mealCostValue)
      : null;

  const { error } = await supabase.from("restaurant_visits").insert({
    restaurant_name: restaurantName,
    neighborhood,
    visited_on: visitDate,
    meal_cost: mealCost,
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
  const passwordError = getPasswordError(formData);
  if (passwordError) return passwordError;

  const supabase = createSupabaseServerClient();
  const id = normalizeText(formData.get("id"));

  if (!id) {
    return { status: "error", message: "Missing visit details." };
  }

  const restaurantName = normalizeText(formData.get("restaurantName"));
  const neighborhood = normalizeText(formData.get("neighborhood"));
  const visitDate = normalizeText(formData.get("visitDate"));
  const mealCostValue = normalizeText(formData.get("mealCost"));
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

  const mealCost =
    mealCostValue && !Number.isNaN(Number(mealCostValue))
      ? Number(mealCostValue)
      : null;

  const updates = {
    restaurant_name: restaurantName,
    neighborhood,
    visited_on: visitDate,
    meal_cost: mealCost,
    wesley_rating: wesleyRatingValue ? Number(wesleyRatingValue) : null,
    claire_rating: claireRatingValue ? Number(claireRatingValue) : null,
    notes,
    place_id: placeId,
    place_address: placeAddress,
    place_lat: placeLatValue ? Number(placeLatValue) : null,
    place_lng: placeLngValue ? Number(placeLngValue) : null,
    ...(photoUrl ? { photo_url: photoUrl } : {}),
  };

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

export async function deleteVisit(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const passwordError = getPasswordError(formData);
  if (passwordError) return passwordError;

  const supabase = createSupabaseServerClient();
  const id = normalizeText(formData.get("id"));

  if (!id) {
    return { status: "error", message: "Missing visit details." };
  }

  const { error } = await supabase.from("restaurant_visits").delete().eq("id", id);
  if (error) {
    return { status: "error", message: "Could not delete the visit." };
  }
  revalidatePath("/");
  return { status: "success", message: "Visit deleted." };
}

export async function addWish(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const passwordError = getPasswordError(formData);
  if (passwordError) return passwordError;

  const supabase = createSupabaseServerClient();

  const placeName = normalizeText(formData.get("placeName"));
  const neighborhood = normalizeText(formData.get("neighborhood"));
  const notes = normalizeText(formData.get("notes"));
  const placeId = normalizeText(formData.get("placeId"));
  const placeAddress = normalizeText(formData.get("placeAddress"));
  const placeLatValue = normalizeText(formData.get("placeLat"));
  const placeLngValue = normalizeText(formData.get("placeLng"));

  if (!placeName) {
    return { status: "error", message: "Add a place name to the list." };
  }

  const { error } = await supabase.from("future_spots").insert({
    place_name: placeName,
    neighborhood,
    notes,
    place_id: placeId,
    place_address: placeAddress,
    place_lat: placeLatValue ? Number(placeLatValue) : null,
    place_lng: placeLngValue ? Number(placeLngValue) : null,
  });

  if (error) {
    return { status: "error", message: "Could not save the wishlist yet." };
  }

  revalidatePath("/");
  return { status: "success", message: "Added to the wishlist." };
}

export async function deleteWish(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const passwordError = getPasswordError(formData);
  if (passwordError) return passwordError;

  const supabase = createSupabaseServerClient();
  const id = normalizeText(formData.get("id"));

  if (!id) {
    return { status: "error", message: "Missing wishlist details." };
  }

  const { error } = await supabase.from("future_spots").delete().eq("id", id);
  if (error) {
    return { status: "error", message: "Could not delete the wishlist item." };
  }
  revalidatePath("/");
  return { status: "success", message: "Wishlist item deleted." };
}
