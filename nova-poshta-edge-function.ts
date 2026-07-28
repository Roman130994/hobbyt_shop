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
  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) throw new Error('Потрібен вхід в адмінпанель.');
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: Deno.env.get('SUPABASE_ANON_KEY') || '' }
  });
  if (!response.ok) throw new Error('Сесія адмінпанелі завершилася. Увійдіть знову.');
}

Deno.serve(async (req) => {
  const headers = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    const { action, query = "", cityRef = "", senderRef = "" } = await req.json();
    const search = String(query).trim();

    if (!['cities', 'warehouses', 'senders', 'sender_contacts', 'sender_addresses'].includes(action)) {
      return Response.json({ error: "Невідома дія" }, { status: 400, headers });
    }
    if (action === 'cities' && search.length < 1) {
      return Response.json({ error: "Введіть хоча б одну літеру" }, { status: 400, headers });
    }
    if (action === 'warehouses' && !cityRef) {
      return Response.json({ error: "Спочатку виберіть місто" }, { status: 400, headers });
    }

    if (['senders', 'sender_contacts', 'sender_addresses'].includes(action)) await requireAdminSession(req);
    if (['sender_contacts', 'sender_addresses'].includes(action) && !senderRef) return Response.json({ error: 'Оберіть відправника.' }, { status: 400, headers });

    const body = action === 'cities'
      ? {
          apiKey: Deno.env.get('NOVA_POSHTA_API_KEY'),
          modelName: 'Address',
          calledMethod: 'getCities',
          methodProperties: { FindByString: search, Limit: '20' },
        }
      : action === 'warehouses' ? {
          apiKey: Deno.env.get('NOVA_POSHTA_API_KEY'),
          modelName: 'Address',
          calledMethod: 'getWarehouses',
          methodProperties: { CityRef: cityRef, FindByString: search, Limit: search ? '30' : '500' },
        } : action === 'senders' ? {
          apiKey: Deno.env.get('NOVA_POSHTA_API_KEY'),
          modelName: 'Counterparty',
          calledMethod: 'getCounterparties',
          methodProperties: { CounterpartyProperty: 'Sender', Page: '1' },
        } : action === 'sender_contacts' ? {
          apiKey: Deno.env.get('NOVA_POSHTA_API_KEY'),
          modelName: 'Counterparty',
          calledMethod: 'getCounterpartyContactPersons',
          methodProperties: { Ref: senderRef, Page: '1' },
        } : {
          apiKey: Deno.env.get('NOVA_POSHTA_API_KEY'),
          modelName: 'Counterparty',
          calledMethod: 'getCounterpartyAddresses',
          methodProperties: { Ref: senderRef, Page: '1' },
        };

    const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.errors?.join(', ') || 'Помилка Нової пошти');
    }

    const data = action === 'cities'
      ? result.data.map((item: any) => ({ ref: item.Ref, name: item.Description }))
      : action === 'warehouses' ? result.data.map((item: any) => ({ ref: item.Ref, name: item.Description, number: item.Number || '' }))
      : action === 'senders' ? result.data.map((item: any) => ({ ref: item.Ref, name: item.Description || item.FirstName || 'Відправник' }))
      : action === 'sender_contacts' ? result.data.map((item: any) => ({ ref: item.Ref, name: item.Description || [item.LastName, item.FirstName, item.MiddleName].filter(Boolean).join(' '), phone: item.Phones || item.Phone || '' }))
      : result.data.map((item: any) => ({ ref: item.Ref, name: item.Description || item.CityDescription || 'Адреса відправника', city_ref: item.City || item.CityRef || '' }));

    return Response.json({ data }, {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Сталася помилка';
    return Response.json({ error: message }, {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
});
