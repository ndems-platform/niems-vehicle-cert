# คู่มือการ Deploy ขึ้น GitHub Pages

## ขั้นตอนที่ 1: สร้าง GitHub Repository

1. ไปที่ [github.com/new](https://github.com/new)
2. ตั้งชื่อ repository เป็น `niems-cert-vehicle`
3. กด **Create repository**

---

## ขั้นตอนที่ 2: ตั้งค่า Credentials (สำคัญ!)

### สร้าง Password Hash

Password จะถูกเก็บเป็น SHA-256 hash เพื่อความปลอดภัย

```bash
# macOS / Linux
echo -n "your_password_here" | shasum -a 256
```

หรือใช้เว็บ: https://emn178.github.io/online-tools/sha256.html

### เพิ่ม Secrets ใน GitHub

1. ไปที่ Repository → **Settings** → **Secrets and variables** → **Actions**
2. กด **New repository secret** แล้วเพิ่ม:

| Secret Name | ค่า |
|-------------|-----|
| `AUTH_USERNAME` | ชื่อผู้ใช้ (เช่น `admin`) |
| `AUTH_PASSWORD_HASH` | SHA-256 hash ของ password |

> ⚠️ **สำคัญ:** ถ้าไม่ตั้งค่า secrets ระบบ Login จะไม่ทำงาน

---

## ขั้นตอนที่ 3: Push Code ขึ้น GitHub

```bash
# เริ่ม git repository (ถ้ายังไม่มี)
git init

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit with login system"

# เพิ่ม remote (เปลี่ยน YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/niems-cert-vehicle.git

# Push
git push -u origin main
```

---

## ขั้นตอนที่ 4: เปิดใช้ GitHub Pages

1. ไปที่ **Settings** → **Pages**
2. ใน **Source** เลือก **GitHub Actions**
3. รอให้ workflow รันเสร็จ (ดูที่ tab **Actions**)

---

## ขั้นตอนที่ 5: เข้าใช้งาน

เมื่อ deploy สำเร็จ เว็บไซต์จะอยู่ที่:
```
https://YOUR_USERNAME.github.io/niems-cert-vehicle/
```

Login ด้วย username และ password ที่ตั้งไว้ในตอน hash

---

## การเปลี่ยน Password

1. สร้าง hash ใหม่จาก password ที่ต้องการ
2. ไปที่ Repository → Settings → Secrets → Actions
3. แก้ไข `AUTH_PASSWORD_HASH` เป็น hash ใหม่
4. Re-run workflow หรือ push commit ใหม่

---

## สำหรับ Development (Local)

1. Copy `.env.example` เป็น `.env`
2. แก้ไขค่า username และ password hash
3. รัน `npm run dev`

**Default credentials สำหรับ development:**
- Username: `admin`
- Password: `123456`

---

## การแก้ไขปัญหา

### Login ไม่ทำงาน
- ตรวจสอบว่าตั้งค่า secrets ใน GitHub แล้ว
- ตรวจสอบว่า hash ถูกต้อง (ไม่มี whitespace ต่อท้าย)

### หน้าว่างหลัง deploy
- ตรวจสอบว่า `base` ใน `vite.config.ts` ตรงกับชื่อ repository

### Build failed
- ตรวจสอบ logs ใน tab Actions
- ตรวจสอบว่า secrets ถูกตั้งค่าครบ

---

## โครงสร้างไฟล์

```
niems-cert-vehicle/
├── .github/workflows/deploy.yml  # GitHub Actions
├── .env.example                  # ตัวอย่าง environment
├── src/
│   ├── hooks/useAuth.ts          # Authentication logic
│   └── components/LoginPage.tsx  # Login UI
├── vite.config.ts
└── package.json
```
