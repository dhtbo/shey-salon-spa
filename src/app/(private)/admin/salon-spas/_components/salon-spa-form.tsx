"use client";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { start } from "repl";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workingDays } from "@/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { creatNewSalonSpa, updateSalonSpaById } from "@/actions/salon-spas";
import toast from "react-hot-toast";
import useUsersGlobalStore, {
  IUsersGlobalStore,
} from "@/store/users-global-store";
import LocationSelection from "./location-selection";

interface SalonSpaFormProps {
  initialValues?: any;
  formType?: "add" | "edit";
}

const offerstatuses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function SalonSpaForm({ initialValues, formType }: SalonSpaFormProps) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { user } = useUsersGlobalStore() as IUsersGlobalStore; // 从全局状态中获取用户
  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "Zip code is required"),
    working_days: z.array(z.string().nonempty()),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    break_start_time: z.string().nonempty(),
    break_end_time: z.string().nonempty(),
    min_service_price: z.number(),
    max_service_price: z.number(),
    offer_status: z.string().nonempty(),
    slot_duration: z.number(),
    max_bookings_per_slot: z.number(),
    location_name: z.string(),
    latitude: z.string(),
    longitude: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      working_days: [],
      start_time: "",
      end_time: "",
      break_start_time: "",
      break_end_time: "",
      min_service_price: 0,
      max_service_price: 0,
      offer_status: "inactive",
      slot_duration: 30,
      max_bookings_per_slot: 1,
      location_name: "",
      latitude: "",
      longitude: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // 处理表单提交逻辑
    console.log("Form submitted with values:", values);
    try {
      setLoading(true);
      let response = null;

      if (formType === "add") {
        // 添加逻辑
        response = await creatNewSalonSpa({
          ...values,
          owner_id: user?.id,
        });
        console.log(response);
      } else if (formType === "edit") {
        // 更新逻辑
        response = await updateSalonSpaById({
          id: initialValues.id,
          payload: values,
        });
      }

      if (response?.success) {
        toast.success(response.message);
        router.push("/admin/salon-spas");
      } else {
        toast.error(response?.message || "Error");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialValues) {
      Object.keys(initialValues).forEach((key: any) => {
        form.setValue(key, initialValues[key]);
      });

      form.setValue("zip", initialValues.zip.toString());
    }
  }, [initialValues, form]);

  return (
    <div className="mt-7">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* 邮箱字段 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 描述字段 */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 地址字段 */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 城市字段 */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 州字段 */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 邮政编码字段 */}
            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="min_service_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Service Price</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        form.setValue(
                          "min_service_price",
                          value
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_service_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Service Price</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=""
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        form.setValue(
                          "max_service_price",
                          value
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offer_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select offer status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {offerstatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 工作日选择 字段组 */}
          <div className="p-5 border border-gray-300 rounded-md flex flex-col gap-5">
            <h1 className="text-sm! font-semibold! text-gray-600">
              Working Days
            </h1>
            <div className="flex felx-wrap gap-10">
              {workingDays.map((day) => (
                <FormField
                  key={day.value}
                  control={form.control}
                  name="working_days"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value.includes(day.value)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, day.value]
                              : field.value.filter(
                                  (d: string) => d !== day.value
                                );
                            field.onChange(newValue);
                          }}
                        />
                      </FormControl>
                      <FormLabel>{day.label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {/* 其他字段 */}
            <div className="grid grid-cols-3 gap-5">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="break_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Break Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="break_end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Break End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slot Duration */}
              <FormField
                control={form.control}
                name="slot_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder=""
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 30 : parseInt(e.target.value) || 30;
                          form.setValue(
                            "slot_duration",
                            value
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Booking Per Slot */}
              <FormField
                control={form.control}
                name="max_bookings_per_slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Bookings Per Slot</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder=""
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 1 : parseInt(e.target.value) || 1;
                          form.setValue(
                            "max_bookings_per_slot",
                            value
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Location Name */}
          <div className="p-5 border border-gray-300 rounded-md flex flex-col gap-5">
            <h1>Location</h1>
            <LocationSelection
              initialLocation={{
                latitude: form.watch("latitude") || "",
                longitude: form.watch("longitude") || "",
                locationName: form.watch("location_name") || "",
              }}
              onLocationChange={(loc) => {
                form.setValue("latitude", loc.latitude);
                form.setValue("longitude", loc.longitude);
                form.setValue("location_name", loc.locationName || "");
              }}
            />
          </div>

          <div className="flex justify-end gap-5">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {formType === "add" ? "Add" : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default SalonSpaForm;
