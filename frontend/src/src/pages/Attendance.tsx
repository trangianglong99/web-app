import { useEffect, useMemo, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  attendanceStatusFromApi,
  attendanceStatusToApi,
  attendanceUnitFromApi,
  attendanceUnitToApi,
} from "../lib/api";

type AttendanceRecord = {
  id: string;
  date: string; // yyyy-mm-dd
  fullName: string;
  unit?: string; // ward or unit
  status: "Có mặt" | "Vắng" | "Nghỉ phép";
  note?: string;
};

const defaultData: AttendanceRecord[] = [];

const statusOptions: AttendanceRecord["status"][] = [
  "Có mặt",
  "Vắng",
  "Nghỉ phép",
];

const Attendance = () => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [records, setRecords] = useState<AttendanceRecord[]>(defaultData);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string;
    name: string;
  }>({ show: false, id: "", name: "" });
  const [formData, setFormData] = useState({
    fullName: "",
    unit: "",
    status: "Có mặt" as AttendanceRecord["status"],
    note: "",
  });
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const data = await apiGet<any>("/attendance", {
        date,
        q: q || undefined,
        page: currentPage,
        limit: 10,
      });
      
      if (data.data) {
        setRecords(
          data.data.map((d: any) => ({
            id: d.id,
            date: String(d.date).slice(0, 10),
            fullName: d.fullName,
            unit: attendanceUnitFromApi(d.unit),
            status: attendanceStatusFromApi(d.status),
            note: d.note ?? "",
          }))
        );
        setTotalPages(Math.ceil(data.total / 10));
      } else {
        // Fallback for old API format
        setRecords(
          data.map((d: any) => ({
            id: d.id,
            date: String(d.date).slice(0, 10),
            fullName: d.fullName,
            unit: attendanceUnitFromApi(d.unit),
            status: attendanceStatusFromApi(d.status),
            note: d.note ?? "",
          }))
        );
        setTotalPages(1);
      }
    })();
  }, [date, q, currentPage]);

  const filtered = useMemo(() => {
    return records.filter((r) =>
      `${r.fullName} ${r.unit ?? ""}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [records, q]);

  // Client-side pagination fallback
  const paginatedRecords = useMemo(() => {
    if (totalPages === 1 && filtered.length > 10) {
      // Backend doesn't support pagination, do it client-side
      const startIndex = (currentPage - 1) * 10;
      const endIndex = startIndex + 10;
      return filtered.slice(startIndex, endIndex);
    }
    return filtered;
  }, [filtered, currentPage, totalPages]);

  const actualTotalPages = useMemo(() => {
    if (totalPages === 1 && filtered.length > 10) {
      return Math.ceil(filtered.length / 10);
    }
    return totalPages;
  }, [totalPages, filtered.length]);

  const resetForm = () => {
    setEditing(null);
    setFormData({
      fullName: "",
      unit: "",
      status: "Có mặt",
      note: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      date: date,
      fullName: formData.fullName.trim(),
      unit: attendanceUnitToApi(formData.unit),
      status: attendanceStatusToApi(formData.status),
      note: formData.note.trim() || undefined,
    };

    if (editing) await apiPut(`/attendance/${editing.id}`, payload);
    else await apiPost(`/attendance`, payload);

    resetForm();
    const refreshed = await apiGet<any[]>("/attendance", { date });
    setRecords(
      refreshed.map((d) => ({
        id: d.id,
        date: String(d.date).slice(0, 10),
        fullName: d.fullName,
        unit: attendanceUnitFromApi(d.unit),
        status: attendanceStatusFromApi(d.status),
        note: d.note ?? "",
      }))
    );
  };

  const handleEdit = (rec: AttendanceRecord) => {
    setEditing(rec);
    setFormData({
      fullName: rec.fullName,
      unit: rec.unit || "",
      status: rec.status,
      note: rec.note || "",
    });
  };
  const handleDelete = async (id: string) => {
    await apiDelete(`/attendance/${id}`);
    const refreshed = await apiGet<any[]>("/attendance", { date });
    setRecords(
      refreshed.map((d) => ({
        id: d.id,
        date: String(d.date).slice(0, 10),
        fullName: d.fullName,
        unit: attendanceUnitFromApi(d.unit),
        status: attendanceStatusFromApi(d.status),
        note: d.note ?? "",
      }))
    );
    setDeleteConfirm({ show: false, id: "", name: "" });
  };

  const confirmDelete = (id: string, name: string) => {
    setDeleteConfirm({ show: true, id, name });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: "", name: "" });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Điểm danh hằng ngày
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h2>
            <div className="space-y-4">
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tìm theo họ tên/đơn vị"
                className="w-full border rounded-md px-3 py-2"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Cập nhật" : "Thêm mới"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={editing?.date || date}
                  required
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  required
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Chọn đơn vị</option>
                  <option value="Ủy ban">Ủy ban</option>
                  <option value="Quân sự">Quân sự</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as AttendanceRecord["status"],
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <input
                  name="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editing ? "Lưu thay đổi" : "Thêm mới"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border px-4 py-2 rounded-md"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách điểm danh
            </h2>
            <span className="text-sm text-gray-500">
              {filtered.length} bản ghi
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="px-6 py-3">Mã</th>
                  <th className="px-6 py-3">Ngày</th>
                  <th className="px-6 py-3">Họ tên</th>
                  <th className="px-6 py-3">Đơn vị</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Ghi chú</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-6 py-3 font-mono text-sm">{r.id}</td>
                    <td className="px-6 py-3">{r.date}</td>
                    <td className="px-6 py-3">{r.fullName}</td>
                    <td className="px-6 py-3">{r.unit || "-"}</td>
                    <td className="px-6 py-3">{r.status}</td>
                    <td className="px-6 py-3">{r.note || "-"}</td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => confirmDelete(r.id, r.fullName)}
                        className="text-red-600 hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {actualTotalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Trang {currentPage} / {actualTotalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                {Array.from({ length: actualTotalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      currentPage === page 
                        ? "bg-blue-600 text-white border-blue-600" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(actualTotalPages, prev + 1))}
                  disabled={currentPage === actualTotalPages}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bản ghi điểm danh của <strong>{deleteConfirm.name}</strong> không?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
