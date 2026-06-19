# 🏥 MediCare Loyihasi

## Loyiha Haqida
MediCare bu to'liq huquqli tibbiy boshqaruv tizimi (Clinic Management System). Loyiha ikkita asosiy qismdan iborat:
* **Frontend**: React.js asosida yozilgan zamonaviy va qulay foydalanuvchi interfeysi.
* **Backend**: Spring Boot va PostgreSQL asosidagi kuchli va xavfsiz RESTful API.

## Hujjatlar
Loyihaning har bir qismi bilan batafsil tanishish uchun quyidagi hujjatlarga murojaat qilishingiz mumkin:
* [Frontend bo'yicha batafsil ma'lumot](./frontend.md)
* [Backend bo'yicha batafsil ma'lumot](./backend.md)

## Dasturni Ishga Tushirish
### Backend (Spring Boot)
1. PostgreSQL ma'lumotlar bazasini sozlang va `application.properties` (yoki `yml`) faylida DB ulanish parametrlarini (username, password, db name) kiriting.
2. `mvn clean install` (yoki loyihadagi `mvnw` orqali) buyrug'i bilan loyihani yig'ing.
3. Loyihani `MediCareApiApplication` (yoki shunga o'xshash) asosiy klassi orqali IDE da yoki terminalda yurgizing.

### Frontend (React)
1. `frontend` papkasiga kiring: `cd frontend`
2. Kutubxonalarni o'rnating: `npm install`
3. Loyihani ishga tushiring: `npm start` yoki `npm run dev` (Vite orqali bo'lsa).
4. Oynada interfeys ochiladi. Backend bilan to'g'ri aloqa qilishiga ishonch hosil qiling.
