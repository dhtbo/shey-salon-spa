"use client";

import React, { useEffect } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import PageTitle from "@/components/ui/page-title";
import Loader from "@/components/ui/loader";
import ErrorMessage from "@/components/ui/error-message";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appointmentStatus } from "@/constants";
import { IAppointment, ISalon_Spa } from "@/interfaces";
import useUsersGlobalStore, {
  IUsersGlobalStore,
} from "@/store/users-global-store";
import {
  getAppointmentsByOwnerId,
  updateAppointmentStatus,
} from "@/actions/appointments";
import Filters from "./_components/filters";
import { getSalonSpasByOwner } from "@/actions/salon-spas";

function ownerAppointmentsList() {
  const [appointments, setAppointments] = React.useState<
    (IAppointment & { user_profile_data?: { id: number; name: string } })[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const { user } = useUsersGlobalStore() as IUsersGlobalStore;
  const [salonSpas, setSalonSpas] = React.useState<ISalon_Spa[]>([]);
  const [selectedSalonSpa, setSelectedSalonSpa] = React.useState<number | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string | null>(null);
  const [filterCleared, setFilterCleared] = React.useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response: any = await getAppointmentsByOwnerId(user?.id!, {
        status: selectedStatus,
        date: selectedDate,
        salon_spa_Id: selectedSalonSpa,
      });
      console.log(response);
      if (response.success) {
        setAppointments(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("获取预约信息失败");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalonSpas = async () => {
    try {
      const response: any = await getSalonSpasByOwner(user?.id!);
      if (response.success) {
        setSalonSpas(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching salon spas");
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchData();
      fetchSalonSpas();
    }
  }, [user]);

  useEffect(() => {
    if (filterCleared) {
      fetchData();
      setFilterCleared(false);
    }
  }, [filterCleared]);

  const handleStatusChange = async (
    appointmentId: number,
    status: IAppointment["status"]
  ) => {
    try {
      setLoading(true);
      const response: any = await updateAppointmentStatus(
        appointmentId,
        status
      );
      if (!response.success) throw new Error(response.message);

      toast.success(response.message);
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === appointmentId) {
          return { ...appointment, status };
        }
        return appointment;
      });
      setAppointments(updatedAppointments);
    } catch (error) {
      toast.error("更新预约状态失败");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    "ID",
    "沙龙/水疗中心",
    "客户姓名",
    "日期",
    "时间",
    "预约时间",
    "状态",
  ];

  return (
    <div>
      <PageTitle title="预约管理" />

      {loading && <Loader />}

      {!loading && (
        <Filters
          salonSpas={salonSpas}
          selectedSalonSpa={selectedSalonSpa}
          setSelectedSalonSpa={setSelectedSalonSpa}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onFilter={fetchData}
          onClearFilter={() => {
            setSelectedSalonSpa(null);
            setSelectedDate(null);
            setSelectedStatus(null);
            setFilterCleared(true);
          }}
        />
      )}

      {!loading && appointments.length === 0 && (
        <ErrorMessage error="No appointments found" />
      )}

      {!loading && appointments.length > 0 && (
        <div>
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id} className="p-2">
                  <TableCell>{appointment.id}</TableCell>
                  <TableCell>
                    {appointment.salon_spa_data?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {appointment.user_profile_data?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {dayjs(appointment.date).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>
                    {dayjs(appointment.created_at).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}
                  </TableCell>
                  <TableCell>
                    <select
                      value={appointment.status}
                      className={`border border-gray-300 rounded-md p-1 ${
                        appointment.status === "已取消"
                          ? "opacity-50 pointer-none:"
                          : ""
                      }`}
                      onChange={(e) =>
                        handleStatusChange(
                          appointment.id,
                          e.target.value as IAppointment["status"]
                        )
                      }
                      disabled={
                        dayjs(appointment.date).isBefore(dayjs(), "day") ||
                        appointment.status === "已取消"
                      }
                    >
                      {appointmentStatus.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                      <option value="completed">已完成</option>
                    </select>
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

export default ownerAppointmentsList;
