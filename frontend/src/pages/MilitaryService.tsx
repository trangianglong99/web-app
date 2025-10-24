import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { apiDelete, apiGet, apiPost, apiPut, getProfileCode } from "../lib/api";

type ServiceRecord = {
  id: string;
  recordCode: string; // Mã hồ sơ
  fullName: string;
  dateOfBirth: string;
  occupation?: string;
  permanentResidence?: string; // Hộ khẩu thường trú - Khu phố
  specificAddress?: string; // Địa chỉ cụ thể
  ethnicity?: string;
  religion?: string;
  education?: string;
  graduationStatus?: string;
  partyMember?: string;
  familyInfo?: string;
};

const initialData: ServiceRecord[] = [];

const MilitaryService = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ServiceRecord[]>(initialData);
  const [query, setQuery] = useState("");
  const [wardFilter, setWardFilter] = useState<string>("");
  const [addressFilter, setAddressFilter] = useState<string>("");
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string;
    name: string;
  }>({ show: false, id: "", name: "" });
  const [formData, setFormData] = useState({
    recordCode: "",
    fullName: "",
    dateOfBirth: "",
    occupation: "",
    permanentResidence: "",
    specificAddress: "",
    ethnicity: "",
    religion: "",
    education: "",
    graduationStatus: "",
    partyMember: "",
    familyInfo: "",
  });
  const [errors, setErrors] = useState<{
    [K in keyof Pick<
      ServiceRecord,
      "recordCode" | "fullName" | "dateOfBirth" | "permanentResidence"
    >]?: boolean;
  }>({});

  const loadList = async () => {
    const data = await apiGet<any>("/military", {
      q: query || undefined,
      ward: wardFilter || undefined,
      address: addressFilter || undefined,
      page: currentPage,
      limit: 10,
    });

    if (data.data) {
      setRecords(
        data.data.map((d: any) => ({
          id: d.id,
          recordCode: d.recordCode || "",
          fullName: d.fullName,
          dateOfBirth: String(d.dateOfBirth).slice(0, 10),
          occupation: d.occupation || "",
          permanentResidence: d.permanentResidence || "",
          specificAddress: d.specificAddress || "",
          ethnicity: d.ethnicity || "",
          religion: d.religion || "",
          education: d.education || "",
          graduationStatus: d.graduationStatus || "",
          partyMember: d.partyMember || "",
          familyInfo: d.familyInfo || "",
        }))
      );
      setTotalPages(Math.ceil(data.total / 10));
    } else {
      // Fallback for old API format
      setRecords(
        data.map((d: any) => ({
          id: d.id,
          recordCode: d.recordCode || "",
          fullName: d.fullName,
          dateOfBirth: String(d.dateOfBirth).slice(0, 10),
          occupation: d.occupation || "",
          permanentResidence: d.permanentResidence || "",
          specificAddress: d.specificAddress || "",
          ethnicity: d.ethnicity || "",
          religion: d.religion || "",
          education: d.education || "",
          graduationStatus: d.graduationStatus || "",
          partyMember: d.partyMember || "",
          familyInfo: d.familyInfo || "",
        }))
      );
      setTotalPages(1);
    }
  };

  useEffect(() => {
    loadList();
  }, [query, wardFilter, addressFilter, currentPage]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchText = `${r.recordCode} ${r.fullName} ${
        r.permanentResidence ?? ""
      } ${r.specificAddress ?? ""} ${r.occupation ?? ""} ${r.ethnicity ?? ""} ${
        r.religion ?? ""
      } ${r.education ?? ""} ${r.graduationStatus ?? ""} ${
        r.partyMember ?? ""
      } ${r.familyInfo ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchWard = wardFilter
        ? (r.permanentResidence || "")
            .toLowerCase()
            .includes(wardFilter.toLowerCase())
        : true;
      const matchAddress = addressFilter
        ? (r.specificAddress || "")
            .toLowerCase()
            .includes(addressFilter.toLowerCase())
        : true;
      return matchText && matchWard && matchAddress;
    });
  }, [records, query, wardFilter, addressFilter]);

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
      recordCode: "",
      fullName: "",
      dateOfBirth: "",
      occupation: "",
      permanentResidence: "",
      specificAddress: "",
      ethnicity: "",
      religion: "",
      education: "",
      graduationStatus: "",
      partyMember: "",
      familyInfo: "",
    });
    setErrors({});
  };

  const wards = [
    "Trung",
    "Đông",
    "Phú Hội",
    "Đồng an 1",
    "Đồng an 2",
    "Đồng an 3",
    "Bình Đức 1",
    "Bình Đức 2",
    "Bình Đức 3",
    "Bình Đáng",
    "Đông Ba",
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: typeof errors = {
      recordCode: !formData.recordCode,
      fullName: !formData.fullName,
      dateOfBirth: !formData.dateOfBirth,
      permanentResidence: !formData.permanentResidence,
    };
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some(Boolean);
    if (hasError) return;

    const payload = {
      recordCode: formData.recordCode,
      fullName: formData.fullName,
      dateOfBirth: formData.dateOfBirth,
      occupation: formData.occupation || undefined,
      permanentResidence: formData.permanentResidence || undefined,
      specificAddress: formData.specificAddress || undefined,
      ethnicity: formData.ethnicity || undefined,
      religion: formData.religion || undefined,
      education: formData.education || undefined,
      graduationStatus: formData.graduationStatus || undefined,
      partyMember: formData.partyMember || undefined,
      familyInfo: formData.familyInfo || undefined,
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
      console.error("Error:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleGenerateCode = async () => {
    const { code } = await getProfileCode("HS", 6);
    setFormData((prev) => ({ ...prev, recordCode: code }));
  };

  const handleViewDetail = (id: string) => {
    navigate(`/military/detail/${id}`);
  };

  const handleEdit = (rec: ServiceRecord) => {
    setEditing(rec);
    setFormData({
      recordCode: rec.recordCode || "",
      fullName: rec.fullName,
      dateOfBirth: rec.dateOfBirth,
      occupation: rec.occupation || "",
      permanentResidence: rec.permanentResidence || "",
      specificAddress: rec.specificAddress || "",
      ethnicity: rec.ethnicity || "",
      religion: rec.religion || "",
      education: rec.education || "",
      graduationStatus: rec.graduationStatus || "",
      partyMember: rec.partyMember || "",
      familyInfo: rec.familyInfo || "",
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

  const handleExportExcel = () => {
    // Chuẩn bị dữ liệu cho Excel
    const excelData = paginatedRecords.map((record, index) => ({
      STT: index + 1,
      "Mã hồ sơ": record.recordCode,
      "Họ và tên": record.fullName,
      "Ngày sinh": record.dateOfBirth,
      "Nghề nghiệp": record.occupation || "",
      "Hộ khẩu thường trú": record.permanentResidence || "",
      "Địa chỉ cụ thể": record.specificAddress || "",
      "Dân tộc": record.ethnicity || "",
      "Tôn giáo": record.religion || "",
      "Học vấn, Chuyên môn kỹ thuật": record.education || "",
      "Đã tốt nghiệp hoặc niên khóa đang học": record.graduationStatus || "",
      "Đảng viên, đoàn viên hay không": record.partyMember || "",
      "Thông tin Cha, Mẹ, Vợ/Chồng, nghề nghiệp": record.familyInfo || "",
    }));

    // Tạo workbook và worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách hồ sơ");

    // Xuất file
    const fileName = `Danh_sach_ho_so_trang_${currentPage}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(wb, fileName);
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
                placeholder="Tìm theo mã hồ sơ/họ tên"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <input
                type="date"
                placeholder="dd/mm/yyyy"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Tìm theo địa chỉ cụ thể"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={addressFilter}
                onChange={(e) => setAddressFilter(e.target.value)}
              />
              {/* <select
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
              </select> */}
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
                  name="recordCode"
                  value={formData.recordCode}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      recordCode: e.target.value,
                    }));
                    if (e.target.value && errors.recordCode)
                      setErrors((prev) => ({ ...prev, recordCode: false }));
                  }}
                  className={`w-full border rounded-md px-3 py-2 ${
                    errors.recordCode ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Sinh mã tự động
                </button>
                {errors.recordCode && (
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
                  Nghề nghiệp
                </label>
                <textarea
                  name="occupation"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      occupation: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Ví dụ: Nghề nghiệp: Kỹ sư phần mềm&#10;Nơi làm việc: Công ty ABC&#10;Nhóm ngạch: Nhóm 3&#10;Mức lương: 15 triệu đồng"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hộ khẩu thường trú (Khu phố)
                </label>
                <select
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.permanentResidence
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  value={formData.permanentResidence}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      permanentResidence: e.target.value,
                    }));
                    if (e.target.value && errors.permanentResidence)
                      setErrors((prev) => ({
                        ...prev,
                        permanentResidence: false,
                      }));
                  }}
                >
                  <option value="">Chọn khu phố</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                {errors.permanentResidence && (
                  <p className="text-sm text-red-600 mt-1">
                    Vui lòng điền vào ô này
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ cụ thể
                </label>
                <input
                  name="specificAddress"
                  value={formData.specificAddress}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      specificAddress: e.target.value,
                    }));
                  }}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Ví dụ: 123 Đường ABC, Phường XYZ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dân tộc
                </label>
                <input
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ethnicity: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Kinh"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tôn giáo
                </label>
                <input
                  name="religion"
                  value={formData.religion}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      religion: e.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Phật giáo"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Học vấn, Chuyên môn kỹ thuật
                </label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      education: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Ví dụ: 12/12, Cử nhân CNTT"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đã tốt nghiệp hoặc niên khóa đang học
                </label>
                <textarea
                  name="graduationStatus"
                  value={formData.graduationStatus}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      graduationStatus: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Ví dụ: Tốt nghiệp năm 2022 hoặc Đang học khóa 2023-2027"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đảng viên, đoàn viên hay không
                </label>
                <textarea
                  name="partyMember"
                  value={formData.partyMember}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      partyMember: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Ví dụ: Đảng viên, Đoàn viên, hoặc Không"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="familyInfo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Thông tin Cha, Mẹ, Vợ/Chồng, nghề nghiệp
                </label>
                <textarea
                  id="familyInfo"
                  name="familyInfo"
                  placeholder="Ví dụ: 
                  Cha: Nguyễn Văn A, sinh năm 1960, nghề nghiệp: Công nhân
                  Mẹ: Trần Thị B, sinh năm 1965, nghề nghiệp: Nội trợ 
                  Vợ: Lê Thị C , sinh năm 1995, nghề nghiệp: Giáo viên"
                  value={formData.familyInfo}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      familyInfo: e.target.value,
                    }));
                  }}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                ></textarea>
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {filtered.length} bản ghi
              </span>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                title="Xuất Excel trang hiện tại"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Xuất Excel
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {" "}
            <table className="min-w-full divide-y divide-gray-200 shadow-lg rounded-lg overflow-hidden">
              <thead className="bg-indigo-600">
                <tr className="text-center text-xs font-semibold text-white uppercase tracking-wider leading-tight">
                  <th className="px-3 py-3 w-[8%]">Mã&nbsp;hồ&nbsp;sơ</th>

                  <th className="px-3 py-3 w-[14%] whitespace-normal">
                    <div className="block">Họ tên&nbsp;khai&nbsp;sinh</div>
                    <div className="block">
                      Ngày&nbsp;tháng&nbsp;năm&nbsp;sinh
                    </div>
                  </th>

                  <th className="px-3 py-3 w-[14%] whitespace-normal">
                    <div className="block">Nghề&nbsp;nghiệp</div>
                    <div className="block">Nơi làm việc</div>
                    <div className="block">Nhóm&nbsp;ngạch</div>
                    <div className="block">Mức lương</div>
                  </th>

                  <th className="px-3 py-3 w-[16%] whitespace-normal">
                    <div className="block">
                      Hộ&nbsp;khẩu&nbsp;thường&nbsp;trú
                    </div>
                    <div className="block">
                      Nơi&nbsp;ở&nbsp;hiện&nbsp;nay&nbsp;của&nbsp;bản&nbsp;thân
                    </div>
                  </th>

                  <th className="px-3 py-3 w-[8%] whitespace-normal">
                    <div className="block">Dân&nbsp;tộc</div>
                    <div className="block">Tôn&nbsp;giáo</div>
                  </th>

                  <th className="px-3 py-3 w-[10%] whitespace-normal">
                    <div className="block">Học&nbsp;vấn</div>
                    <div className="block">
                      Chuyên&nbsp;môn&nbsp;kỹ&nbsp;thuật
                    </div>
                  </th>

                  <th className="px-3 py-3 w-[10%] whitespace-normal">
                    <div className="block">Đã&nbsp;tốt&nbsp;nghiệp</div>
                    <div className="block">
                      Hoặc&nbsp;niên&nbsp;khóa&nbsp;đang&nbsp;học
                    </div>
                  </th>

                  <th className="px-3 py-3 w-[8%] whitespace-normal">
                    <div className="block">Đảng&nbsp;viên</div>
                    <div className="block">Đoàn&nbsp;viên</div>
                  </th>

                  <th className="px-3 py-3 w-[12%] whitespace-normal">
                    <div className="block">
                      Thông&nbsp;tin&nbsp;Cha,&nbsp;Mẹ
                    </div>
                    <div className="block">Vợ/Chồng</div>
                  </th>

                  <th className="px-3 py-3 w-[6%] whitespace-normal">
                    Thao&nbsp;tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRecords.map((r, index) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-indigo-50 transition duration-150 ease-in-out ${
                      index % 2 === 1 ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {r.recordCode || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <span className="font-medium text-gray-700">
                        {r.fullName}
                      </span>
                      <br />
                      {r.dateOfBirth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {r.occupation || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div>
                        <span className="font-medium">Khu phố:</span>{" "}
                        {r.permanentResidence || "-"}
                      </div>
                      {r.specificAddress && (
                        <div className="mt-1">
                          <span className="font-medium">Địa chỉ:</span>{" "}
                          {r.specificAddress}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div>
                        <span className="font-medium">Dân tộc:</span>{" "}
                        {r.ethnicity || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Tôn giáo:</span>{" "}
                        {r.religion || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {r.education || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {r.graduationStatus || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {r.partyMember || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      {r.familyInfo || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(r.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3 font-semibold"
                      >
                        Thông tin chi tiết
                      </button>
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 font-semibold"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => confirmDelete(r.id, r.fullName)}
                        className="text-red-600 hover:text-red-900 font-semibold"
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
