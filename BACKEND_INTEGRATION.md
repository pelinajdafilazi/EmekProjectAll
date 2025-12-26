# Backend Entegrasyon Rehberi

## Gerekli Bilgiler

Backend'e bağlanmak için aşağıdaki bilgilere ihtiyacımız var:

### 1. Backend Base URL
- **Development:** `http://localhost:8080` (şu an package.json'da bu var)
- **Production:** `?` (üretim ortamı URL'i)

### 2. API Endpoint'leri

Swagger UI'dan aşağıdaki endpoint'lerin tam path'lerini kontrol edin:

#### Grup İşlemleri:
- [ ] `GET /api/groups` - Tüm grupları getir
- [ ] `GET /api/groups/{id}` - Grup detayı getir
- [ ] `POST /api/groups` - Yeni grup oluştur
- [ ] `PUT /api/groups/{id}` - Grup güncelle
- [ ] `DELETE /api/groups/{id}` - Grup sil

#### Grup Öğrenci İşlemleri:
- [ ] `GET /api/groups/{id}/students` - Grubun öğrencilerini getir
- [ ] `POST /api/groups/{id}/students` - Gruba öğrenci ata
- [ ] `DELETE /api/groups/{id}/students/{studentId}` - Gruptan öğrenci çıkar

### 3. Request/Response Formatları

#### Grup Oluşturma (POST /api/groups):
```json
{
  "name": "string",
  "minAge": number,
  "maxAge": number
}
```

#### Grup Response Formatı:
```json
{
  "id": "string|number",
  "name": "string",
  "minAge": number,
  "maxAge": number,
  // Diğer alanlar?
}
```

### 4. Authentication
- [ ] Authentication gerekiyor mu? (Bearer token, API key, vs.)
- [ ] Varsa token nasıl alınacak?
- [ ] Header'da nasıl gönderilecek? (`Authorization: Bearer {token}`)

### 5. Hata Formatı
Backend'den dönen hata formatı:
```json
{
  "message": "string",
  "error": "string",
  // Diğer alanlar?
}
```

### 6. CORS
- [ ] CORS ayarları yapıldı mı?
- [ ] Frontend URL'i backend'de whitelist'te mi?

---

## Swagger UI Bilgileri

Swagger UI URL'inizi paylaşırsanız endpoint'leri otomatik kontrol edebilirim.

**Swagger UI URL:** `?`

---

## Notlar

- Şu an `package.json`'da proxy ayarı var: `"proxy": "http://localhost:8080"`
- API base URL: `process.env.REACT_APP_API_URL || '/api'`
- Environment variable ile override edilebilir: `.env` dosyasında `REACT_APP_API_URL=http://your-backend-url/api`








