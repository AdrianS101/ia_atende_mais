const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const connectToDatabase = require('../config/database');

// Armazenamento padrão no GridFS para uploads sem requisitos específicos.
const storage = new GridFsStorage({
  db: connectToDatabase().then((connection) => connection.db),
  file: (req, file) => ({
    bucketName: 'uploads',
    filename: `${Date.now()}-${file.originalname}`
  })
});

// Middleware genérico de upload utilizando GridFS.
const uploadGridFS = multer({ storage });

module.exports = { uploadGridFS };
