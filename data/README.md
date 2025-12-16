# Fei Yi Shop v5

ร้านค้าออนไลน์เครื่องมือช่าง พร้อมระบบจัดการหลังบ้านที่ปลอดภัยด้วย Firebase Authentication

## 📁 โครงสร้างโปรเจค

```
Fei-Yi-Shop/
├── index.html              ← Redirect ไป shop
├── shop/
│   ├── index.html          ← หน้าแสดงสินค้า
│   ├── product.html        ← หน้ารายละเอียดสินค้า
│   └── shop.js             ← Logic เฉพาะร้านค้า
├── admin/
│   ├── login.html          ← หน้า Login
│   ├── admin.html          ← หน้าจัดการสินค้า
│   └── admin.js            ← Logic จัดการ + Auth
├── js/
│   ├── firebase-config.js  ← Firebase Configuration
│   └── shared.js           ← Services ที่ใช้ร่วมกัน
├── css/
│   └── style.css           ← Stylesheet ทั้งหมด
├── assets/
│   └── images/             ← รูปสินค้า
└── README.md
```

## 🔐 ตั้งค่า Firebase Authentication

### ขั้นตอนที่ 1: เปิดใช้งาน Authentication

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจค **feiyi-shop**
3. คลิก **Authentication** ในเมนูด้านซ้าย
4. คลิกแท็บ **Sign-in method**
5. คลิก **Email/Password**
6. เปิดใช้งาน **Enable** → คลิก **Save**

### ขั้นตอนที่ 2: สร้างบัญชี Admin

1. ในหน้า Authentication คลิกแท็บ **Users**
2. คลิก **Add user**
3. กรอก Email และ Password สำหรับ Admin
   - ตัวอย่าง: `admin@feiyishop.com` / `รหัสผ่านที่ต้องการ`
4. คลิก **Add user**

### ขั้นตอนที่ 3: ทดสอบ

1. เปิด `admin/login.html`
2. ใส่ Email และ Password ที่สร้างไว้
3. ถ้าถูกต้องจะเข้าสู่หน้า Admin Panel

## 🛒 การใช้งาน

### สำหรับลูกค้า
- เปิด `shop/index.html` หรือ `index.html`
- ดูสินค้า เพิ่มลงตะกร้า สั่งซื้อผ่าน LINE

### สำหรับ Admin
- เปิด `admin/login.html`
- Login ด้วย Email/Password
- จัดการสินค้า หมวดหมู่ Export/Import

## 🔥 ฟีเจอร์

- ✅ Firebase Firestore - ข้อมูล sync ทุก browser
- ✅ Firebase Auth - ป้องกันหน้า Admin
- ✅ Gallery รูปหลายมุม + Zoom
- ✅ Export/Import CSV
- ✅ Responsive Design

## 📝 หมายเหตุ

- ต้องเปิดใช้งาน Firebase Authentication ก่อนใช้งาน Admin
- รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร
- สามารถเพิ่ม Admin หลายคนได้ใน Firebase Console
