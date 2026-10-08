const express = require('express');
const { Op } = require('sequelize');
const Doacao = require('../models/Doacao');

const router = express.Router();

const CATEGORIAS = ['Não perecível', 'Hortifruti', 'Refeição pronta', 'Pães e massas', 'Laticínios e frios', 'Bebidas'];
const UNIDADES = ['kg', 'L', 'unidades'];
const STATUS = { disponivel: 'Disponível', reservada: 'Reservada', entregue: 'Entregue' };

// ---------- utilitários ----------
function hojeISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function diasAteVencer(validade) {
  if (!validade) return null;
  const ms = new Date(validade + 'T00:00:00') - new Date(hojeISO() + 'T00:00:00');
  return Math.round(ms / 86400000);
}

function preparar(registro) {
  const d = registro.get({ plain: true });
  d.quantidade = Number(d.quantidade);
  d.statusLabel = STATUS[d.status];
  d.disponivel = d.status === 'disponivel';
  d.reservada = d.status === 'reservada';
  d.entregue = d.status === 'entregue';
  const dias = diasAteVencer(d.validade);
  if (dias !== null && !d.entregue) {
    if (dias < 0) { d.alerta = 'Vencida'; d.alertaTipo = 'perigo'; }
    else if (dias === 0) { d.alerta = 'Vence hoje'; d.alertaTipo = 'perigo'; }
    else if (dias <= 2) { d.alerta = `Vence em ${dias} dia${dias > 1 ? 's' : ''}`; d.alertaTipo = 'atencao'; }
  }
  return d;
}

async function resumo() {
  const todas = await Doacao.findAll({ raw: true });
  const por = (s) => todas.filter((d) => d.status === s).length;
  const kgEntregues = todas
    .filter((d) => d.status === 'entregue' && d.unidade === 'kg')
    .reduce((soma, d) => soma + Number(d.quantidade), 0);
  return {
    total: todas.length,
    disponiveis: por('disponivel'),
    reservadas: por('reservada'),
    entregues: por('entregue'),
    kgEntregues: Number(kgEntregues.toFixed(1)),
  };
}

function validar(corpo, { novo }) {
  const erros = {};
  const dado = {
    nomeDoador: (corpo.nomeDoador || '').trim(),
    telefone: (corpo.telefone || '').trim(),
    email: (corpo.email || '').trim(),
    alimento: (corpo.alimento || '').trim(),
    categoria: CATEGORIAS.includes(corpo.categoria) ? corpo.categoria : CATEGORIAS[0],
    quantidade: parseFloat(String(corpo.quantidade || '').replace(',', '.')),
    unidade: UNIDADES.includes(corpo.unidade) ? corpo.unidade : 'kg',
    bairro: (corpo.bairro || '').trim(),
    validade: corpo.validade || null,
    observacao: (corpo.observacao || '').trim() || null,
  };
  if (dado.nomeDoador.length < 3) erros.nomeDoador = 'Informe o nome de quem está doando.';
  if (dado.telefone.replace(/\D/g, '').length < 10) erros.telefone = 'Informe um telefone com DDD, para o contato da retirada.';
  if (dado.email && !/^\S+@\S+\.\S+$/.test(dado.email)) erros.email = 'Esse e-mail não parece válido.';
  if (dado.alimento.length < 2) erros.alimento = 'Diga qual alimento está sendo doado.';
  if (!(dado.quantidade > 0)) erros.quantidade = 'A quantidade precisa ser maior que zero.';
  if (dado.bairro.length < 2) erros.bairro = 'Informe o bairro onde a retirada pode ser feita.';
  if (novo && dado.validade && dado.validade < hojeISO()) erros.validade = 'Essa data já passou. Alimento vencido não pode ser doado.';
  return { dado, erros, ok: Object.keys(erros).length === 0 };
}

function contextoForm(extra = {}) {
  return {
    categorias: CATEGORIAS.map((nome) => ({ nome })),
    unidades: UNIDADES.map((nome) => ({ nome })),
    hoje: hojeISO(),
    ...extra,
  };
}

function marcarSelecionados(ctx, doacao) {
  ctx.categorias = CATEGORIAS.map((nome) => ({ nome, selecionado: doacao.categoria === nome }));
  ctx.unidades = UNIDADES.map((nome) => ({ nome, selecionado: doacao.unidade === nome }));
  return ctx;
}

// ---------- páginas ----------
router.get('/', async (req, res) => {
  const [stats, recentes] = await Promise.all([
    resumo(),
    Doacao.findAll({ where: { status: 'disponivel' }, order: [['createdAt', 'DESC']], limit: 3 }),
  ]);
  res.render('home', { pagina: 'home', stats, recentes: recentes.map(preparar) });
});

