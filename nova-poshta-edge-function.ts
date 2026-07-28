import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = new Set([
  "https://hobbytequipment.com",
  "http://hobbytequipment.com",
  "https://www.hobbytequipment.com",
  "http://www.hobbytequipment.com",
  "https://roman130994.github.io",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://hobbytequipment.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

async function requireAdminSession(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Потрібно увійти в адмінпанель.");
  const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: Deno.env.get("SUPABASE_ANON_KEY") || "" },
  });
  if (!response.ok) throw new Error("Сесія адмінпанелі завершилася. Увійдіть знову.");
}

async function np(modelName: string, calledMethod: string, methodProperties: Record<string, unknown>) {
  const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: Deno.env.get("NOVA_POSHTA_API_KEY"), modelName, calledMethod, methodProperties }),
  });
  const result = await response.json();
  if (!response.ok || result.success === false) throw new Error(result.errors?.join(", ") || result.warnings?.join(", ") || "Помилка Нової Пошти.");
  return result.data || [];
}

async function cityRefByName(city: string) {
  const cities = await np("Address", "getCities", { FindByString: city, Limit: "20" });
  const exact = cities.find((item: any) => String(item.Description || "").toLowerCase() === city.toLowerCase());
  const selected = exact || cities[0];
  if (!selected?.Ref) throw new Error(`Не знайдено місто «${city}» у Новій Пошті.`);
  return selected.Ref;
}

async function warehouseRef(cityRef: string, query: string) {
  const warehouses = await np("Address", "getWarehouses", { CityRef: cityRef, FindByString: query, Limit: "30" });
  const selected = warehouses[0];
  if (!selected?.Ref) throw new Error(`Не знайдено відділення «${query}» у Новій Пошті.`);
  return selected.Ref;
}

function splitName(name: string) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return { LastName: parts[0] || "Відправник", FirstName: parts[1] || parts[0] || "Відправник", MiddleName: parts.slice(2).join(" ") };
}

async function createCounterparty(name: string, phone: string, property: "Sender" | "Recipient") {
  const data = await np("Counterparty", "save", {
    ...splitName(name), Phone: phone, CounterpartyType: "PrivatePerson", CounterpartyProperty: property,
  });
  const party = data[0];
  if (!party?.Ref) throw new Error(`Не вдалося створити ${property === "Sender" ? "відправника" : "отримувача"} у Новій Пошті.`);
  const contacts = await np("Counterparty", "getCounterpartyContactPersons", { Ref: party.Ref, Page: "1" });
  const contact = contacts[0];
  if (!contact?.Ref) throw new Error("Нова Пошта не повернула контактну особу.");
  return { ref: party.Ref, contactRef: contact.Ref };
}

