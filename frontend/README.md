# Management Profile - React Application

## 🚀 Features

- ✅ **React 18** với TypeScript
- ✅ **Vite** - Build tool siêu nhanh
- ✅ **React Router** - Client-side routing
- ✅ **Tailwind CSS** - Utility-first CSS framework
- ✅ **Link Management System** - Hệ thống quản lý URL tập trung
- ✅ **File Upload** - Upload files với progress tracking
- ✅ **Social Sharing** - Chia sẻ lên social media
- ✅ **URL Validation** - Kiểm tra URLs và emails
- ✅ **Environment Configuration** - Cấu hình theo môi trường

## 📁 Cấu trúc Dự án

```
src/
├── components/
│   ├── Layout.tsx                    # Layout chính với navigation
│   └── LinkManagementExample.tsx    # Demo component
├── pages/
│   ├── Home.tsx                      # Trang chủ
│   ├── Profile.tsx                   # Quản lý profile
│   ├── Dashboard.tsx                 # Dashboard với stats
│   └── LinkManagementDemo.tsx       # Demo link management
├── config/
│   └── links.ts                      # Cấu hình URLs
├── utils/
│   └── linkUtils.ts                  # Utility functions
├── App.tsx                           # App component chính
├── main.tsx                          # Entry point
└── index.css                         # Global styles
```

## 🛠️ Cài đặt và Chạy

### 1. Cài đặt Dependencies

```bash
yarn install
```

### 2. Cấu hình Environment

```bash
cp env.example .env.local
```

Cập nhật các giá trị trong `.env.local`:

```env
VITE_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:8000/api
```

### 3. Chạy Development Server

```bash
yarn dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

### 4. Build cho Production

```bash
yarn build
```

### 5. Preview Production Build

```bash
yarn preview
```

## 🔗 Link Management System

Hệ thống quản lý link được thiết kế để:

- **Tập trung hóa** tất cả URLs trong một file config
- **Environment-based** - Tự động switch giữa dev/prod
- **Type-safe** - Full TypeScript support
- **Utility functions** - Dễ dàng sử dụng

### Sử dụng trong Code

```typescript
import { getApiUrl, getRouteUrl } from "../config/links";

// API requests
const authUrl = getApiUrl("auth");
const response = await fetch(authUrl + "/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

// Navigation
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate(getRouteUrl("profile"));
```

### Upload Files

```typescript
import { uploadFile } from "../utils/linkUtils";

const handleUpload = async (file: File) => {
  try {
    const result = await uploadFile(file, "images", (progress) => {
      console.log(`Progress: ${progress}%`);
    });
    console.log("Upload successful:", result);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

### Social Sharing

```typescript
import { shareToSocial } from "../utils/linkUtils";

// Share lên Facebook
shareToSocial("facebook", "https://example.com", "Check this out!");
```

## 🎨 UI Components

### Layout

- Responsive navigation bar
- Active route highlighting
- Clean, modern design

### Pages

- **Home**: Welcome page với feature overview
- **Profile**: Profile management với file upload
- **Dashboard**: Statistics và configuration info
- **Link Demo**: Interactive demo của link management system

## 🔧 Configuration

### Vite Config

- React plugin
- TypeScript support
- Tailwind CSS integration
- Development server với hot reload

### Tailwind CSS

- Utility-first approach
- Responsive design
- Custom color scheme
- Component-based styling

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với:

- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Performance

- **Vite** - Lightning fast HMR
- **React 18** - Concurrent features
- **Code splitting** - Automatic route-based splitting
- **Tree shaking** - Unused code elimination
- **Optimized builds** - Minified và compressed

## 🔒 Security

- Environment variable validation
- URL sanitization
- File type validation
- Secure external link handling

## 📊 Development Tools

- **TypeScript** - Type safety
- **ESLint** - Code quality
- **Hot Module Replacement** - Instant updates
- **Source maps** - Easy debugging

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn preview      # Preview production build
yarn lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Chuyển đổi thành công từ Next.js sang React!** 🎉

Dự án giờ đây sử dụng React thuần với Vite, mang lại tốc độ phát triển nhanh hơn và cấu trúc đơn giản hơn, trong khi vẫn giữ nguyên tất cả tính năng của hệ thống Link Management.
