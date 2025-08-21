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
    const confirmed = window.confirm("确定要删除这个沙龙吗？");
    if (!confirmed) return;
    try {
      setLoading(true);
      const res = await deleteSalonSpaById(id);
      if (!res.success) throw new Error(res.message);
      toast.success("删除成功");
      fetchSalonSpas();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
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
    "名称",
    "描述",
    "城市",
    "省份",
    // "邮编",
    "最低价格",
    "最高价格",
    "营业状态",
    // "创建时间",
    "操作",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="沙龙管理" />
        <Button>
          <Link href="/admin/salon-spas/add">添加新沙龙</Link>
        </Button>
      </div>

      {salonSpas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无沙龙记录</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column, index) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {salonSpas.map((salonSpa) => (
                <TableRow key={salonSpa.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{salonSpa.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{salonSpa.description}</TableCell>
                  <TableCell>{salonSpa.city}</TableCell>
                  <TableCell>{salonSpa.state}</TableCell>
                  {/* <TableCell>{salonSpa.zip}</TableCell> */}
                  <TableCell className="text-green-600 font-medium">${salonSpa.min_service_price}</TableCell>
                  <TableCell className="text-green-600 font-medium">${salonSpa.max_service_price}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      salonSpa.offer_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {salonSpa.offer_status === 'active' ? '营业中' : '暂停营业'}
                    </span>
                  </TableCell>
                  {/* <TableCell className="text-gray-500">
                    {dayjs(salonSpa.created_at).format("YYYY-MM-DD HH:mm")}
                  </TableCell> */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/salon-spas/edit/${salonSpa.id}`)
                        }
                      >
                        <Edit2 size={16} />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(salonSpa.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 size={16} />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default SalonSpasList;
