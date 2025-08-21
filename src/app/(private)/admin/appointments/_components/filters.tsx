import { Button } from "@/components/ui/button";
import { appointmentStatus } from "@/constants";
import { ISalon_Spa } from "@/interfaces";
import React from "react";

function Filters({
  salonSpas,
  selectedSalonSpa,
  setSelectedSalonSpa,
  selectedDate,
  setSelectedDate,
  selectedStatus,
  setSelectedStatus,
  onFilter,
  onClearFilter,
}: {
  salonSpas: ISalon_Spa[];
  selectedSalonSpa: number | null;
  setSelectedSalonSpa: React.Dispatch<React.SetStateAction<number | null>>;
  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
  selectedStatus: string | null;
  setSelectedStatus: React.Dispatch<React.SetStateAction<string | null>>;
  onFilter: () => void;
  onClearFilter: () => void;
}) {
  return (
    <div className="grid lg:grid-cols-4 grid-cols-1 my-5 gap-5 items-end">
      <div>
        <h1 className="text-sm">沙龙/水疗中心</h1>
        <select
          value={selectedSalonSpa || ""}
          onChange={(e) => setSelectedSalonSpa(Number(e.target.value))}
          className="border border-gray-400 rounded-md p-1 text-sm w-full h-9"
        >
          <option value="">全部</option>
          {salonSpas.map((salonSpa) => (
            <option key={salonSpa.id} value={salonSpa.id} className="text-sm">
              {salonSpa.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h1 className="text-sm">日期</h1>
        <input
          type="date"
          value={selectedDate || new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-400 rounded-md p-1 text-sm w-full h-9"
        />
      </div>

      <div>
        <h1 className="text-sm">状态</h1>
        <select
          value={selectedStatus || ""}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-400 rounded-md p-1 text-sm w-full h-9"
        >
          <option value="">全部</option>
          {appointmentStatus.map((status) => (
            <option key={status.value} value={status.value} className="text-sm">
              {status.label}
            </option>
          ))}
          <option value="已完成">已完成</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Button variant="outline" onClick={onClearFilter}>
          取消筛选
        </Button>
        <Button onClick={onFilter}>应用筛选</Button>
      </div>
    </div>
  );
}

export default Filters;
