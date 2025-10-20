import { useEffect, useMemo, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  militaryStatusFromApi,
  militaryStatusToApi,
  getProfileCode,
} from "../lib/api";

type ServiceRecord = {
  id: string;
  code: string; // Mã hồ sơ (hiển thị cho người dùng)
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  ward?: string;
  unit?: string;
  status: "Chưa nhập ngũ" | "Đang tại ngũ" | "Xuất ngũ";
};

const initialData: ServiceRecord[] = [];

const statusOptions: ServiceRecord["status"][] = [
  "Chưa nhập ngũ",
  "Đang tại ngũ",
  "Xuất ngũ",
];

const MilitaryService = () => {
  const [records, setRecords] = useState<ServiceRecord[]>(initialData);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [wardFilter, setWardFilter] = useState<string>("");
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [idNumberError, setIdNumberError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string;
    name: string;
  }>({ show: false, id: "", name: "" });
  const [formData, setFormData] = useState({
    code: "",
    fullName: "",
    dateOfBirth: "",
    idNumber: "",
    ward: "",
    unit: "",
    status: "Chưa nhập ngũ" as ServiceRecord["status"],
  });
  const [errors, setErrors] = useState<{
    [K in keyof Pick<
      ServiceRecord,
      "code" | "fullName" | "dateOfBirth" | "idNumber" | "ward"
    >]?: boolean;
  }>({});

  const loadList = async () => {
    const data = await apiGet<any>("/military", {
      q: query || undefined,
      status: status ? militaryStatusToApi(status) : undefined,
      ward: wardFilter || undefined,
      page: currentPage,
      limit: 10,
    });

    if (data.data) {
      setRecords(
        data.data.map((d: any) => ({
          id: d.id,
          code: d.recordCode || d.code || d.profileCode || d.maHoSo || "",
          fullName: d.fullName,
          dateOfBirth: String(d.dateOfBirth).slice(0, 10),
          idNumber: d.idNumber,
          ward: d.ward,
          unit: d.unit ?? "",
          status: militaryStatusFromApi(d.status) as ServiceRecord["status"],
        }))
      );
      setTotalPages(Math.ceil(data.total / 10));
    } else {
      // Fallback for old API format
      setRecords(
        data.map((d: any) => ({
          id: d.id,
          code: d.recordCode || d.code || d.profileCode || d.maHoSo || "",
          fullName: d.fullName,
          dateOfBirth: String(d.dateOfBirth).slice(0, 10),
          idNumber: d.idNumber,
          ward: d.ward,
          unit: d.unit ?? "",
          status: militaryStatusFromApi(d.status) as ServiceRecord["status"],
        }))
      );
      setTotalPages(1);
    }
  };

  useEffect(() => {
    loadList();
  }, [query, status, wardFilter, currentPage]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchText = `${r.code} ${r.fullName} ${r.idNumber} ${
        r.ward ?? ""
      } ${r.unit ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchStatus = status ? r.status === status : true;
      const matchWard = wardFilter
        ? (r.ward || "").toLowerCase() === wardFilter.toLowerCase()
        : true;
      return matchText && matchStatus && matchWard;
    });
  }, [records, query, status, wardFilter]);

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
      code: "",
      fullName: "",
      dateOfBirth: "",
      idNumber: "",
      ward: "",
      unit: "",
      status: "Chưa nhập ngũ",
    });
    setErrors({});
    setIdNumberError("");
  };

  const wards = [
    "Trung",
    "Đông",
    "Phú Hội",
    "đồng an 1",
    "đồng an 2",
    "đồng an 3",
    "bình đức 1",
    "bình đức 2",
    "bình đức 3",
    "bình đáng",
    "đông ba",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {
      code: !formData.code,
      fullName: !formData.fullName,
      dateOfBirth: !formData.dateOfBirth,
      idNumber: !formData.idNumber,
      ward: !formData.ward,
    };
    setErrors(newErrors);
    setIdNumberError("");
    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) return;

    const payload = {
      recordCode: formData.code,
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      idNumber: formData.idNumber,
      ward: formData.ward,
      unit: formData.unit || undefined,
      status: militaryStatusToApi(formData.status),
    };

    try {
      if (editing) {
        await apiPut(`/military/${editing.id}`, payload);
      } else {
        await apiPost(`/military`, payload);
      }
      resetForm();
      await loadList();
    } catch (error: any) {
      if (
        error.message?.includes("Unique constraint failed") ||
        error.message?.includes("idNumber")
      ) {
        setIdNumberError("CMND/CCCD đã tồn tại");
      } else {
        console.error("Error:", error);
        alert("Có lỗi xảy ra, vui lòng thử lại");
      }
    }
  };

  const handleGenerateCode = async () => {
    const { code } = await getProfileCode("HS", 6);
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleEdit = (rec: ServiceRecord) => {
    setEditing(rec);
    setFormData({
      code: rec.code || "",
      fullName: rec.fullName,
      dateOfBirth: rec.dateOfBirth,
      idNumber: rec.idNumber,
      ward: rec.ward || "",
      unit: rec.unit || "",
      status: rec.status,
    });
  };
  const handleDelete = async (id: string) => {
    await apiDelete(`/military/${id}`);
    await loadList();
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
          Quản lý hồ sơ nghĩa vụ quân sự
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tìm theo mã hồ sơ/họ tên/CMND/CCCD/Khu phố"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
              >
                <option value="">Tất cả khu phố</option>
                {wards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Cập nhật hồ sơ" : "Thêm hồ sơ"}
            </h2>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã hồ sơ
                </label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }));
                    if (e.target.value && errors.code)
                      setErrors((prev) => ({ ...prev, code: false }));
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.code ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Sinh mã tự động
                </button>
                {errors.code && (
                  <p className="text-sm text-red-600 mt-1">
                    Vui lòng điền vào ô này
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }));
                    if (e.target.value && errors.fullName)
                      setErrors((prev) => ({ ...prev, fullName: false }));
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.fullName ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">
                    Vui lòng điền vào ô này
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }));
                    if (e.target.value && errors.dateOfBirth)
                      setErrors((prev) => ({ ...prev, dateOfBirth: false }));
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.dateOfBirth
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600 mt-1">
                    Vui lòng điền vào ô này
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CMND/CCCD
                </label>
                <input
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      idNumber: e.target.value,
                    }));
                    if (e.target.value && errors.idNumber)
                      setErrors((prev) => ({ ...prev, idNumber: false }));
                    if (idNumberError) setIdNumberError("");
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.idNumber || idNumberError
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors.idNumber && (
                  <p className="text-sm text-red-600 mt-1">
                    Vui lòng điền vào ô này
                  </p>
                )}
                {idNumberError && (
                  <p className="text-sm text-red-600 mt-1">{idNumberError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khu phố
                </label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, ward: e.target.value }));
                    if (e.target.value && errors.ward)
                      setErrors((prev) => ({ ...prev, ward: false }));
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.ward ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                >
                  <option value="">Chọn khu phố</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <p className="text-sm text-red-600 mt-1">
                    Vui lòng điền vào ô này
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị
                </label>
                <input
                  name="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
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
                      status: e.target.value as ServiceRecord["status"],
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
              Danh sách hồ sơ
            </h2>
            <span className="text-sm text-gray-500">
              {filtered.length} bản ghi
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="px-6 py-3">Mã hồ sơ</th>
                  <th className="px-6 py-3">Họ tên</th>
                  <th className="px-6 py-3">Ngày sinh</th>
                  <th className="px-6 py-3">CMND/CCCD</th>
                  <th className="px-6 py-3">Khu phố</th>
                  <th className="px-6 py-3">Đơn vị</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-6 py-3 font-mono text-sm">
                      {r.code || "-"}
                    </td>
                    <td className="px-6 py-3">{r.fullName}</td>
                    <td className="px-6 py-3">{r.dateOfBirth}</td>
                    <td className="px-6 py-3">{r.idNumber}</td>
                    <td className="px-6 py-3">{r.ward || "-"}</td>
                    <td className="px-6 py-3">{r.unit || "-"}</td>
                    <td className="px-6 py-3">{r.status}</td>
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                {Array.from({ length: actualTotalPages }, (_, i) => i + 1).map(
                  (page) => (
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
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(actualTotalPages, prev + 1)
                    )
                  }
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
              Bạn có chắc chắn muốn xóa hồ sơ{" "}
              <strong>{deleteConfirm.name}</strong> không?
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

export default MilitaryService;
