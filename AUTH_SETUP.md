# Authentication Setup Guide

Bu uygulama Supabase kullanarak authentication sistemi içerir. Aşağıdaki adımları takip ederek sistemi kurun:

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin
2. Yeni bir proje oluşturun
3. Proje URL'sini ve anonim anahtarını not edin

## 2. Environment Variables

`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Supabase Authentication Ayarları

### Email Authentication
1. Supabase Dashboard'da Authentication > Settings'e gidin
2. Email auth'u etkinleştirin
3. Email confirmation'ı etkinleştirin (isteğe bağlı)

### Database Schema
Aşağıdaki SQL'i Supabase SQL Editor'da çalıştırın:

```sql
-- Users tablosu (Supabase auth.users otomatik oluşturulur)
-- Dreams tablosu
CREATE TABLE dreams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) etkinleştir
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi dream'lerini görebilir
CREATE POLICY "Users can view own dreams" ON dreams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dreams" ON dreams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dreams" ON dreams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dreams" ON dreams
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Uygulama Özellikleri

### Sign In Sayfası (`/signin`)
- Email ve şifre ile giriş
- Form validasyonu
- Loading states
- Hata mesajları
- Sign up sayfasına yönlendirme

### Sign Up Sayfası (`/signup`)
- Email ve şifre ile kayıt
- Şifre onaylama
- Form validasyonu
- Loading states
- Başarılı kayıt sonrası email doğrulama uyarısı

### Authentication Context
- Kullanıcı durumu yönetimi
- Otomatik session kontrolü
- Sign in/out fonksiyonları

### Profile Sayfası
- Sign out butonu
- Kullanıcı bilgileri (mock data)

## 5. Tasarım Özellikleri

### Renk Paleti
- Primary: `#030014` (Koyu mavi)
- Secondary: `#151312` (Koyu gri)
- Light 100: `#D6C7FF` (Açık mor)
- Light 200: `#A8B5DB` (Açık mavi)
- Light 300: `#9CA4AB` (Gri)
- Dark 100: `#221F3D` (Koyu mor)
- Dark 200: `#0F0D23` (Çok koyu mor)
- Accent: `#AB8BFF` (Mor)

### Tasarım Özellikleri
- Night sky background
- Glassmorphism efektleri
- Rounded corners
- Purple accent colors
- Consistent spacing ve typography

## 6. Kullanım

1. Uygulamayı başlatın
2. İlk açılışta sign in sayfasına yönlendirilirsiniz
3. Hesabınız yoksa "Sign Up" linkine tıklayın
4. Kayıt olduktan sonra email doğrulaması yapın
5. Sign in ile giriş yapın
6. Profile sayfasından çıkış yapabilirsiniz

## 7. Güvenlik

- Supabase RLS (Row Level Security) etkin
- Kullanıcılar sadece kendi verilerine erişebilir
- Email doğrulama sistemi
- Güvenli şifre hashleme (Supabase tarafında)

## 8. Geliştirme Notları

- TypeScript ile tip güvenliği
- React Native + Expo Router
- Tailwind CSS (NativeWind)
- Supabase JavaScript client
- Context API ile state management