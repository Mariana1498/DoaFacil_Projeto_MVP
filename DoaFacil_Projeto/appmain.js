const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');

const sequelize = require('./models/db');
const Doacao = require('./models/Doacao');
const rotas = require('./routes/doacoes');
const semear = require('./models/seed');

const app = express();
const PORTA = process.env.PORT || 8090;

app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    data: (valor) => {
      if (!valor) return '';
      const [a, m, d] = String(valor).slice(0, 10).split('-');
      return `${d}/${m}/${a}`;
    },
    numero: (n) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 }),
    eq: (a, b) => a === b,
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/sobre', (req, res) => res.render('sobre', { pagina: 'sobre' }));
app.use('/', rotas);

app.use((req, res) => res.status(404).render('404', { pagina: '' }));
app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).render('404', { pagina: '', erroServidor: true });
});

(async () => {
  await sequelize.sync();
  await semear(Doacao);
  app.listen(PORTA, () => console.log(`DoaFácil rodando em http://localhost:${PORTA}`));
})();
