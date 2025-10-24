import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, militaryStatusFromApi } from "../lib/api";

type MilitaryDetail = {
  id: string;
  recordCode?: string;
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  ward: string;
  unit?: string;
  status: string;
  occupation?: string;
  ethnicity?: string;
  education?: string;
  graduationStatus?: string;
  partyMember?: string;
  familyInfo?: string;
  createdAt: string;
  updatedAt: string;
};

const MilitaryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<MilitaryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        setError("Không tìm thấy ID hồ sơ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiGet<MilitaryDetail>(`/military/${id}`);
        setDetail(data);
      } catch (err: any) {
        setError(err.message || "Không thể tải thông tin chi tiết");
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const handleEdit = () => {
    navigate(`/military/edit/${id}`);
  };

  const handleBack = () => {
    navigate("/military");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-4">{error || "Không tìm thấy thông tin hồ sơ"}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chi tiết hồ sơ nghĩa vụ quân sự
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Mã hồ sơ: {detail.recordCode || "Chưa có"}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleBack}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã hồ sơ
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.recordCode || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.fullName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Date(detail.dateOfBirth).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số CMND/CCCD
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.idNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hộ khẩu thường trú
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.ward}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.unit || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái nghĩa vụ
                </label>
                <p className={`text-sm px-3 py-2 rounded-md ${
                  detail.status === 'CHUA_NHAP_NGU' 
                    ? 'bg-red-100 text-red-800' 
                    : detail.status === 'DANG_TAI_NGU'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {militaryStatusFromApi(detail.status)}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nghề nghiệp
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.occupation || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dân tộc, Tôn giáo
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.ethnicity || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Học vấn, Chuyên môn kỹ thuật
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.education || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đã tốt nghiệp hoặc niên khóa đang học
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.graduationStatus || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đảng viên, đoàn viên hay không
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {detail.partyMember || "Chưa có"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thông tin Cha, Mẹ, Vợ/Chồng
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[60px]">
                  {detail.familyInfo || "Chưa có"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin hệ thống */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin hệ thống</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tạo
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Date(detail.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày cập nhật cuối
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Date(detail.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilitaryDetail;
