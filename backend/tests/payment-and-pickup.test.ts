import "./setup.js";
import assert from "node:assert/strict";
import { test } from "node:test";
import prismaClient from "../src/prisma/index.js";
import { applyPaymentInfo } from "../src/services/payment/applyPaymentInfo.js";
import { CreateOrderService } from "../src/services/order/CreateOrderService.js";

const db = prismaClient as any;

// ---------- Reconciliação ----------
function fakeOrderDb(initial: { status: string; paymentStatus: string; total?: number }) {
    const state = { order: { id: "o1", status: initial.status, total: initial.total ?? 10000 }, payment: { status: initial.paymentStatus, discount_amount: 0 } };
    const stubs = {
        order: {
            findUnique: async () => ({ ...state.order }),
            updateMany: async ({ where, data }: any) => {
                if (where.status && where.status !== state.order.status) return { count: 0 };
                state.order.status = data.status;
                if (data.total?.decrement) state.order.total -= data.total.decrement;
                return { count: 1 };
            },
        },
        payment: {
            findUnique: async () => ({ ...state.payment }),
            update: async ({ data }: any) => { Object.assign(state.payment, data); return state.payment; },
        },
    };
    db.order.findUnique = stubs.order.findUnique;
    db.order.updateMany = stubs.order.updateMany;
    db.payment.findUnique = stubs.payment.findUnique;
    db.payment.update = stubs.payment.update;
    db.$transaction = async (fn: any) => fn(db);
    return state;
}
const approved = { id: 999, status: "approved", external_reference: "o1", payment_method_id: "visa", transaction_amount: 100 };

test("pedido PENDING com pagamento aprovado no MP vira PAID; repetir não altera nada", async () => {
    const state = fakeOrderDb({ status: "PENDING", paymentStatus: "PENDING" });

    const first = await applyPaymentInfo(approved);
    assert.equal(first.outcome, "paid");
    assert.equal(state.order.status, "PAID");
    assert.equal(state.payment.status, "APPROVED");
    const snapshot = JSON.stringify(state);

    const second = await applyPaymentInfo(approved);
    assert.equal(second.outcome, "already_approved");
    assert.equal(JSON.stringify(state), snapshot);
});

test("simulação (dryRun) informa o resultado sem gravar", async () => {
    const state = fakeOrderDb({ status: "PENDING", paymentStatus: "PENDING" });
    const result = await applyPaymentInfo(approved, { dryRun: true });
    assert.equal(result.outcome, "paid");
    assert.equal(result.order_status_after, "PAID");
    assert.equal(state.order.status, "PENDING");
    assert.equal(state.payment.status, "PENDING");
});

test("Pix aprovado com valor errado não quita o pedido", async () => {
    const state = fakeOrderDb({ status: "PENDING", paymentStatus: "PENDING", total: 10000 });
    const result = await applyPaymentInfo({ ...approved, payment_method_id: "pix", transaction_amount: 1 });
    assert.equal(result.outcome, "value_mismatch");
    assert.equal(state.order.status, "PENDING");
});

test("aprovação tardia sem estoque: pedido segue CANCELED e sinaliza reembolso manual", async () => {
    const state = fakeOrderDb({ status: "CANCELED", paymentStatus: "PENDING" });
    db.orderItem.findMany = async () => [{ product_id: "p1", quantity: 1 }];
    db.product.updateMany = async () => ({ count: 0 });
    const result = await applyPaymentInfo(approved);
    assert.equal(result.outcome, "manual_refund");
    assert.equal(result.manual_refund, true);
    assert.equal(state.order.status, "CANCELED");
    assert.equal(state.payment.status, "APPROVED");
});

test("pedido inexistente é descartável (sem erro)", async () => {
    db.order.findUnique = async () => null;
    assert.equal((await applyPaymentInfo(approved)).outcome, "order_not_found");
});

// ---------- Retirada na loja ----------
function fakeCheckoutDb(pickupEnabled: boolean) {
    const created: any[] = [];
    db.cart.findUnique = async () => ({
        id: "c1",
        items: [{ product_id: "p1", quantity: 2, product: { id: "p1", price: 5000, promo_price: null, stock: 10, weight_grams: null, height_cm: null, width_cm: null, length_cm: null } }],
    });
    db.storeSettings.findUnique = async () => ({ pickup_enabled: pickupEnabled, pickup_address: "Rua A, 1", pickup_instructions: "" });
    db.coupon.findUnique = async () => ({ id: "cp1", code: "TESTE10", type: "PERCENTAGE", value: 10, active: true, expires_at: null, user_id: null, first_purchase_only: false });
    db.address.findFirst = async () => { throw new Error("retirada não deve buscar endereço"); };
    db.$transaction = async (fn: any) =>
        fn({
            product: { updateMany: async () => ({ count: 1 }) },
            order: { create: async ({ data }: any) => { created.push(data); return { id: "o1", ...data }; } },
            orderItem: { create: async () => ({}) },
            cartItem: { deleteMany: async () => ({}) },
        });
    return created;
}

test("retirada com cupom: sem endereço, frete 0, total = subtotal - desconto, sem Melhor Envio", async () => {
    const created = fakeCheckoutDb(true);
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() => { throw new Error("não deve chamar o Melhor Envio"); }) as any;
    try {
        await new CreateOrderService().execute({
            user_id: "u1",
            delivery_method: "PICKUP",
            coupon_code: "TESTE10",
            // ignorados na retirada:
            address_id: "11111111-1111-1111-1111-111111111111",
            shipping_service: "SEDEX",
            shipping_quote_cents: 5000,
        });
    } finally {
        globalThis.fetch = originalFetch;
    }
    const order = created[0];
    assert.equal(order.delivery_method, "PICKUP");
    assert.equal(order.address_id, null);
    assert.equal(order.shipping_cost, 0);
    assert.equal(order.shipping_service, "Retirada na loja");
    assert.equal(order.shipping_delivery_days, null);
    assert.equal(order.shipping_cost_estimated, false);
    assert.equal(order.subtotal, 10000);
    assert.equal(order.discount, 1000);
    assert.equal(order.total, 9000);
});

test("retirada desligada nas configurações é recusada", async () => {
    fakeCheckoutDb(false);
    await assert.rejects(
        new CreateOrderService().execute({ user_id: "u1", delivery_method: "PICKUP" }),
        /retirada na loja não está disponível/
    );
});
