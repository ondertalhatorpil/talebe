const School = require('../models/school.model');
const { importSchoolsFromExcel } = require('../utils/excelImporter');
const { validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Excel dosyası yükleme konfigürasyonu
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    
    // Uploads klasörü yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, 'schools-' + Date.now() + path.extname(file.originalname));
  }
});

// Sadece Excel dosyalarını kabul et
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece Excel dosyaları (.xlsx, .xls, .csv) yüklenebilir.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.findAll();
    
    res.status(200).json({
      success: true,
      count: schools.length,
      schools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Okullar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getSchoolsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const schools = await School.findByCity(city);
    
    res.status(200).json({
      success: true,
      count: schools.length,
      schools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Okullar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getSchoolsByDistrict = async (req, res) => {
  try {
    const { city, district } = req.params;
    const { type } = req.query;
    
    console.log('Controller parametreleri:', { city, district, type });
    
    // Tip belirtilmişse filtreleme yap
    let schools;
    if (type) {
      schools = await School.findByDistrictAndType(city, district, type);
    } else {
      schools = await School.findByDistrict(city, district);
    }
    
    console.log('Bulunan okullar:', schools);
    
    res.status(200).json({
      success: true,
      count: schools.length,
      schools
    });
  } catch (error) {
    console.error('API hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Okullar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const school = await School.findById(id);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Okul bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      school
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Okul bilgileri alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getTopSchools = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topSchools = await School.getTopSchools(parseInt(limit));
    
    res.status(200).json({
      success: true,
      schools: topSchools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'En yüksek puanlı okullar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getSchoolStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    // Okul var mı kontrol et
    const school = await School.findById(id);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Okul bulunamadı.'
      });
    }
    
    const students = await School.getStudents(id, parseInt(limit), parseInt(offset));
    
    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Okul öğrencileri alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getUniqueCities = async (req, res) => {
  try {
    const cities = await School.getUniqueCities();
    
    res.status(200).json({
      success: true,
      count: cities.length,
      cities: cities.map(city => city.city)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Şehirler alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getUniqueDistricts = async (req, res) => {
  try {
    const { city } = req.params;
    
    const districts = await School.getUniqueDistricts(city);
    
    res.status(200).json({
      success: true,
      count: districts.length,
      districts: districts.map(district => district.district)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İlçeler alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.importSchools = async (req, res) => {
  try {
    console.log("İmport işlemi başlatılıyor...");
    console.log("Yüklenen dosya:", req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen bir Excel dosyası yükleyin.'
      });
    }
    
    // Excel Importer modülünü dinamik olarak yükle
    console.log("excelImporter modülü yükleniyor...");
    let importerModule;
    
    try {
      importerModule = require('../utils/excelImporter');
      console.log("excelImporter modülü başarıyla yüklendi");
    } catch (err) {
      console.error("excelImporter modülü yüklenirken hata:", err);
      return res.status(500).json({
        success: false,
        message: `Excel import modülü yüklenirken hata oluştu: ${err.message}`
      });
    }
    
    console.log("importSchoolsFromExcel fonksiyonu çağrılıyor...");
    const result = await importerModule.importSchoolsFromExcel(req.file.path);
    console.log("importSchoolsFromExcel sonucu:", result);
    
    // İmport işlemi sonrası dosyayı sil (isteğe bağlı)
    fs.unlinkSync(req.file.path);
    console.log("Geçici dosya silindi:", req.file.path);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: result.message,
      count: result.count
    });
  } catch (error) {
    console.error("İmport işlemi hatası:", error);
    
    // Dosya hala varsa temizle
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Okullar içe aktarılırken bir hata oluştu.',
      error: error.message
    });
  }
};

exports.getTopSchoolsByDistrict = async (req, res) => {
  try {
    const { city, district } = req.params;
    const { limit = 10 } = req.query;
    
    if (!city || !district) {
      return res.status(400).json({
        success: false,
        message: 'İl ve ilçe bilgisi gereklidir.'
      });
    }
    
    const topSchools = await School.getTopSchoolsByDistrict(city, district, parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: topSchools.length,
      location: { city, district },
      schools: topSchools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İlçe bazında okullar alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Okul sıralamasını getir (Türkiye, il, ilçe bazında)
exports.getSchoolRankings = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Okul ID gereklidir.'
      });
    }
    
    const rankings = await School.getSchoolRankings(parseInt(id));
    
    if (!rankings) {
      return res.status(404).json({
        success: false,
        message: 'Okul bulunamadı.'
      });
    }
    
    res.status(200).json({
      success: true,
      rankings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Okul sıralaması alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// İl/İlçe istatistiklerini getir
exports.getLocationStats = async (req, res) => {
  try {
    const { city, district } = req.params;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'İl bilgisi gereklidir.'
      });
    }
    
    const stats = await School.getLocationStats(city, district);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lokasyon istatistikleri alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

// Excel import middleware'i dışa aktar
exports.uploadMiddleware = upload.single('file');