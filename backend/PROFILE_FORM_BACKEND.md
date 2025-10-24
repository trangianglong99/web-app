# ProfileForm Backend Integration

## Tổng quan
Đã tạo module ProfileForm trong backend để xử lý dữ liệu từ form ProfileForm.tsx.

## Cấu trúc Backend

### 1. Module ProfileForm
- **Controller**: `profile-form.controller.ts` - Xử lý các HTTP requests
- **Service**: `profile-form.service.ts` - Logic nghiệp vụ
- **DTOs**: 
  - `create-profile-form.dto.ts` - Validation cho tạo mới
  - `update-profile-form.dto.ts` - Validation cho cập nhật
- **Entity**: `profile-form.entity.ts` - Type definitions

### 2. API Endpoints

#### POST `/profile-form`
Tạo hồ sơ mới
```json
{
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "1995-01-01",
  "idNumber": "123456789",
  "placeOfBirth": "Hà Nội",
  "nationality": "Việt Nam",
  "religion": "Không",
  "education": "Đại học",
  "occupation": "Kỹ sư",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "phone": "0123456789",
  "fatherName": "Nguyễn Văn B",
  "fatherOccupation": "Công nhân",
  "fatherAddress": "456 Đường XYZ",
  "motherName": "Trần Thị C",
  "motherOccupation": "Giáo viên",
  "motherAddress": "789 Đường DEF",
  "militaryCode": "MS001",
  "ward": "Trung",
  "unit": "Đơn vị A",
  "status": "Chưa nhập ngũ",
  "enlistmentDate": null,
  "dischargeDate": null,
  "militaryRank": "",
  "militaryUnit": "",
  "healthStatus": "Tốt",
  "criminalRecord": "Không có",
  "politicalBackground": "Trong sạch",
  "foreignTravel": "Chưa có",
  "notes": ""
}
```

#### GET `/profile-form`
Lấy danh sách tất cả hồ sơ
- Query params:
  - `fullName`: Tìm theo tên
  - `ward`: Tìm theo khu phố

#### GET `/profile-form/:id`
Lấy hồ sơ theo ID

#### PATCH `/profile-form/:id`
Cập nhật hồ sơ theo ID

#### DELETE `/profile-form/:id`
Xóa hồ sơ theo ID

#### GET `/profile-form/:id/export`
Lấy dữ liệu hồ sơ để xuất file

### 3. Database Schema
Đã thêm model `ProfileForm` vào Prisma schema với đầy đủ các trường:

```prisma
model ProfileForm {
  id                    String    @id @default(uuid())
  
  // Thông tin cá nhân
  fullName              String
  dateOfBirth           DateTime
  idNumber              String
  placeOfBirth          String
  nationality           String?   @default("Việt Nam")
  religion              String?
  education             String?
  occupation            String?
  address               String
  phone                 String
  
  // Thông tin gia đình
  fatherName            String
  fatherOccupation      String
  fatherAddress         String?
  motherName            String
  motherOccupation      String
  motherAddress         String?
  
  // Thông tin nghĩa vụ quân sự
  militaryCode          String?
  ward                  String?
  unit                  String?
  status                String?   @default("Chưa nhập ngũ")
  enlistmentDate        DateTime?
  dischargeDate         DateTime?
  militaryRank          String?
  militaryUnit          String?
  
  // Thông tin bổ sung
  healthStatus          String?
  criminalRecord        String?
  politicalBackground   String?
  foreignTravel         String?
  notes                 String?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

## Cách sử dụng

### 1. Chạy Migration
```bash
cd backend
npx prisma migrate dev --name add-profile-form
npx prisma generate
```

### 2. Khởi động Backend
```bash
npm run start:dev
```

### 3. Frontend Integration
Frontend đã được cập nhật để:
- Lưu hồ sơ vào database
- Hiển thị danh sách hồ sơ đã lưu
- Tải hồ sơ đã lưu lên form để chỉnh sửa
- Xuất file text từ dữ liệu

## Tính năng
- ✅ Tạo hồ sơ mới
- ✅ Lưu hồ sơ vào database
- ✅ Hiển thị danh sách hồ sơ đã lưu
- ✅ Tải hồ sơ đã lưu lên form
- ✅ Xem trước hồ sơ
- ✅ Xuất file text
- ✅ Validation dữ liệu
- ✅ Tìm kiếm theo tên và khu phố

## API Response Examples

### Tạo hồ sơ thành công
```json
{
  "id": "uuid-here",
  "fullName": "Nguyễn Văn A",
  "dateOfBirth": "1995-01-01T00:00:00.000Z",
  "idNumber": "123456789",
  "placeOfBirth": "Hà Nội",
  "nationality": "Việt Nam",
  "religion": "Không",
  "education": "Đại học",
  "occupation": "Kỹ sư",
  "address": "123 Đường ABC, Quận 1, TP.HCM",
  "phone": "0123456789",
  "fatherName": "Nguyễn Văn B",
  "fatherOccupation": "Công nhân",
  "fatherAddress": "456 Đường XYZ",
  "motherName": "Trần Thị C",
  "motherOccupation": "Giáo viên",
  "motherAddress": "789 Đường DEF",
  "militaryCode": "MS001",
  "ward": "Trung",
  "unit": "Đơn vị A",
  "status": "Chưa nhập ngũ",
  "enlistmentDate": null,
  "dischargeDate": null,
  "militaryRank": "",
  "militaryUnit": "",
  "healthStatus": "Tốt",
  "criminalRecord": "Không có",
  "politicalBackground": "Trong sạch",
  "foreignTravel": "Chưa có",
  "notes": "",
  "createdAt": "2025-01-24T10:47:00.000Z",
  "updatedAt": "2025-01-24T10:47:00.000Z"
}
```

### Lỗi validation
```json
{
  "statusCode": 400,
  "message": [
    "fullName should not be empty",
    "dateOfBirth must be a valid ISO 8601 date string",
    "idNumber should not be empty"
  ],
  "error": "Bad Request"
}
```
