# MediCare API - Backend

## Umumiy ma'lumot
Loyiha Spring Boot freymvorkiga asoslangan Java ilovasi bo'lib, MediCare loyihasining backend qismi sifatida RESTful API xizmatlarini taqdim etadi. Tizim tibbiy klinika xodimlari va bemorlar ma'lumotlarini markazlashgan tarzda boshqarishga xizmat qiladi.

## Asosiy Texnologiyalar
* **Java 17**: Asosiy dasturlash tili.
* **Spring Boot 3.3.0**: Loyiha poydevori.
* **Spring Data JPA & Hibernate**: Ma'lumotlar bazasi bilan ORM texnologiyasi asosida ishlash uchun.
* **PostgreSQL**: Ma'lumotlar bazasi (Database).
* **Lombok**: Boilerplate kodlarni (getter, setter, constructor) qisqartirish uchun.
* **MapStruct**: Obyektlarni bir turdan ikkinchi turga (Entity -> DTO) o'tkazish uchun.
* **Springdoc OpenAPI (Swagger)**: API hujjatlarini avtomatik generatsiya qilish va testlash uchun.

## Qaramliklar (Dependencies)
* `spring-boot-starter-web`: REST API larni yaratish uchun.
* `spring-boot-starter-data-jpa`: Baza bilan ishlash va tranzaksiyalarni boshqarish uchun.
* `spring-boot-starter-validation`: Kelayotgan so'rovlarning to'g'riligini validatsiya qilish uchun.
* `postgresql`: Baza drayveri.
* `springdoc-openapi-starter-webmvc-ui`: Swagger UI integratsiyasi uchun.
