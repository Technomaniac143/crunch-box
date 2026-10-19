import { supabase } from "@/integrations/supabase/client";
import { DELIVERY_FEE, validateDeliveryFee } from "../../domain/rules";

export async function getDeliveryFee(): Promise<number> {
  const { data, error } = await supabase
    .from("kitchen_delivery_settings")
    .select("delivery_fee")
    .eq("id", true)
    .maybeSingle();
  if (error) throw error;
  return data?.delivery_fee ?? DELIVERY_FEE;
}

export async function saveDeliveryFee(fee: number): Promise<number> {
  validateDeliveryFee(fee);
  const { data, error } = await supabase
    .from("kitchen_delivery_settings")
    .upsert({ id: true, delivery_fee: fee, updated_at: new Date().toISOString() })
    .select("delivery_fee")
    .single();
  if (error) throw error;
  return data.delivery_fee;
}
