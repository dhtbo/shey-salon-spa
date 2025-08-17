"use server";

import supabase from "@/config/supabase-config";
import { ISaon_Spa } from "@/interfaces";

export const creatNewSalonSpa = async (payload: any) => {
  try {
    const { data, error } = await supabase.from("salon_spas").insert(payload);
    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
  return {
    success: true,
    message: "创建成功",
  };
};

export const getSalonSpasByOwner = async (owner_id: number) => {
  try {
    const { data, error } = await supabase
      .from("salon_spas")
      .select("*")
      .eq("owner_id", owner_id);
    if (error) throw error;
    return {
      success: true,
      data: data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getSalonSpaById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("salon_spas")
      .select("*")
      .eq("id", id);
    if (error) throw error;
    return {
      success: true,
      data: data[0],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }

};

export const updateSalonSpaById = async ({
  id,
  payload,
}: {
  id: number;
  payload: any;
}) => {
  try {
    const { data, error } = await supabase
      .from("salon_spas")
      .update(payload)
      .eq("id", id);
    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
  return {
    success: true,
    message: "更新成功",
  };
};

export const deleteSalonSpaById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("salon_spas")
      .delete()
      .eq("id", id);
    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
  return {
    success: true,
    message: "删除成功",
  };
};
