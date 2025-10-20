import { useEffect, useMemo, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  militiaRoleFromApi,
  militiaRoleToApi,
  getProfileCode,
} from "../lib/api";

type MilitiaMember = {
  id: string;
  code?: string; // Mã hồ sơ hiển thị
  fullName: string;
  ward: string; // Khu phố
  role:
    | "Chiến sĩ"
    | "Tiểu đội trưởng"
    | "Trung đội trưởng"
    | "Chỉ huy phó"
    | "Chỉ huy trưởng";
  phone?: string;
  active: boolean;
};

const sampleMembers: MilitiaMember[] = [];

const roleOptions: MilitiaMember["role"][] = [
  "Chiến sĩ",
  "Tiểu đội trưởng",
  "Trung đội trưởng",
  "Chỉ huy phó",
  "Chỉ huy trưởng",
];

const Militia = () => {
  const [members, setMembers] = useState<MilitiaMember[]>(sampleMembers);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [editing, setEditing] = useState<MilitiaMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string;
    name: string;
  }>({ show: false, id: "", name: "" });
  const [phoneError, setPhoneError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    fullName: "",
    ward: "",
    role: "Chiến sĩ" as MilitiaMember["role"],
    phone: "",
    active: true,
  });

  const loadList = async () => {
    const data = await apiGet<any>("/militia", {
      q: q || undefined,
      role: role ? militiaRoleToApi(role) : undefined,
      active: onlyActive ? true : undefined,
      page: currentPage,
      limit: 10,
    });

    if (data.data) {
      setMembers(
        data.data.map((d: any) => ({
          id: d.id,
          code: d.code || d.recordCode || d.profileCode || d.maHoSo || "",
          fullName: d.fullName,
          ward: d.ward,
          role: militiaRoleFromApi(d.role) as MilitiaMember["role"],
          phone: d.phone ?? "",
          active: d.active,
        }))
      );
      setTotalPages(Math.ceil(data.total / 10));
    } else {
      // Fallback for old API format
      setMembers(
        data.map((d: any) => ({
          id: d.id,
          code: d.code || d.recordCode || d.profileCode || d.maHoSo || "",
          fullName: d.fullName,
          ward: d.ward,
          role: militiaRoleFromApi(d.role) as MilitiaMember["role"],
          phone: d.phone ?? "",
          active: d.active,
        }))
      );
      setTotalPages(1);
    }
  };

  useEffect(() => {
    loadList();
  }, [q, role, onlyActive, currentPage]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchText = `${m.code || ""} ${m.fullName} ${m.ward}`
        .toLowerCase()
        .includes(q.toLowerCase());
      const matchRole = role ? m.role === role : true;
      const matchActive = onlyActive ? m.active : true;
      return matchText && matchRole && matchActive;
    });
  }, [members, q, role, onlyActive]);

  // Client-side pagination fallback
  const paginatedMembers = useMemo(() => {
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
      ward: "",
      role: "Chiến sĩ",
      phone: "",
      active: true,
    });
    setPhoneError("");
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

  const validatePhone = (phone: string) => {
    if (!phone) return ""; // Phone is optional
    if (!phone.startsWith("0")) return "Số điện thoại phải bắt đầu từ 0";
    if (phone.length !== 10) return "Số điện thoại phải có đúng 10 số";
    if (!/^\d+$/.test(phone)) return "Số điện thoại chỉ được chứa số";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const phoneValidation = validatePhone(formData.phone);
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      return;
    }

    const payload = {
      recordCode: formData.code,
      fullName: formData.fullName,
      ward: formData.ward,
      role: militiaRoleToApi(formData.role),
      phone: formData.phone.trim() || undefined,
      active: !!formData.active,
    };

    if (editing) await apiPut(`/militia/${editing.id}`, payload);
    else await apiPost(`/militia`, payload);

    resetForm();
    await loadList();
  };

  const handleGenerateCode = async () => {
    const { code } = await getProfileCode("HS", 6);
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleEdit = (
    m: MilitiaMember & {
      recordCode?: string;
      profileCode?: string;
      maHoSo?: string;
    }
  ) => {
    setEditing(m);
    setFormData({
      code: m.code || m.recordCode || m.profileCode || m.maHoSo || "",
      fullName: m.fullName,
      ward: m.ward,
      role: m.role,
      phone: m.phone || "",
      active: m.active,
    });
  };
  const handleDelete = async (id: string) => {
    await apiDelete(`/militia/${id}`);
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
          Quản lý dân quân thường trực
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tìm theo họ tên/khu phố"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <select
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Tất cả chức vụ</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={onlyActive}
                  onChange={(e) => setOnlyActive(e.target.checked)}
                />
                Chỉ hiển thị đang hoạt động
              </label>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Cập nhật thành viên" : "Thêm thành viên"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã hồ sơ
                </label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Sinh mã tự động
                </button>
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
                  Khu phố
                </label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ward: e.target.value }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Chọn khu phố</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chức vụ
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: e.target.value as MilitiaMember["role"],
                    }))
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }));
                    if (phoneError) setPhoneError("");
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    phoneError ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {phoneError && (
                  <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700">Đang hoạt động</span>
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
              Danh sách dân quân
            </h2>
            <span className="text-sm text-gray-500">
              {filtered.length} thành viên
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="px-6 py-3">Mã hồ sơ</th>
                  <th className="px-6 py-3">Họ tên</th>
                  <th className="px-6 py-3">Khu phố</th>
                  <th className="px-6 py-3">Chức vụ</th>
                  <th className="px-6 py-3">SĐT</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-6 py-3 font-mono text-sm">
                      {m.code || "-"}
                    </td>
                    <td className="px-6 py-3">{m.fullName}</td>
                    <td className="px-6 py-3">{m.ward}</td>
                    <td className="px-6 py-3">{m.role}</td>
                    <td className="px-6 py-3">{m.phone || "-"}</td>
                    <td className="px-6 py-3">
                      {m.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(m)}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => confirmDelete(m.id, m.fullName)}
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
              Bạn có chắc chắn muốn xóa thành viên{" "}
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

export default Militia;