router.get('/doacoes', async (req, res) => {
  const { q = '', categoria = '', status = '' } = req.query;
  const where = {};
  if (q.trim()) {
    const termo = `%${q.trim()}%`;
    where[Op.or] = [
      { alimento: { [Op.like]: termo } },
      { bairro: { [Op.like]: termo } },
      { nomeDoador: { [Op.like]: termo } },
    ];
  }
  if (CATEGORIAS.includes(categoria)) where.categoria = categoria;
  if (STATUS[status]) where.status = status;

  const [lista, stats] = await Promise.all([
    Doacao.findAll({ where, order: [['createdAt', 'DESC']] }),
    resumo(),
  ]);
  // disponíveis primeiro, depois reservadas, depois entregues
  const peso = { disponivel: 0, reservada: 1, entregue: 2 };
  const doacoes = lista.map(preparar).sort((a, b) => peso[a.status] - peso[b.status]);

  res.render('doacoes', {
    pagina: 'doacoes',
    doacoes,
    stats,
    q,
    filtroCategorias: CATEGORIAS.map((nome) => ({ nome, selecionado: nome === categoria })),
    filtroStatus: Object.entries(STATUS).map(([valor, nome]) => ({ valor, nome, selecionado: valor === status })),
    filtrando: Boolean(q.trim() || categoria || status),
  });
});

router.get('/doacoes/nova', (req, res) => {
  res.render('form', contextoForm({
    pagina: 'nova', titulo: 'Nova doação', acao: '/doacoes', botao: 'Publicar doação', doacao: {},
  }));
});

router.post('/doacoes', async (req, res) => {
  const { dado, erros, ok } = validar(req.body, { novo: true });
  if (!ok) {
    return res.status(400).render('form', marcarSelecionados(contextoForm({
      pagina: 'nova', titulo: 'Nova doação', acao: '/doacoes', botao: 'Publicar doação', doacao: dado, erros,
    }), dado));
  }
  await Doacao.create(dado);
  res.redirect('/doacoes?ok=criada');
});

router.get('/doacoes/:id/editar', async (req, res, next) => {
  const registro = await Doacao.findByPk(req.params.id);
  if (!registro) return next();
  const doacao = preparar(registro);
  res.render('form', marcarSelecionados(contextoForm({
    pagina: 'doacoes', titulo: 'Editar doação', acao: `/doacoes/${doacao.id}`, botao: 'Salvar alterações', doacao,
  }), doacao));
});

router.post('/doacoes/:id', async (req, res, next) => {
  const registro = await Doacao.findByPk(req.params.id);
  if (!registro) return next();
  const { dado, erros, ok } = validar(req.body, { novo: false });
  if (!ok) {
    dado.id = registro.id;
    return res.status(400).render('form', marcarSelecionados(contextoForm({
      pagina: 'doacoes', titulo: 'Editar doação', acao: `/doacoes/${registro.id}`, botao: 'Salvar alterações', doacao: dado, erros,
    }), dado));
  }
  await registro.update(dado);
  res.redirect('/doacoes?ok=editada');
});

router.post('/doacoes/:id/excluir', async (req, res, next) => {
  const registro = await Doacao.findByPk(req.params.id);
  if (!registro) return next();
  await registro.destroy();
  res.redirect('/doacoes?ok=excluida');
});

// ---------- ação dinâmica: muda o status sem recarregar a página ----------
router.post('/doacoes/:id/status', async (req, res) => {
  const registro = await Doacao.findByPk(req.params.id);
  if (!registro) return res.status(404).json({ erro: 'Doação não encontrada.' });

  const { novoStatus } = req.body;
  const retiradoPor = (req.body.retiradoPor || '').trim();
  const atual = registro.status;

  const permitido =
    (atual === 'disponivel' && novoStatus === 'reservada') ||
    (atual === 'reservada' && (novoStatus === 'entregue' || novoStatus === 'disponivel'));
  if (!permitido) return res.status(400).json({ erro: 'Essa mudança de status não é permitida.' });

  if (novoStatus === 'reservada' && retiradoPor.length < 3) {
    return res.status(400).json({ erro: 'Informe o nome de quem vai retirar.' });
  }

  registro.status = novoStatus;
  registro.retiradoPor = novoStatus === 'reservada' ? retiradoPor : novoStatus === 'disponivel' ? null : registro.retiradoPor;
  await registro.save();

  const mensagens = {
    reservada: 'Doação reservada. Combine a retirada com o doador.',
    entregue: 'Entrega registrada. Obrigado por fechar o ciclo!',
    disponivel: 'Reserva cancelada. A doação voltou para a lista.',
  };
  res.json({ ok: true, mensagem: mensagens[novoStatus] });
});

module.exports = router;
