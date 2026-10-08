// Dados de exemplo para a demonstração (só entram se o banco estiver vazio).
function dia(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

module.exports = async function semear(Doacao) {
  if ((await Doacao.count()) > 0) return;
  await Doacao.bulkCreate([
    { nomeDoador: 'Padaria Estrela do Recife', telefone: '(81) 99911-2233', alimento: 'Pães franceses do dia', categoria: 'Pães e massas', quantidade: 8, unidade: 'kg', bairro: 'Boa Viagem', validade: dia(1), observacao: 'Retirar até as 20h, no balcão.' },
    { nomeDoador: 'Marcos Albuquerque', telefone: '(81) 98877-4501', alimento: 'Arroz e feijão', categoria: 'Não perecível', quantidade: 12, unidade: 'kg', bairro: 'Casa Amarela', validade: dia(120) },
    { nomeDoador: 'Restaurante Sabor da Terra', telefone: '(81) 3322-9087', alimento: 'Marmitas de almoço', categoria: 'Refeição pronta', quantidade: 20, unidade: 'unidades', bairro: 'Graças', validade: dia(0), observacao: 'Sobraram do almoço executivo. Retirada hoje.' },
    { nomeDoador: 'Feira do Bairro - Dona Lúcia', telefone: '(81) 99654-1020', alimento: 'Banana, mamão e macaxeira', categoria: 'Hortifruti', quantidade: 15, unidade: 'kg', bairro: 'Afogados', validade: dia(3) },
    { nomeDoador: 'Carla Menezes', telefone: '(81) 99700-3344', alimento: 'Leite integral', categoria: 'Laticínios e frios', quantidade: 18, unidade: 'L', bairro: 'Várzea', validade: dia(6), status: 'reservada', retiradoPor: 'Associação Mãos que Ajudam' },
    { nomeDoador: 'Supermercado Bom Preço', telefone: '(81) 3033-7788', alimento: 'Macarrão e molho de tomate', categoria: 'Não perecível', quantidade: 25, unidade: 'kg', bairro: 'Ibura', validade: dia(90), status: 'entregue', retiradoPor: 'Cozinha Comunitária do Ibura' },
  ]);
};
