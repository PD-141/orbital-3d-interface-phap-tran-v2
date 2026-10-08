# ORBITAL V3 // Pháp Trận GPU-Optimized Interface

Một giao diện 3D tương tác kiểu futuristic được xây bằng **Three.js + Vite**.

## Tính năng

- 3D WebGL thực, không phải video giả lập.
- Kéo chuột / touch để xoay hệ thống 360°.
- Có quán tính sau khi thả chuột.
- Không thao tác một lúc → tự động trở lại chế độ quay.
- Wheel / trackpad để zoom.
- Hệ thống nhiều orbital rings, wireframe spheres, core, particle markers và star field.
- Bloom/glow hậu kỳ.
- Responsive cho desktop và mobile.
- Phím `R` để reset góc nhìn.
- Có HUD/telemetry tạo cảm giác như một hệ thống điều khiển thật.

## Chạy local

Cần Node.js 18+.

```bash
npm install
npm run dev
```

Mở URL Vite hiển thị, thường là:

```text
http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## Deploy Vercel

Cách 1 — import repository GitHub vào Vercel:

1. Đẩy project lên GitHub.
2. Vào Vercel.
3. Import repository.
4. Framework Preset: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Deploy.

Cách 2 — Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Deploy GitHub Pages

Project đã dùng `base: './'`, nên có thể build thành static site:

```bash
npm run build
```

Sau đó publish thư mục `dist`.

## Chỉnh độ phức tạp

Phần chính nằm trong:

```text
src/main.js
```

Bạn có thể tăng:

- `starCount` để tăng số hạt.
- số phần tử trong `orbitConfigs` để thêm vòng.
- số `marker` để thêm chi tiết.
- `bloom.strength` để tăng/giảm glow.
- `IDLE_DELAY` để thay đổi thời gian trước khi tự động quay.

## Ghi chú

Three.js được cài từ npm và Vite bundle thành project production. Google Fonts được tải từ CDN khi trang chạy; nếu muốn hoàn toàn offline, có thể thay bằng font local.

## V3 performance profile

V3 preserves the layered Pháp Trận / Bát Quái / 64 quẻ visual system while reducing GPU pressure: capped DPR, smaller bloom render targets, fewer background stars, lower subdivision on selected meshes, and smaller canvas glyph textures.
