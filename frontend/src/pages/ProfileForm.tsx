import { useState, useEffect } from "react";
import { apiPost, apiGet } from "../lib/api";

type ProfileData = {
  // Thông tin cá nhân
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  placeOfBirth: string;
  nationality: string;
  religion: string;
  education: string;
  occupation: string;
  address: string;
  phone: string;
  
  // Thông tin gia đình
  fatherName: string;
  fatherOccupation: string;
  fatherAddress: string;
  motherName: string;
  motherOccupation: string;
  motherAddress: string;
  
  // Thông tin nghĩa vụ quân sự
  militaryCode: string;
  ward: string;
  unit: string;
  status: string;
  enlistmentDate: string;
  dischargeDate: string;
  militaryRank: string;
  militaryUnit: string;
  
  // Thông tin bổ sung
  healthStatus: string;
  criminalRecord: string;
  politicalBackground: string;
  foreignTravel: string;
  notes: string;
};

const initialData: ProfileData = {
  fullName: "",
  dateOfBirth: "",
  idNumber: "",
  placeOfBirth: "",
  nationality: "Việt Nam",
  religion: "",
  education: "",
  occupation: "",
  address: "",
  phone: "",
  fatherName: "",
  fatherOccupation: "",
  fatherAddress: "",
  motherName: "",
  motherOccupation: "",
  motherAddress: "",
  militaryCode: "",
  ward: "",
  unit: "",
  status: "Chưa nhập ngũ",
  enlistmentDate: "",
  dischargeDate: "",
  militaryRank: "",
  militaryUnit: "",
  healthStatus: "",
  criminalRecord: "",
  politicalBackground: "",
  foreignTravel: "",
  notes: "",
};

