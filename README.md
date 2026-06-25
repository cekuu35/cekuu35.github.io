# cekuu Store — Gumroad Vitrin Sitesi

`cekuu35.github.io` üzerinde yayınlanan, dijital ürünlerini Gumroad'un güvenli ödeme
altyapısıyla satmak için kurulmuş **statik vitrin sitesi**.

## Canlı adres
`https://cekuu35.github.io/`

## Dosya yapısı
- `index.html` — ana satış sayfası (hero, ürün vitrini, güven bölümü, SSS, bülten)
- `assets/styles.css` — tasarım/stil
- `assets/app.js` — ürünleri `products.json`'dan okuyup render eder, arama + kategori filtresi
- `products.json` — **ürünlerini buradan düzenlersin** (site bilgisi + 20 ürün)
- `GELIR-PLANI.md` — gerçekçi, adım adım gelir/pazarlama planı
- `robots.txt`, `sitemap.xml` — SEO

## Ürün eklemek / düzenlemek
Sadece `products.json` dosyasını düzenle:

```json
{
  "id": "p1",
  "title": "Ürün adı",
  "description": "Fayda odaklı kısa açıklama",
  "price": 9,
  "oldPrice": 19,
  "category": "Şablon",
  "badge": "Çok Satan",
  "image": "https://...kapak-gorseli.jpg",
  "gumroadUrl": "https://cekuu.gumroad.com/l/urunadi"
}
```

`site` bölümünde marka adını, Gumroad profil linkini ve e-postanı güncelle.
Değişiklikleri commit + push ettiğinde GitHub Pages otomatik yayınlar.

## Ödeme
Tüm ödemeler **Gumroad** üzerinden alınır (Gumroad overlay). Kart bilgileri bu sitede
saklanmaz; müşteri tanınan, güvenli bir altyapıyla öder.

## Yerelde önizleme
```bash
python3 -m http.server 8000
# tarayıcıda http://localhost:8000
```

Detaylı satış stratejisi için `GELIR-PLANI.md` dosyasına bak.
