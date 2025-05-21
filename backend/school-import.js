// reset-schools.js
const { pool } = require('./src/config/database');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs');

async function resetAndImportSchools() {
  let connection = null;
  
  try {
    console.log("Veritabanına bağlanılıyor...");
    connection = await pool.getConnection();
    console.log("Veritabanı bağlantısı başarılı");
    
    // Foreign key kontrollerini geçici olarak devre dışı bırak
    console.log("Foreign key kontrolleri devre dışı bırakılıyor...");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    
    // Schools tablosunu temizle
    console.log("Schools tablosu temizleniyor...");
    await connection.execute("TRUNCATE TABLE schools");
    console.log("Schools tablosu başarıyla temizlendi");
    
    // Foreign key kontrollerini tekrar etkinleştir
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    
    // Excel dosyasını oku
    const excelPath = path.join(__dirname, 'uploads', 'okulListesi.xlsx');
    console.log("Excel dosyası okunuyor:", excelPath);
    
    if (!fs.existsSync(excelPath)) {
      console.error('Excel dosyası bulunamadı:', excelPath);
      connection.release();
      return;
    }
    
    const workbook = xlsx.readFile(excelPath);
    console.log("Excel sayfaları:", workbook.SheetNames);
    
    if (workbook.SheetNames.length < 1) {
      console.error('Excel dosyasında okunabilir bir sayfa bulunamadı');
      connection.release();
      return;
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const schools = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Excel dosyasında ${schools.length} okul bulundu`);
    
    if (schools.length === 0) {
      console.error('Excel dosyasında okul verisi bulunamadı');
      connection.release();
      return;
    }
    
    // İlk okulu göster (kontrol amaçlı)
    console.log("İlk okul örneği:", JSON.stringify(schools[0], null, 2));
    
    let importedCount = 0;
    let liseCount = 0;
    let ortaokulCount = 0;
    let errorCount = 0;
    
    console.log("Okullar veritabanına ekleniyor...");
    
    // Her 50 okulda bir toplu ekleme yap
    const batchSize = 50;
    let batch = [];
    let params = [];
    
    for (const school of schools) {
      // Zorunlu alanları kontrol et
      const schoolName = school['Okul Adı'];
      const city = school['İl'];
      const district = school['İlçe'];
      
      if (!schoolName || !city || !district) {
        console.warn('Eksik bilgi içeren okul atlandı:', school);
        errorCount++;
        continue;
      }
      
      // Okul türünü belirle
      const schoolType = school['Okul Türü'] === 'Lise' ? 'lise' : 'ortaokul';
      
      // Okul sayılarını güncelle
      if (schoolType === 'lise') {
        liseCount++;
      } else {
        ortaokulCount++;
      }
      
      // Değerleri hazırla
      const website = school['Website'] || null;
      const infoLink = school['Bilgi Linki'] || null;
      const mapLink = school['Harita Linki'] || null;
      
      // Batch'e ekle
      batch.push('(?, ?, ?, ?, ?, ?, ?)');
      params.push(
        schoolName,
        city,
        district,
        website,
        infoLink,
        mapLink,
        schoolType
      );
      
      // Batch dolduğunda veya son element ise ekleme yap
      if (batch.length >= batchSize || schools.indexOf(school) === schools.length - 1) {
        if (batch.length > 0) {
          try {
            const query = `
              INSERT INTO schools 
              (name, city, district, website, info_link, map_link, type) 
              VALUES ${batch.join(',')}
            `;
            
            const [result] = await connection.execute(query, params);
            importedCount += result.affectedRows;
            
            console.log(`Batch eklendi: ${result.affectedRows} okul (Toplam: ${importedCount})`);
            
            // Batch'i temizle
            batch = [];
            params = [];
          } catch (err) {
            console.error(`Batch ekleme hatası:`, err.message);
            errorCount += batch.length;
            
            // Hata olursa tek tek eklemeyi deneyelim
            console.log("Tek tek ekleme moduna geçiliyor...");
            for (let i = 0; i < batch.length; i++) {
              const singleParams = params.slice(i * 7, (i + 1) * 7);
              
              if (singleParams.length === 7) {
                try {
                  const singleQuery = `
                    INSERT INTO schools 
                    (name, city, district, website, info_link, map_link, type) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                  `;
                  
                  const [singleResult] = await connection.execute(singleQuery, singleParams);
                  if (singleResult.affectedRows > 0) {
                    importedCount++;
                    errorCount--;
                  }
                } catch (singleErr) {
                  console.error(`Tek ekleme hatası (${singleParams[0]}):`, singleErr.message);
                }
              }
            }
            
            // Batch'i temizle
            batch = [];
            params = [];
          }
        }
      }
    }
    
    console.log(`İşlem tamamlandı. Toplam: ${schools.length}, Eklenen: ${importedCount}, Hata: ${errorCount}`);
    console.log(`Lise: ${liseCount}, Ortaokul: ${ortaokulCount}`);
    
    if (connection) {
      connection.release();
      console.log("Veritabanı bağlantısı kapatıldı");
    }
    
    console.log("Tüm işlemler başarıyla tamamlandı!");
    
  } catch (error) {
    console.error('Excel veri aktarımı sırasında kritik hata:', error);
    console.error('Hata detayı:', error.message);
    console.error('Hata yığını:', error.stack);
    
    if (connection) {
      // Foreign key kontrollerini geri açalım
      try {
        await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
      } catch (e) {}
      
      connection.release();
      console.log("Hata nedeniyle veritabanı bağlantısı kapatıldı");
    }
  }
}

// Scripti çalıştır
resetAndImportSchools();