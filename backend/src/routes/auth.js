const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * Gera um token JWT assinado com id e role
 */
const gerarToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * POST /auth/register
 * Registra um novo cliente e retorna o token
 */
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    const userExistente = await User.findOne({ email });
    if (userExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const user = await User.create({
      nome,
      email,
      senha,
      role: 'client'
    });

    const token = gerarToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Cliente registrado com sucesso',
      data: {
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar cliente',
      error: error.message
    });
  }
});

/**
 * POST /auth/login
 * Login de cliente
 */
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const user = await User.findOne({ email }).select('+senha');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const senhaCorreta = await user.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    const token = gerarToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login',
      error: error.message
    });
  }
});

/**
 * POST /auth/admin/register-once
 * Registra o primeiro admin
 */
router.post('/admin/register-once', async (req, res) => {
  try {
    const { nome, email, senha, adminKey } = req.body;

    if (!nome || !email || !senha || !adminKey) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email, senha e adminKey são obrigatórios'
      });
    }

    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Chave de registro de admin inválida'
      });
    }

    const adminExistente = await User.findOne({ role: 'admin' });
    if (adminExistente) {
      return res.status(400).json({
        success: false,
        message: 'Admin já foi registrado'
      });
    }

    const emailExistente = await User.findOne({ email });
    if (emailExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const admin = await User.create({
      nome,
      email,
      senha,
      role: 'admin'
    });

    const token = gerarToken(admin._id, admin.role);

    res.status(201).json({
      success: true,
      message: 'Admin registrado com sucesso',
      data: {
        user: {
          id: admin._id,
          nome: admin.nome,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar admin',
      error: error.message
    });
  }
});

/**
 * POST /auth/admin/login
 * Login de administrador
 */
router.post('/admin/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const admin = await User.findOne({ email, role: 'admin' }).select('+senha');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais de admin inválidas'
      });
    }

    const senhaCorreta = await admin.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais de admin inválidas'
      });
    }

    if (!admin.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Admin inativo'
      });
    }

    const token = gerarToken(admin._id, admin.role);

    res.json({
      success: true,
      message: 'Login de admin realizado com sucesso',
      data: {
        user: {
          id: admin._id,
          nome: admin.nome,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login de admin',
      error: error.message
    });
  }
});

module.exports = router;
