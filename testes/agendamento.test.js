// RNCWEB
import assert from "node:assert/strict";
import test from "node:test";
import { diaLocal, linkAgendamento } from "../src/scripts/agendamento.js";
import { empresa } from "../src/scripts/configuracao.js";

test("formata a data sem depender do fuso do navegador", () => {
  assert.equal(diaLocal(new Date(2030, 3, 9, 23, 55)), "2030-04-09");
});

test("prepara uma solicitação de serviço no WhatsApp da RNCWEB", () => {
  const link = new URL(linkAgendamento(empresa, "Corte e barba", "2030-04-09", "15:30"));
  assert.equal(link.origin, "https://wa.me");
  assert.equal(link.pathname, "/5528992745086");
  assert.match(link.searchParams.get("text"), /RNCWEB.*Corte e barba.*09\/04\/2030 às 15:30.*confirmar/);
});
