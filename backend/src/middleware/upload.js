const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const connectToDatabase = require('../config/database');

// Configuração compartilhada de armazenamento no GridFS.
const storage = new GridFsStorage({
  db: connectToDatabase().then((connection) => connection.db),
  file: (req, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    const name = file.originalname.replace(/\s+/g, '-').replace(/\.[^.]+$/, '');
    return {
      filename: `${name}-${uniqueSuffix}.${ext}`,
      bucketName: 'uploads',
      metadata: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        tipoDocumento: req.body.tipoDocumento || null
      }
    };
  }
});

// Seleciona os tipos de arquivos permitidos de acordo com o documento solicitado.
const createFileFilter = (tipoDocumento) => {
  return (req, file, cb) => {
    const tiposDocumentosGerais = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    const tiposLogotipo = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/svg+xml'
    ];

    let tiposPermitidos;

    if (tipoDocumento === 'logotipo') {
      tiposPermitidos = tiposLogotipo;
    } else {
      tiposPermitidos = tiposDocumentosGerais;
    }

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const tiposTexto = tipoDocumento === 'logotipo' 
        ? 'PNG, JPG, JPEG, SVG'
        : 'PDF, DOC, DOCX, JPG, PNG';
      cb(new Error(`Tipo de arquivo não permitido para ${tipoDocumento}. Permitidos: ${tiposTexto}`), false);
    }
  };
};

// Cria instâncias de upload específicas para cada tipo de documento.
const createUpload = (tipoDocumento) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: tipoDocumento === 'logotipo' ? 2 * 1024 * 1024 : 10 * 1024 * 1024
    },
    fileFilter: createFileFilter(tipoDocumento)
  });
};

// Controladores especializados por documento.
const uploads = {
  contratoSocial: createUpload('contrato_social'),
  rgCpf: createUpload('rg_cpf'),
  comprovanteEndereco: createUpload('comprovante_endereco'),
  logotipo: createUpload('logotipo')
};

// Instância genérica para uploads sem validação de tipo específica.
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Permitidos: JPG, PNG, SVG, PDF, DOC, DOCX'), false);
    }
  }
});

// Padroniza a resposta de erros lançados pelo Multer.
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 10MB para documentos, 2MB para logotipo'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erro no upload: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = { upload, uploads, handleMulterError };