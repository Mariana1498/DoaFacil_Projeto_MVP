# Registro de testes: MVP (1ª entrega)

Testes manuais feitos no navegador e por requisições HTTP. Resultado esperado igual ao obtido em todos.

| # | Funcionalidade | Teste | Resultado esperado | Resultado |
| --- | --- | --- | --- | --- |
| 1 | Publicar doação | Enviar formulário vazio | Erros em cada campo obrigatório, nada é salvo | Passou |
| 2 | Publicar doação | Preencher corretamente (quantidade "2,5") | Salva e volta para a lista com aviso de sucesso | Passou |
| 3 | Validade | Informar data no passado | Erro "alimento vencido não pode ser doado" | Passou |
| 4 | Telefone | Digitar 81999998888 | Máscara vira (81) 99999-8888 | Passou |
| 5 | Reservar | Reservar sem informar nome | Mensagem de erro, status não muda | Passou |
| 6 | Reservar | Reservar com nome | Cartão vira "Reservada" sem recarregar | Passou |
| 7 | Regra de status | Entregar uma doação que não foi reservada | Bloqueado | Passou |
| 8 | Cancelar reserva | Cancelar uma reserva | Doação volta a "Disponível" | Passou |
| 9 | Entregar | Confirmar entrega | Cartão vira "Entregue" e entra na soma de kg | Passou |
| 10 | Busca | Digitar "Casa" | Lista filtra ao vivo | Passou |
| 11 | Filtros | Filtrar por situação "Entregue" | Só as entregues aparecem | Passou |
| 12 | Editar | Alterar nome do alimento e quantidade | Dados atualizados | Passou |
| 13 | Excluir | Excluir com confirmação | Doação removida | Passou |
| 14 | Páginas | Abrir /, /doacoes, /sobre e rota inexistente | 200, 200, 200 e página 404 amigável | Passou |
| 15 | Celular | Abrir em tela de 390 px | Layout em coluna, sem rolagem lateral | Passou |
