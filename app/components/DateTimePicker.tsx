import React, { useState, useMemo } from "react";

interface CustomDateTimePickerProps {
  label?: string;
}

export default function CustomDateTimePicker({ label = "Chọn ngày giờ:" }: CustomDateTimePickerProps) {
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("00");
  const [minute, setMinute] = useState("00");
  const [second, setSecond] = useState("00");

  const combined = useMemo(() => {
    return date ? `${date}T${hour}:${minute}:${second}` : "";
  }, [date, hour, minute, second]);

  const generateOptions = (max: number) =>
    Array.from({ length: max }, (_, i) =>
      String(i).padStart(2, "0")
    ).map((val) => (
      <option key={val} value={val}>
        {val}
      </option>
    ));

  return (
    <div className="flex flex-col gap-2 w-fit">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* Ngày */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border px-3 py-2 rounded-md shadow-sm text-sm focus:outline-none focus:ring focus:border-blue-500"
      />

      {/* Giờ / Phút / Giây */}
      <div className="flex gap-2">
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          className="border px-2 py-1 rounded-md text-sm"
        >
          {generateOptions(24)}
        </select>

        <select
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          className="border px-2 py-1 rounded-md text-sm"
        >
          {generateOptions(60)}
        </select>

        <select
          value={second}
          onChange={(e) => setSecond(e.target.value)}
          className="border px-2 py-1 rounded-md text-sm"
        >
          {generateOptions(60)}
        </select>
      </div>

      {/* Hiển thị kết quả */}
      <span className="text-xs text-gray-600">
        Giá trị: {combined || "(chưa chọn đầy đủ)"}
      </span>
    </div>
  );
}
