const mongoose = require('mongoose');

const DocumentoSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
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
    ],
    required: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const OnboardingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Dados empresariais principais do cliente.
  dadosCadastrais: {
    razaoSocial: { type: String, required: true },
    nomeFantasia: { type: String },
    cnpj: { type: String },
    inscricaoEstadual: { type: String },
    inscricaoMunicipal: { type: String },
    telefone: { type: String },
    email: { type: String }
  },

  endereco: {
    logradouro: { type: String },
    rua: { type: String },
    numero: { type: String },
    complemento: { type: String },
    bairro: { type: String },
    cidade: { type: String },
    estado: { type: String },
    cep: { type: String }
  },

  representantesLegais: [{
    nome: String,
    cpf: String,
    cargo: String,
    email: String,
    telefone: String
  }],

  contatoOperacional: {
    nome: String,
    cargo: String,
    email: String,
    telefone: String
  },

  contatoFinanceiro: {
    nome: String,
    cargo: String,
    email: String,
    telefone: String
  },

  communicationAndChannel: {
    numeroWhatsappOficial: { type: String },
    metaBusinessSchedule: {
      data: { type: Date },
      horario: { type: String }
    },
    templatesMensagem: { type: String }
  },

  intelligentAgent: {
    nomeIdentidadeAgente: { type: String },
    baseConhecimento: { type: String },
    jornadaConversacional: { type: String }
  },

  integrationsAndSettings: {
    crm: { type: String },
    relatoriosDashboards: { type: String },
    outrasIntegracoes: { type: String }
  },

  // Referências aos documentos submetidos e armazenados no GridFS.
  documentos: [DocumentoSchema],

  observacoes: {
    type: String,
    default: ''
  },

  status: {
    type: String,
    enum: ['pendente', 'em análise', 'aprovado', 'reprovado', 'rejeitado', 'rascunho', 'em_analise'],
    default: 'rascunho'
  },

  criadoEm: {
    type: Date,
    default: Date.now
  },
  atualizadoEm: {
    type: Date,
    default: Date.now
  }
});

// Garante o versionamento do registro atualizando `atualizadoEm` a cada persistência.
OnboardingSchema.pre('save', function (next) {
  this.atualizadoEm = new Date();
  next();
});

module.exports = mongoose.model('Onboarding', OnboardingSchema);
