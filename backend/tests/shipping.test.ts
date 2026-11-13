import "./setup.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildQuoteResult } from "../src/services/shipping/quoteShipping.js";
import { servicesWithRequired } from "../src/config/melhorenvio.js";

const pac = { id: 1, name: "PAC", price: "20.50", delivery_time: 6, company: { id: 1, name: "Correios" } };
const sedexErr = { id: 2, name: "SEDEX", error: "Serviço indisponível para o trecho", company: { id: 1, name: "Correios" } };

test("PAC válido + SEDEX com erro: SEDEX vai para unavailable com o motivo", () => {
    const { options, unavailable } = buildQuoteResult([sedexErr, pac, { id: 17, name: "Mini Envios", price: "9.9", company: { id: 1, name: "Correios" } }]);
    assert.deepEqual(options.map((o) => o.service_id), [17, 1]); // ordenado por preço
    assert.equal(unavailable.length, 1);
    assert.equal(unavailable[0]!.service_id, 2);
    assert.equal(unavailable[0]!.company, "Correios");
    assert.match(unavailable[0]!.reason, /indisponível/);
});

test("serviço ausente da resposta aparece como indisponível (reconhecido pelo id)", () => {
    const { options, unavailable } = buildQuoteResult([pac]);
    assert.equal(options.length, 1);
    assert.deepEqual(unavailable.map((u) => [u.service_id, u.service]), [[2, "SEDEX"]]);
});

test("ambos ausentes", () => {
    const { options, unavailable } = buildQuoteResult([]);
    assert.equal(options.length, 0);
    assert.equal(unavailable.length, 2);
});

test("preço inválido conta como indisponível", () => {
    const { unavailable } = buildQuoteResult([{ ...pac, price: "0" }, { id: 2, name: "SEDEX", price: "30" }]);
    assert.deepEqual(unavailable.map((u) => u.service_id), [1]);
});

test("MELHORENVIO_SERVICES: PAC/SEDEX entram na união sem duplicar; vazio = todos", () => {
    assert.equal(servicesWithRequired(""), "");
    assert.equal(servicesWithRequired("17"), "17,1,2");
    assert.equal(servicesWithRequired("1,2,17"), "1,2,17");
});
