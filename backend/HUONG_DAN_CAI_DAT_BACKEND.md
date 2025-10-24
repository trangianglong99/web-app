# Hướng dẫn cài đặt và chạy Backend

## Bước 1: Cài đặt Node.js
1. Truy cập: https://nodejs.org/
2. Tải phiên bản LTS (Long Term Support)
3. Cài đặt Node.js
4. Restart máy tính
5. Kiểm tra cài đặt:
   ```bash
   node --version
   npm --version
   ```

## Bước 2: Cài đặt dependencies
```bash
cd backend
npm install
```

## Bước 3: Chạy Migration
```bash
npx prisma migrate dev --name add-profile-form
npx prisma generate
```

## Bước 4: Khởi động Backend
```bash
npm run start:dev
```

Backend sẽ chạy trên port 3001 (mặc định của NestJS).

## API Endpoints ProfileForm

### 1. Tạo hồ sơ mới
```
POST http://localhost:3001/profile-form
Content-Type: application/json

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
  "healthStatus": "Tốt",
  "criminalRecord": "Không có",
  "politicalBackground": "Trong sạch",
  "foreignTravel": "Chưa có",
  "notes": ""
}
```

### 2. Lấy danh sách hồ sơ
```
GET http://localhost:3001/profile-form
```

### 3. Lấy hồ sơ theo ID
```
GET http://localhost:3001/profile-form/{id}
```

### 4. Cập nhật hồ sơ
```
PATCH http://localhost:3001/profile-form/{id}
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A Updated",
  "notes": "Đã cập nhật thông tin"
}
```

### 5. Xóa hồ sơ
```
DELETE http://localhost:3001/profile-form/{id}
```

### 6. Xuất hồ sơ
```
GET http://localhost:3001/profile-form/{id}/export
```

## Cấu trúc Database

Bảng `ProfileForm` đã được tạo với các trường:
- Thông tin cá nhân: fullName, dateOfBirth, idNumber, placeOfBirth, nationality, religion, education, occupation, address, phone
- Thông tin gia đình: fatherName, fatherOccupation, fatherAddress, motherName, motherOccupation, motherAddress
- Thông tin nghĩa vụ quân sự: militaryCode, ward, unit, status, enlistmentDate, dischargeDate, militaryRank, militaryUnit
- Thông tin bổ sung: healthStatus, criminalRecord, politicalBackground, foreignTravel, notes

## Lưu ý
- Backend cần chạy trước khi frontend có thể sử dụng API
- Database SQLite được sử dụng (file database.db)
- CORS đã được cấu hình để cho phép frontend kết nối