Deno.serve(async (req) => {
  const headers = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  try {
    if (req.method !== "POST") return Response.json({ error: "Дозволений лише POST-запит." }, { status: 405, headers });
    const body = await req.json();
    const action = body.action;
    const search = String(body.query || "").trim();

    if (["senders", "sender_contacts", "sender_addresses", "create_ttn", "print_ttn", "print_marking"].includes(action)) await requireAdminSession(req);

    if (action === "cities") {
      if (!search) return Response.json({ error: "Введіть хоча б одну літеру." }, { status: 400, headers });
      const data = await np("Address", "getCities", { FindByString: search, Limit: "20" });
      return Response.json({ data: data.map((item: any) => ({ ref: item.Ref, name: item.Description })) }, { headers: { ...headers, "Content-Type": "application/json" } });
    }

    if (action === "warehouses") {
      if (!body.cityRef) return Response.json({ error: "Спочатку виберіть місто." }, { status: 400, headers });
      const data = await np("Address", "getWarehouses", { CityRef: body.cityRef, FindByString: search, Limit: search ? "30" : "500" });
      return Response.json({ data: data.map((item: any) => ({ ref: item.Ref, name: item.Description, number: item.Number || "" })) }, { headers: { ...headers, "Content-Type": "application/json" } });
    }

    if (action === "senders") {
      const data = await np("Counterparty", "getCounterparties", { CounterpartyProperty: "Sender", Page: "1" });
      return Response.json({ data: data.map((item: any) => ({
        ref: item.Ref,
        name: item.Description || [item.LastName, item.FirstName, item.MiddleName].filter(Boolean).join(" ") || "Відправник",
        phone: item.Phone || "",
      })) }, { headers: { ...headers, "Content-Type": "application/json" } });
    }

    if (action === "sender_contacts") {
      if (!body.query) throw new Error("Не вибрано відправника Нової Пошти.");
      const data = await np("Counterparty", "getCounterpartyContactPersons", { Ref: body.query, Page: "1" });
      return Response.json({ data: data.map((item: any) => ({
        ref: item.Ref,
        name: item.Description || [item.LastName, item.FirstName, item.MiddleName].filter(Boolean).join(" ") || "Контактна особа",
        phone: item.Phone || "",
      })) }, { headers: { ...headers, "Content-Type": "application/json" } });
    }

    if (action === "create_ttn") {
      const order = body.order || {};
      const sender = body.senderProfile || {};
      const delivery = typeof order.delivery_data === "string" ? JSON.parse(order.delivery_data) : (order.delivery_data || {});
      const weight = Number(body.weight);
      const payer = body.payer === "Recipient" ? "Recipient" : "Sender";
      const description = String(body.description || "").trim();
      if (!sender.sender_name || !sender.phone || !sender.city || !sender.address) throw new Error("Заповніть усі дані профілю відправника.");
      if (!order.customer_name || !order.phone || !delivery.city_ref || !delivery.warehouse_ref) throw new Error("У замовленні бракує даних отримувача Нової Пошти.");
      if (!weight || !description) throw new Error("Вкажіть вагу та опис посилки.");
      if (String(delivery.type || "").includes("courier")) throw new Error("Для кур’єрської доставки потрібно окремо додати технічну адресу отримувача. Поки що автоматично створюються ТТН до відділення.");

      const senderCity = sender.city_ref || await cityRefByName(sender.city);
      const senderWarehouse = sender.address_ref || await warehouseRef(senderCity, sender.address);
      if (!sender.sender_ref || !sender.contact_ref) throw new Error("У профілі виберіть відправника й контактну особу з кабінету Нової Пошти.");
      const senderParty = { ref: sender.sender_ref, contactRef: sender.contact_ref };
      const recipientParty = await createCounterparty(order.customer_name, order.phone, "Recipient");
      const today = new Date();
      const dateTime = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
      const documents = await np("InternetDocument", "save", {
        PayerType: payer,
        PaymentMethod: "Cash",
        DateTime: dateTime,
        CargoType: "Cargo",
        Weight: String(weight),
        ServiceType: "WarehouseWarehouse",
        SeatsAmount: "1",
        Description: description,
        Cost: String(Number(order.total || 0)),
        CitySender: senderCity,
        Sender: senderParty.ref,
        SenderAddress: senderWarehouse,
        ContactSender: senderParty.contactRef,
        SendersPhone: sender.phone,
        CityRecipient: delivery.city_ref,
        Recipient: recipientParty.ref,
        RecipientAddress: delivery.warehouse_ref,
        ContactRecipient: recipientParty.contactRef,
        RecipientsPhone: order.phone,
      });
      const document = documents[0];
      if (!document?.IntDocNumber) throw new Error("Нова Пошта не повернула номер ТТН.");
      return Response.json({ ttn_number: document.IntDocNumber, ttn_ref: document.Ref || "" }, { headers: { ...headers, "Content-Type": "application/json" } });
    }

    if (action === "print_ttn") {
      const documentRef = String(body.ttn_ref || "").trim();
      const apiKey = Deno.env.get("NOVA_POSHTA_API_KEY");
      if (!documentRef) throw new Error("У замовленні не збережено службовий код ТТН Нової Пошти.");
      if (!apiKey) throw new Error("Не налаштовано ключ Нової Пошти.");

      // This address returns the original Nova Poshta print form. The API key remains only on the server.
      const printResponse = await fetch(
        `https://my.novaposhta.ua/orders/printDocument/orders/${encodeURIComponent(documentRef)}/type/pdf/apiKey/${encodeURIComponent(apiKey)}`,
      );
      if (!printResponse.ok) throw new Error("Нова Пошта не повернула PDF ТТН. Спробуйте ще раз через хвилину.");
      const pdf = await printResponse.arrayBuffer();
      return new Response(pdf, {
        headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": "inline" },
      });
    }

    if (action === "print_marking") {
      const documentRef = String(body.ttn_ref || "").trim();
      const apiKey = Deno.env.get("NOVA_POSHTA_API_KEY");
      if (!documentRef) throw new Error("У замовленні не збережено службовий код ТТН Нової Пошти.");
      if (!apiKey) throw new Error("Не налаштовано ключ Нової Пошти.");

      // The marking service is separate from the JSON API: it returns Nova Poshta's original label file.
      const labelResponse = await fetch(
        `https://my.novaposhta.ua/orders/printMarkings/orders/${encodeURIComponent(documentRef)}/type/pdf/apiKey/${encodeURIComponent(apiKey)}`,
      );
      if (!labelResponse.ok) throw new Error("Не вдалося завантажити маркування ТТН з Нової Пошти.");
      const pdf = await labelResponse.arrayBuffer();
      return new Response(pdf, {
        headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": "inline" },
      });
    }

    return Response.json({ error: "Невідома дія." }, { status: 400, headers });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Невідома помилка." }, { status: 500, headers: { ...headers, "Content-Type": "application/json" } });
  }
});
