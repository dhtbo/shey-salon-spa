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
        <h1 className="text-sm">Salon/Spa</h1>
        <select
          value={selectedSalonSpa || ""}
          onChange={(e) => setSelectedSalonSpa(Number(e.target.value))}
          className="border border-gray-400 rounded-md p-1 text-sm w-full h-9"
        >
          <option value="">All</option>
          {salonSpas.map((salonSpa) => (
            <option key={salonSpa.id} value={salonSpa.id} className="text-sm">
              {salonSpa.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h1 className="text-sm">Date</h1>
        <input
          type="date"
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-400 rounded-md p-1 text-sm w-full h-9"
        />
      </div>

      <div>
        <h1 className="text-sm">Status</h1>
        <select
          value={selectedStatus || ""}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-400 rounded-md p-1 text-sm w-full h-9"
        >
          <option value="">All</option>
          {appointmentStatus.map((status) => (
            <option key={status.value} value={status.value} className="text-sm">
              {status.label}
            </option>
          ))}
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Button variant="outline" onClick={onClearFilter}>
          Clear Filter
        </Button>
        <Button onClick={onFilter}>Apply Filter</Button>
      </div>
    </div>
  );
}

export default Filters;
