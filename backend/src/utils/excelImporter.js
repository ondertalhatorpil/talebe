// utils/excelImporter.js
const xlsx = require('xlsx');
const { pool } = require('../config/database');

/**
 * Excel dosyasından okulları içe aktarır
 * @param {string} filePath - Excel dosyasının yolu
 * @returns {Promise<{success: boolean, message: string, count: number}>}
 */
async function importSchoolsFromExcel(filePath) {
  let connection = null;
  
  try {
    console.log("Excel dosyası okunuyor:", filePath);
    const workbook = xlsx.readFile(filePath);
    console.log("Excel sayfaları:", workbook.SheetNames);
    
    if (workbook.SheetNames.length < 1) {
      return { 
        success: false, 
        message: 'Excel dosyasında okunabilir bir sayfa bulunamadı', 
        count: 0 
      };
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const schools = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Excel dosyasında ${schools.length} okul bulundu`);
    
    if (schools.length === 0) {
      return { success: false, message: 'Excel dosyasında okul verisi bulunamadı', count: 0 };
    }
    
    // Örnek bir okulu göster
    console.log("İlk okul örneği:", JSON.stringify(schools[0], null, 2));
    
    // Veritabanı bağlantısı
    console.log("Veritabanına bağlanılıyor...");
    connection = await pool.getConnection();
    console.log("Veritabanı bağlantısı başarılı");
    
    // Schools tablosunu kontrol et (ve gerekirse oluştur)
    try {
      const [tables] = await connection.execute("SHOW TABLES LIKE 'schools'");
      if (tables.length === 0) {
        console.log("'schools' tablosu bulunamadı, oluşturuluyor...");
        await connection.execute(`
          CREATE TABLE schools (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            district VARCHAR(100) NOT NULL,
            website VARCHAR(255),
            info_link VARCHAR(255),
            map_link VARCHAR(255),
            type VARCHAR(20),
            total_points INT DEFAULT 0,
            total_students INT DEFAULT 0,
            UNIQUE KEY name_city_district (name, city, district)
          )
        `);
        console.log("'schools' tablosu oluşturuldu");
      } else {
        console.log("'schools' tablosu zaten var");
        
        // Type sütununu kontrol et
        const [columns] = await connection.execute("SHOW COLUMNS FROM schools LIKE 'type'");
        if (columns.length === 0) {
          console.log("Type sütunu ekleniyor...");
          await connection.execute("ALTER TABLE schools ADD COLUMN type VARCHAR(20)");
          console.log("Type sütunu eklendi");
        }
      }
    } catch (err) {
      console.error("Tablo kontrolü hatası:", err);
      return { 
        success: false, 
        message: `Veritabanı tablosu kontrol edilirken hata oluştu: ${err.message}`, 
        count: 0 
      };
    }
    
    // Mevcut verileri temizle (ama sadece foreign key kısıtlaması yoksa)
    try {
      // Referans eden tablolar var mı diye kontrol et
      const [foreignKeys] = await connection.execute(`
        SELECT TABLE_NAME, CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_NAME = 'schools'
        AND REFERENCED_TABLE_SCHEMA = DATABASE()
      `);
      
      if (foreignKeys.length === 0) {
        // Referans eden tablo yoksa, verileri temizle
        console.log("'schools' tablosundaki verileri temizleniyor...");
        await connection.execute("DELETE FROM schools");
        console.log("'schools' tablosundaki veriler temizlendi");
      } else {
        console.log("'schools' tablosu başka tablolar tarafından referans ediliyor, veriler temizlenmedi");
        console.log("Referans eden tablolar:", foreignKeys.map(fk => `${fk.TABLE_NAME} (${fk.CONSTRAINT_NAME})`));
      }
    } catch (err) {
      console.error("Veri temizleme hatası:", err);
    }
    
    let importedCount = 0;
    let liseCount = 0;
    let ortaokulCount = 0;
    let errorCount = 0;
    
    console.log("Okullar veritabanına ekleniyor...");
    
    // Tek tek ekleme (bulk insert ile sorun yaşayabiliriz)
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
      
      try {
        const query = `
          INSERT INTO schools 
          (name, city, district, website, info_link, map_link, type) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          website = VALUES(website),
          info_link = VALUES(info_link),
          map_link = VALUES(map_link),
          type = VALUES(type)
        `;
        
        const params = [
          schoolName,
          city,
          district,
          website,
          infoLink,
          mapLink,
          schoolType
        ];
        
        const [result] = await connection.execute(query, params);
        
        if (result.affectedRows > 0) {
          importedCount++;
          
          // Her 100 kayıt için ilerleme mesajı
          if (importedCount % 100 === 0 || importedCount === schools.length) {
            console.log(`İlerleme: ${importedCount}/${schools.length} okul eklendi/güncellendi`);
          }
        }
      } catch (err) {
        console.error(`Veri ekleme hatası (${schoolName}, ${city}, ${district}):`, err.message);
        errorCount++;
      }
    }
    
    console.log(`İşlem tamamlandı. Toplam: ${schools.length}, Eklenen/Güncellenen: ${importedCount}, Hata: ${errorCount}`);
    
    if (connection) {
      connection.release();
      console.log("Veritabanı bağlantısı kapatıldı");
    }
    
    return { 
      success: true, 
      message: `${importedCount} okul başarıyla içe aktarıldı (Lise: ${liseCount}, Ortaokul: ${ortaokulCount}, Hata: ${errorCount})`, 
      count: importedCount 
    };
  } catch (error) {
    console.error('Excel veri aktarımı sırasında kritik hata:', error);
    console.error('Hata detayı:', error.message);
    
    if (connection) {
      connection.release();
      console.log("Hata nedeniyle veritabanı bağlantısı kapatıldı");
    }
    
    return { 
      success: false, 
      message: `Kritik hata: ${error.message}`, 
      count: 0 
    };
  }
}

module.exports = {
  importSchoolsFromExcel
};