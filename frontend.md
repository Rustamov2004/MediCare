# MediCare API - Frontend

## Umumiy ma'lumot
Ushbu frontend loyiha React yordamida yozilgan bo'lib, tibbiy klinika (MediCare) tizimining interfeysi hisoblanadi. Unda turli xil rollarga moslashtirilgan bo'limlar va sahifalar mavjud.

## Asosiy Texnologiyalar
* **React**: Foydalanuvchi interfeysini qurish uchun asosiy kutubxona.
* **React Router Dom**: Sahifalar o'rtasida navigatsiya (routing) uchun.
* **CSS**: Stil berish (App.css, index.css) uchun.

## Loyiha Tuzilmasi
* **`src/pages`**: Asosiy sahifalar joylashgan:
  * `Admin.jsx` - Admin panel (Xodimlar, Xizmatlar, Statistika).
  * `Doctor.jsx` - Shifokorlar ish stoli.
  * `Reception.jsx` - Qabulxona bo'limi.
  * `Monitoring.jsx` - Bemorlarni monitoring qilish bo'limi.
* **`src/components`**: Qayta ishlatiluvchi UI komponentlar, xususan `ToastContext.jsx` kabi bildirishnomalar uchun komponentlar.
* **`src/api.js`**: Backend bilan aloqa qilish uchun funksiyalar yig'indisi.
* **`src/App.jsx`**: Dasturning asosiy komponenti va marshrutlash (routing) mantig'i. Barcha rollar uchun loyiha shu yerdan boshqariladi.

## Rollar
* **Admin**: Tizim sozlamalari va hisobotlarni ko'radi, xodim qo'shadi, tizim statistikasini tahlil qiladi.
* **Shifokor (Doctor)**: Bemorlarni qabul qiladi, tashxis qo'yadi.
* **Qabulxona (Reception)**: Bemorlarni ro'yxatga oladi.
* **Monitoring**: Bemorlarning holatini kuzatib boradi.
