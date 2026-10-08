# 🍽️ DoaFácil

**Plataforma web que liga quem tem alimento sobrando a quem precisa.**
MVP da 1ª entrega · Laboratório de Empreendimentos Inovadores · UNINASSAU Boa Viagem · ADS 4º período, Turma A (Noite)

---

## 01. Nome do projeto e integrantes

**DoaFácil** · projeto da Fábrica de Software, alinhado à **ODS 2 da ONU (Fome Zero e Agricultura Sustentável)**.

| Integrante | Matrícula | Função principal | Função de apoio |
| --- | --- | --- | --- |
| Daniel Tenorio Barbosa | 01786636 | Gestão / Scrum Master | Banco de Dados |
| João Guilherme Soares Ramos | 01808602 | Back-end / Banco de Dados | Testes |
| Mariana Cristina da Silva Ferreira | 01259839 | Testes e Documentação | Front-end |
| Victor De Moraes Silva | 01790685 | Front-end | Documentação |
| Yula Eduarda Silva Mendes | 01751630 | Back-end / Banco de Dados | Gestão do repositório |

> Todos fazem commits e respondem pelo produto. As funções acima são o foco de cada um, não uma barreira.

## 02. Problema e público-alvo

Todos os dias, padarias, restaurantes, feiras e famílias têm comida boa que sobra e vai para o lixo, enquanto perto dali existem pessoas, cozinhas comunitárias e associações sem alimento suficiente. O gargalo não é só ter comida: quem quer doar não sabe a quem entregar, e quem precisa não fica sabendo a tempo do que está disponível, principalmente quando o alimento estraga rápido.

**Quem enfrenta o problema**
- **Doadores:** pequenos comércios, restaurantes, feirantes e pessoas físicas que querem evitar o desperdício, mas não têm um canal simples para isso.
- **Quem recebe:** famílias em situação de vulnerabilidade, cozinhas comunitárias, associações de bairro, igrejas e ONGs que distribuem alimentos.

Nosso ponto de partida é o **Recife**.

## 03. Solução e funcionalidades

O DoaFácil funciona como um mural de doações: o doador publica, quem precisa reserva, e a entrega é confirmada. Funcionalidades essenciais:

- Publicar doação (alimento, categoria, quantidade, bairro, validade, contato)
- Listar, buscar e filtrar por alimento, bairro, categoria e situação
- Reservar a retirada (a doação deixa de aparecer como disponível)
- Confirmar entrega ou cancelar a reserva
- Alertas de validade ("Vence hoje", "Vence em 2 dias")
- Painel com os números de doações disponíveis, reservadas e entregues
- Editar e excluir doações

## 04. Escopo do MVP

**Funcionalidade principal demonstrável:** o ciclo completo de uma doação, de **publicar → aparecer na lista → reservar → confirmar entrega**, feito direto na tela e sem recarregar a página.

**Está no MVP:** todas as funcionalidades da seção 03, validação dos formulários, interface responsiva (funciona no celular) e dados de exemplo para demonstração.

**Fica para depois do MVP:** login de doadores e instituições, mapa e distância, avisos por WhatsApp/e-mail, fotos dos alimentos, avaliação de instituições, relatórios de impacto, testes automatizados e publicação online.

## 05. Tecnologias utilizadas

| Tecnologia | Uso no projeto |
| --- | --- |
| Node.js + Express | Servidor, rotas e API de mudança de status |
| Sequelize | Mapeamento do banco de dados (ORM) |
| SQLite | Banco de dados em arquivo, sem instalação (substituiu o MySQL do projeto base) |
| Express-Handlebars | Páginas dinâmicas no padrão MVC |
| HTML, CSS e JavaScript puro | Interface responsiva, busca ao vivo, reserva sem recarregar |
| Git e GitHub | Versionamento e histórico da equipe |

## 06. Análise de viabilidade

- **Tecnologia e conhecimento:** a stack já era conhecida pela equipe (vem da disciplina de Frameworks Back-End), então não precisamos aprender nada novo para entregar.
- **Recursos:** tudo é gratuito e roda em qualquer computador com Node.js.
- **Prazo:** com o escopo reduzido ao ciclo reservar → entregar, coube no prazo.
- **Ajuste feito:** trocamos o MySQL pelo SQLite no MVP para o projeto rodar com dois comandos. Para uso real, com muitos usuários, o plano é voltar a um banco de servidor.

## 07. Cronograma e riscos

| Data | O que ficou pronto |
| --- | --- |
| 30/09 | Funções, problema e nome definidos |
| 01/10 | Escopo do MVP definido e repositório organizado |
| 02/10 a 04/10 | Desenvolvimento (back-end, banco e interface) |
| 05/10 e 06/10 | MVP funcionando e testes |
| 07/10 | Correções finais, README e relatório |
| 08/10 | Entrega do MVP |
| Após o MVP | Login, mapa, notificações, testes automatizados e produto final |

| Risco | Como tratamos |
| --- | --- |
| Prazo curto (prova no mesmo dia da entrega) | Escopo enxuto e cronograma com folga no dia 07 |
| Depender de instalar MySQL para demonstrar | Migração para SQLite |
| Alimento vencido ser publicado | Validação de data e alertas de validade |
| Conflitos no Git entre cinco pessoas | Commits pequenos e frequentes, cada um na sua parte |

## 08. Como executar o projeto

Pré-requisito: **Node.js 18 ou superior** ([nodejs.org](https://nodejs.org)).

```bash
git clone https://github.com/yulamendes/DoaFacil_Projeto.git
cd DoaFacil_Projeto
npm install
npm start
```

Abra **http://localhost:8090** no navegador.

- O banco (`database.sqlite`) é criado sozinho na primeira execução, já com 6 doações de exemplo.
- Para recomeçar do zero, pare o servidor e apague o arquivo `database.sqlite`.
- Para outra porta: `PORT=3000 npm start` (no Windows PowerShell: `$env:PORT=3000; npm start`).

### Roteiro rápido de demonstração
1. Na página **Doações**, busque por "Boa Viagem" e veja a lista filtrar enquanto digita.
2. Clique em **Quero retirar** em uma doação, informe um nome e confirme. O cartão muda para *Reservada* sem recarregar.
3. Clique em **Confirmar entrega**. Volte à página inicial e veja os números atualizados.
4. Em **Doar alimento**, tente enviar o formulário vazio para ver as validações.

### Estrutura

```
DoaFacil_Projeto/
├── appmain.js            # servidor e configuração
├── models/               # banco (db.js), modelo Doacao e dados de exemplo
├── routes/doacoes.js     # rotas e regras de negócio
├── views/                # telas Handlebars
├── public/               # CSS e JavaScript do navegador
└── docs/TESTES.md        # registro de testes
```

---
Projeto acadêmico, de uso educacional. A equipe usou o Claude (IA da Anthropic) como apoio em partes do código, do visual e da documentação; tudo foi revisado e testado pelos integrantes.
