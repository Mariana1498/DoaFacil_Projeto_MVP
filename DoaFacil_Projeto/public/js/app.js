(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---- avisos (toast) ----
  function aviso(texto, tipo) {
    const el = document.createElement('div');
    el.className = 'aviso' + (tipo === 'erro' ? ' erro' : '');
    el.textContent = texto;
    $('#avisos').appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  // mensagens vindas do servidor (?ok=criada) aparecem uma vez e a URL é limpa
  const msgs = { criada: 'Doação publicada. Obrigado por ajudar!', editada: 'Alterações salvas.', excluida: 'Doação excluída.' };
  const params = new URLSearchParams(location.search);
  if (params.get('ok') && msgs[params.get('ok')]) {
    aviso(msgs[params.get('ok')]);
    params.delete('ok');
    const resto = params.toString();
    history.replaceState(null, '', location.pathname + (resto ? '?' + resto : ''));
  }

  // ---- filtros que atualizam a lista enquanto a pessoa digita ----
  const filtros = $('#filtros');
  let tempo;
  async function atualizarLista(destacarId) {
    const url = new URL(location.href);
    const dados = new FormData(filtros);
    ['q', 'categoria', 'status'].forEach((c) => {
      const v = (dados.get(c) || '').toString().trim();
      v ? url.searchParams.set(c, v) : url.searchParams.delete(c);
    });
    history.replaceState(null, '', url);
    await recarregarArea(url, destacarId);
  }

  async function recarregarArea(url, destacarId) {
    try {
      const resp = await fetch(url, { headers: { Accept: 'text/html' } });
      const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
      $('#area-dinamica').innerHTML = $('#area-dinamica', doc).innerHTML;
      const limpar = $('.limpar', doc);
      const atual = $('.limpar', filtros);
      if (limpar && !atual) filtros.insertBefore(limpar, filtros.lastElementChild);
      if (!limpar && atual) atual.remove();
      if (destacarId) {
        const c = $(`.cartao[data-id="${destacarId}"]`);
        if (c) c.classList.add('atualizado');
      }
    } catch (e) {
      aviso('Não consegui atualizar a lista. Verifique sua conexão.', 'erro');
    }
  }

  if (filtros) {
    filtros.addEventListener('submit', (e) => { e.preventDefault(); atualizarLista(); });
    $('#q').addEventListener('input', () => { clearTimeout(tempo); tempo = setTimeout(atualizarLista, 300); });
    $('#categoria').addEventListener('change', () => atualizarLista());
    $('#status').addEventListener('change', () => atualizarLista());
  }

  // ---- mudar status sem recarregar a página ----
  async function mudarStatus(id, novoStatus, retiradoPor) {
    const resp = await fetch(`/doacoes/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novoStatus, retiradoPor }),
    });
    const json = await resp.json();
    if (!resp.ok) { aviso(json.erro || 'Algo deu errado.', 'erro'); return false; }
    aviso(json.mensagem);
    await atualizarLista(id);
    return true;
  }

  const dlgReserva = $('#dlg-reserva');
  const dlgExcluir = $('#dlg-excluir');
  let idReserva = null;

  document.addEventListener('click', (e) => {
    const alvo = e.target.closest('button');
    if (!alvo) return;

    if (alvo.dataset.fechar !== undefined) alvo.closest('dialog').close();

    if (alvo.dataset.reservar) {
      idReserva = alvo.dataset.reservar;
      $('#retiradoPor').value = '';
      $('#erro-reserva').hidden = true;
      dlgReserva.showModal();
      $('#retiradoPor').focus();
    }
    if (alvo.dataset.status) mudarStatus(alvo.dataset.status, alvo.dataset.novo);

    if (alvo.dataset.excluir) {
      $('#form-excluir').action = `/doacoes/${alvo.dataset.excluir}/excluir`;
      $('#txt-excluir').textContent = `A doação "${alvo.dataset.nome}" será removida da lista. Essa ação não pode ser desfeita.`;
      dlgExcluir.showModal();
    }
  });

  if (dlgReserva) {
    $('#form-reserva').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = $('#retiradoPor').value.trim();
      if (nome.length < 3) {
        const er = $('#erro-reserva');
        er.textContent = 'Informe pelo menos 3 letras.';
        er.hidden = false;
        return;
      }
      if (await mudarStatus(idReserva, 'reservada', nome)) dlgReserva.close();
    });
  }

  // ---- máscara simples de telefone ----
  const tel = $('#telefone');
  if (tel) {
    tel.addEventListener('input', () => {
      const n = tel.value.replace(/\D/g, '').slice(0, 11);
      const f = n.length > 10 ? n.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
        : n.length > 6 ? n.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
        : n.length > 2 ? n.replace(/(\d{2})(\d{0,5})/, '($1) $2') : n;
      tel.value = f;
    });
  }
})();
