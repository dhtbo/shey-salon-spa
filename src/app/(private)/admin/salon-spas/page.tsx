"use client";
import { deleteSalonSpaById, getSalonSpasByOwner } from "@/actions/salon-spas";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/page-title";
import { IUser } from "@/interfaces";
import useUsersGlobalStore, {
  IUsersGlobalStore,
} from "@/store/users-global-store";
import Link from "next/link";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/loader";

function SalonSpasList() {
  const { user } = useUsersGlobalStore() as IUsersGlobalStore;
  const [salonSpas, setSalonSpas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const router = useRouter();

  const fetchSalonSpas = async () => {
    try {
      setLoading(true);
      const response: any = await getSalonSpasByOwner(user?.id!);
      if (!response.success) throw new Error(response.message);
      console.log(response.data);
      setSalonSpas(response.data);
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this salon spa?");
    if (!confirmed) return;
    try {
      setLoading(true);
      const res = await deleteSalonSpaById(id);
      if (!res.success) throw new Error(res.message);
      toast.success("Deleted successfully");
      fetchSalonSpas();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchSalonSpas();
    }
  }, [user]);

  const columns = [
    "Name",
    "Description",
    "City",
    "State",
    "Zip",
    "Min_service_price",
    "Max_service_price",
    "Offer_status",
    "created_at",
    "Actions",
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <PageTitle title="Salon Spas" />
        <Button>
          <Link href="/admin/salon-spas/add">Add New Salon Spa</Link>
        </Button>
      </div>

      {loading && <Loader />}

      {!loading && salonSpas.length > 0 && (
        <Table className="w-full">
            <TableHeader>
            <TableRow className="bg-gray-100">
                {columns.map((column, index) => (
                <TableHead key={column}>{column}</TableHead>
                ))}
            </TableRow>
            </TableHeader>
            <TableBody>
            {salonSpas.map((salonSpa) => (
                <TableRow key={salonSpa.id} className="p-2">
                <TableCell>{salonSpa.name}</TableCell>
                <TableCell>{salonSpa.description}</TableCell>
                <TableCell>{salonSpa.city}</TableCell>
                <TableCell>{salonSpa.state}</TableCell>
                <TableCell>{salonSpa.zip}</TableCell>
                <TableCell>${salonSpa.min_service_price}</TableCell>
                <TableCell>${salonSpa.max_service_price}</TableCell>
                <TableCell>{salonSpa.offer_status}</TableCell>
                <TableCell>
                    {dayjs(salonSpa.created_at).format("YYYY-MM-DD HH:mm:ss")}
                </TableCell>
                <TableCell className="flex gap-5 item-center">
                    <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={() =>
                        router.push(`/admin/salon-spas/edit/${salonSpa.id}`)
                    }
                    >
                    <Edit2 size={14} />
                    </Button>

                    <Button
                      variant={"outline"}
                      size={"icon"}
                      onClick={() => handleDelete(salonSpa.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      )}
    </div>
  );
}

export default SalonSpasList;
