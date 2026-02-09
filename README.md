# BaanPoolVilla - เว็บจองบ้านพักพูลวิลล่า

## เกี่ยวกับโปรเจค

เว็บไซต์จองบ้านพักพูลวิลล่าครบวงจร สร้างด้วย **Next.js 14** (App Router) + **Tailwind CSS** + **Firebase**

### ฟีเจอร์หลัก

1. **หน้าแรก (Homepage)** - Hero section พร้อมค้นหา, รายการบ้านแนะนำ, ทำเลยอดนิยม, รีวิว
2. **หน้ารายการวิลล่า** - ค้นหา/กรอง ตามทำเล, จำนวนคน, ราคา
3. **หน้ารายละเอียดบ้าน** - แกลเลอรี่รูป, ปฏิทินจอง, สิ่งอำนวยความสะดวก, ฟอร์มจอง
4. **ปฏิทินจอง** - ซิงค์กับระบบ Calendar ผ่านรหัสบ้าน (code)
5. **ระบบหลังบ้าน (Admin)** - เพิ่ม/แก้ไข/ลบบ้านพัก, อัปโหลดรูป, จัดการสถานะ

### การซิงค์ปฏิทิน

- ใช้ Firebase Firestore ตัวเดียวกับโปรเจค Calendar
- Collection `houses` = ข้อมูลปฏิทินจาก Calendar (read-only)
- Collection `website_houses` = ข้อมูลบ้านพักบนเว็บ (full CRUD)
- ซิงค์ข้อมูลผ่านฟิลด์ `code` (รหัสบ้าน)

## วิธีติดตั้ง

```bash
# 1. ติดตั้ง dependencies
cd website
npm install

# 2. ตั้งค่า Firebase (ไฟล์ .env.local มาให้แล้ว)
# แก้ไขค่า Firebase config ถ้าต้องการเปลี่ยน

# 3. รันโปรเจค
npm run dev
```

เปิดเบราว์เซอร์ไปที่ http://localhost:3000

## หน้าต่างๆ

| URL | หน้า |
|-----|------|
| `/` | หน้าแรก |
| `/villas` | รายการวิลล่าทั้งหมด |
| `/villas/[id]` | รายละเอียดบ้าน + ปฏิทิน |
| `/about` | เกี่ยวกับเรา |
| `/contact` | ติดต่อเรา |
| `/admin` | แดชบอร์ดหลังบ้าน |
| `/admin/login` | เข้าสู่ระบบ admin |
| `/admin/houses` | จัดการบ้านพัก |
| `/admin/houses/new` | เพิ่มบ้านพักใหม่ |
| `/admin/houses/[id]` | แก้ไขบ้านพัก |
| `/admin/calendar` | ดูปฏิทินจอง |

## ระบบ Admin

- **URL:** `/admin`
- **Username:** `admin`
- **Password:** `admin123`

### ฟีเจอร์ Admin
- แดชบอร์ดภาพรวม
- เพิ่ม/แก้ไข/ลบบ้านพัก
- อัปโหลดรูปภาพ (เก็บใน Firebase Storage)
- เลือกสิ่งอำนวยความสะดวก
- ตั้งราคา/ห้องนอน/ห้องน้ำ/จำนวนคน
- เปิด/ปิดการแสดงผล
- ตั้งเป็นบ้านแนะนำ
- ดูปฏิทินจองที่ซิงค์กับ Calendar

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Icons:** React Icons
- **Calendar:** Custom component
- **Notifications:** React Hot Toast
