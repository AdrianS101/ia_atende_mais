const mongoose = require('mongoose');

const DocumentoSchema = new mongoose.Schema({
  fileId: mongoose.Schema.Types.ObjectId,
  filename: String,
  contentType: String,
  tipoDocumento: {
    type: String,
    enum: [
      'contrato_social',
      'rg_cpf',
      'comprovante_endereco',
      'logotipo',
      'numero_whatsapp_oficial',
      'configuracao_meta_business',
      'templates_mensagem',
      'nome_identidade_agente',
      'perfil_visual',
      'base_conhecimento',
      'jornada_conversacional',
      'crm',
      'relatorios_dashboards',
      'outras_integracoes',
      'communication_and_channel',
      'intelligent_agent',
      'integrations_and_settings'
    ]
  },
  uploadedAt: { type: Date, default: Date.now }
});

const OnboardingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  dadosCadastrais: {
    razaoSocial: { type: String, required: true },
    nomeFantasia: String,
    cnpj: String
  },

  documentos: [DocumentoSchema],

  observacoes: { type: String, default: '' },

  status: {
    type: String,
    enum: ['rascunho', 'em_analise', 'aprovado', 'rejeitado'],
    default: 'rascunho'
  },

  criadoEm: { type: Date, default: Date.now },
  atualizadoEm: { type: Date, default: Date.now }
});

OnboardingSchema.pre('save', function (next) {
  this.atualizadoEm = new Date();
  next();
});

module.exports = mongoose.model('Onboarding', OnboardingSchema);