const ProfileForm = () => {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);

  const wards = [
    "Trung", "Đông", "Phú Hội", "đồng an 1", "đồng an 2", "đồng an 3",
    "bình đức 1", "bình đức 2", "bình đức 3", "bình đáng", "đông ba"
  ];

  const statusOptions = ["Chưa nhập ngũ", "Đang tại ngũ", "Xuất ngũ"];

  // Load saved profiles on component mount
  useEffect(() => {
    loadSavedProfiles();
  }, []);

  const loadSavedProfiles = async () => {
    try {
      const response = await apiGet("/profile-form");
      setSavedProfiles(response.data || []);
    } catch (error) {
      console.error("Error loading saved profiles:", error);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateForm = () => {
    const requiredFields: (keyof ProfileData)[] = [
      'fullName', 'dateOfBirth', 'idNumber', 'placeOfBirth', 'address', 'phone',
      'fatherName', 'fatherOccupation', 'motherName', 'motherOccupation'
    ];
    
    const newErrors: {[key: string]: boolean} = {};
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = true;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePreview = () => {
    if (!validateForm()) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setShowPreview(true);
  };

  const saveProfile = async () => {
    if (!validateForm()) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    setIsLoading(true);
    try {
      await apiPost("/profile-form", formData);
      alert("Lưu hồ sơ thành công!");
      setFormData(initialData);
      loadSavedProfiles(); // Reload the list
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Có lỗi xảy ra khi lưu hồ sơ");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = (profile: any) => {
    setFormData({
      fullName: profile.fullName || "",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
      idNumber: profile.idNumber || "",
      placeOfBirth: profile.placeOfBirth || "",
      nationality: profile.nationality || "Việt Nam",
      religion: profile.religion || "",
      education: profile.education || "",
      occupation: profile.occupation || "",
      address: profile.address || "",
      phone: profile.phone || "",
      fatherName: profile.fatherName || "",
      fatherOccupation: profile.fatherOccupation || "",
      fatherAddress: profile.fatherAddress || "",
      motherName: profile.motherName || "",
      motherOccupation: profile.motherOccupation || "",
      motherAddress: profile.motherAddress || "",
      militaryCode: profile.militaryCode || "",
      ward: profile.ward || "",
      unit: profile.unit || "",
      status: profile.status || "Chưa nhập ngũ",
      enlistmentDate: profile.enlistmentDate ? new Date(profile.enlistmentDate).toISOString().split('T')[0] : "",
      dischargeDate: profile.dischargeDate ? new Date(profile.dischargeDate).toISOString().split('T')[0] : "",
      militaryRank: profile.militaryRank || "",
      militaryUnit: profile.militaryUnit || "",
      healthStatus: profile.healthStatus || "",
      criminalRecord: profile.criminalRecord || "",
      politicalBackground: profile.politicalBackground || "",
      foreignTravel: profile.foreignTravel || "",
      notes: profile.notes || "",
    });
  };

  const downloadAsText = () => {
    if (!validateForm()) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    const content = `
HỒ SƠ NGHĨA VỤ QUÂN SỰ

I. THÔNG TIN CÁ NHÂN
Họ và tên: ${formData.fullName}
Ngày sinh: ${formData.dateOfBirth}
CMND/CCCD: ${formData.idNumber}
Nơi sinh: ${formData.placeOfBirth}
Quốc tịch: ${formData.nationality}
Tôn giáo: ${formData.religion || "Không"}
Trình độ học vấn: ${formData.education}
Nghề nghiệp: ${formData.occupation}
Địa chỉ: ${formData.address}
Số điện thoại: ${formData.phone}

II. THÔNG TIN GIA ĐÌNH
Họ tên cha: ${formData.fatherName}
Nghề nghiệp cha: ${formData.fatherOccupation}
Địa chỉ cha: ${formData.fatherAddress}
Họ tên mẹ: ${formData.motherName}
Nghề nghiệp mẹ: ${formData.motherOccupation}
Địa chỉ mẹ: ${formData.motherAddress}

III. THÔNG TIN NGHĨA VỤ QUÂN SỰ
Mã hồ sơ: ${formData.militaryCode}
Khu phố: ${formData.ward}
Đơn vị: ${formData.unit}
Trạng thái: ${formData.status}
Ngày nhập ngũ: ${formData.enlistmentDate || "Chưa có"}
Ngày xuất ngũ: ${formData.dischargeDate || "Chưa có"}
Cấp bậc: ${formData.militaryRank || "Chưa có"}
Đơn vị quân đội: ${formData.militaryUnit || "Chưa có"}

IV. THÔNG TIN BỔ SUNG
Tình trạng sức khỏe: ${formData.healthStatus || "Tốt"}
Tiền án tiền sự: ${formData.criminalRecord || "Không có"}
Lý lịch chính trị: ${formData.politicalBackground || "Trong sạch"}
Đi nước ngoài: ${formData.foreignTravel || "Chưa có"}
Ghi chú: ${formData.notes || "Không có"}

Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}
Người lập hồ sơ
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ho_so_nghia_vu_quan_su_${formData.fullName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Điền thông tin hồ sơ nghĩa vụ quân sự
        </h1>

        {/* Saved Profiles Section */}
        {savedProfiles.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hồ sơ đã lưu ({savedProfiles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedProfiles.map((profile) => (
                <div key={profile.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <h3 className="font-medium text-gray-900">{profile.fullName}</h3>
                  <p className="text-sm text-gray-600">CMND: {profile.idNumber}</p>
                  <p className="text-sm text-gray-600">Khu phố: {profile.ward || "Chưa có"}</p>
                  <p className="text-sm text-gray-600">
                    Tạo: {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <button
                    onClick={() => loadProfile(profile)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Tải lên form
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form className="space-y-8">
            {/* Thông tin cá nhân */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                I. THÔNG TIN CÁ NHÂN
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.fullName ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.dateOfBirth ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CMND/CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.idNumber ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Nhập số CMND/CCCD"
                  />
                  {errors.idNumber && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nơi sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.placeOfBirth ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Nhập nơi sinh"
                  />
                  {errors.placeOfBirth && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quốc tịch
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Quốc tịch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tôn giáo
                  </label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tôn giáo (nếu có)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trình độ học vấn
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: Đại học, Trung cấp..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nghề nghiệp
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nghề nghiệp hiện tại"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.address ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    rows={3}
                    placeholder="Nhập địa chỉ đầy đủ"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.phone ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Số điện thoại liên hệ"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin gia đình */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                II. THÔNG TIN GIA ĐÌNH
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên cha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.fatherName ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Họ và tên cha"
                  />
                  {errors.fatherName && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nghề nghiệp cha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fatherOccupation}
                    onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.fatherOccupation ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Nghề nghiệp của cha"
                  />
                  {errors.fatherOccupation && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ cha
                  </label>
                  <textarea
                    value={formData.fatherAddress}
                    onChange={(e) => handleInputChange('fatherAddress', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Địa chỉ của cha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ tên mẹ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.motherName ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Họ và tên mẹ"
                  />
                  {errors.motherName && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nghề nghiệp mẹ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.motherOccupation}
                    onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.motherOccupation ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Nghề nghiệp của mẹ"
                  />
                  {errors.motherOccupation && (
                    <p className="text-sm text-red-600 mt-1">Vui lòng điền vào ô này</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ mẹ
                  </label>
                  <textarea
                    value={formData.motherAddress}
                    onChange={(e) => handleInputChange('motherAddress', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Địa chỉ của mẹ"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin nghĩa vụ quân sự */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                III. THÔNG TIN NGHĨA VỤ QUÂN SỰ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã hồ sơ
                  </label>
                  <input
                    type="text"
                    value={formData.militaryCode}
                    onChange={(e) => handleInputChange('militaryCode', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mã hồ sơ nghĩa vụ quân sự"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Khu phố
                  </label>
                  <select
                    value={formData.ward}
                    onChange={(e) => handleInputChange('ward', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn khu phố</option>
                    {wards.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn vị
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Đơn vị quân đội"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày nhập ngũ
                  </label>
                  <input
                    type="date"
                    value={formData.enlistmentDate}
                    onChange={(e) => handleInputChange('enlistmentDate', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày xuất ngũ
                  </label>
                  <input
                    type="date"
                    value={formData.dischargeDate}
                    onChange={(e) => handleInputChange('dischargeDate', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cấp bậc
                  </label>
                  <input
                    type="text"
                    value={formData.militaryRank}
                    onChange={(e) => handleInputChange('militaryRank', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: Binh nhì, Hạ sĩ..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn vị quân đội
                  </label>
                  <input
                    type="text"
                    value={formData.militaryUnit}
                    onChange={(e) => handleInputChange('militaryUnit', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tên đơn vị quân đội"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                IV. THÔNG TIN BỔ SUNG
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tình trạng sức khỏe
                  </label>
                  <input
                    type="text"
                    value={formData.healthStatus}
                    onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tình trạng sức khỏe hiện tại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiền án tiền sự
                  </label>
                  <input
                    type="text"
                    value={formData.criminalRecord}
                    onChange={(e) => handleInputChange('criminalRecord', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Có hoặc không có tiền án"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý lịch chính trị
                  </label>
                  <input
                    type="text"
                    value={formData.politicalBackground}
                    onChange={(e) => handleInputChange('politicalBackground', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lý lịch chính trị"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đi nước ngoài
                  </label>
                  <input
                    type="text"
                    value={formData.foreignTravel}
                    onChange={(e) => handleInputChange('foreignTravel', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Có đi nước ngoài hay không"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Các ghi chú khác..."
                  />
                </div>
              </div>
            </div>

            {/* Nút xuất file */}
            <div className="flex justify-center gap-4 pt-6">
              <button
                type="button"
                onClick={saveProfile}
                disabled={isLoading}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold disabled:opacity-50"
              >
                {isLoading ? "Đang lưu..." : "Lưu hồ sơ"}
              </button>
              <button
                type="button"
                onClick={generatePreview}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                Xem trước
              </button>
              <button
                type="button"
                onClick={downloadAsText}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
              >
                Xuất file Text (.txt)
              </button>
            </div>
          </form>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Xem trước hồ sơ
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">HỒ SƠ NGHĨA VỤ QUÂN SỰ</h1>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-3">I. THÔNG TIN CÁ NHÂN</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Họ và tên:</strong> {formData.fullName}</div>
                      <div><strong>Ngày sinh:</strong> {formData.dateOfBirth}</div>
                      <div><strong>CMND/CCCD:</strong> {formData.idNumber}</div>
                      <div><strong>Nơi sinh:</strong> {formData.placeOfBirth}</div>
                      <div><strong>Quốc tịch:</strong> {formData.nationality}</div>
                      <div><strong>Tôn giáo:</strong> {formData.religion || "Không"}</div>
                      <div><strong>Trình độ học vấn:</strong> {formData.education}</div>
                      <div><strong>Nghề nghiệp:</strong> {formData.occupation}</div>
                      <div className="col-span-2"><strong>Địa chỉ:</strong> {formData.address}</div>
                      <div><strong>Số điện thoại:</strong> {formData.phone}</div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-3">II. THÔNG TIN GIA ĐÌNH</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Họ tên cha:</strong> {formData.fatherName}</div>
                      <div><strong>Nghề nghiệp cha:</strong> {formData.fatherOccupation}</div>
                      <div className="col-span-2"><strong>Địa chỉ cha:</strong> {formData.fatherAddress}</div>
                      <div><strong>Họ tên mẹ:</strong> {formData.motherName}</div>
                      <div><strong>Nghề nghiệp mẹ:</strong> {formData.motherOccupation}</div>
                      <div className="col-span-2"><strong>Địa chỉ mẹ:</strong> {formData.motherAddress}</div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-3">III. THÔNG TIN NGHĨA VỤ QUÂN SỰ</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Mã hồ sơ:</strong> {formData.militaryCode}</div>
                      <div><strong>Khu phố:</strong> {formData.ward}</div>
                      <div><strong>Đơn vị:</strong> {formData.unit}</div>
                      <div><strong>Trạng thái:</strong> {formData.status}</div>
                      <div><strong>Ngày nhập ngũ:</strong> {formData.enlistmentDate || "Chưa có"}</div>
                      <div><strong>Ngày xuất ngũ:</strong> {formData.dischargeDate || "Chưa có"}</div>
                      <div><strong>Cấp bậc:</strong> {formData.militaryRank || "Chưa có"}</div>
                      <div><strong>Đơn vị quân đội:</strong> {formData.militaryUnit || "Chưa có"}</div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-3">IV. THÔNG TIN BỔ SUNG</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Tình trạng sức khỏe:</strong> {formData.healthStatus || "Tốt"}</div>
                      <div><strong>Tiền án tiền sự:</strong> {formData.criminalRecord || "Không có"}</div>
                      <div><strong>Lý lịch chính trị:</strong> {formData.politicalBackground || "Trong sạch"}</div>
                      <div><strong>Đi nước ngoài:</strong> {formData.foreignTravel || "Chưa có"}</div>
                      <div className="col-span-2"><strong>Ghi chú:</strong> {formData.notes || "Không có"}</div>
                    </div>
                  </div>

                  <div className="text-right mt-8">
                    <div className="text-sm italic">
                      Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                    </div>
                    <div className="text-sm font-semibold mt-2">Người lập hồ sơ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
