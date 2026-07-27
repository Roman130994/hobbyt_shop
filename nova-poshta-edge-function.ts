import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://roman130994.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, query = "", cityRef = "" } = await req.json();
    const search = String(query).trim();

    if (!['cities', 'warehouses'].includes(action)) {
      return Response.json({ error: "Невідома дія" }, { status: 400, headers: corsHeaders });
    }
    if (action === 'cities' && search.length < 1) {
      return Response.json({ error: "Введіть хоча б одну літеру" }, { status: 400, headers: corsHeaders });
    }
    if (action === 'warehouses' && !cityRef) {
      return Response.json({ error: "Спочатку виберіть місто" }, { status: 400, headers: corsHeaders });
    }

    const body = action === 'cities'
      ? {
          apiKey: Deno.env.get('NOVA_POSHTA_API_KEY'),
          modelName: 'Address',
          calledMethod: 'getCities',
          methodProperties: { FindByString: search, Limit: '20' },
        }
      : {
          apiKey: Deno.env.get('NOVA_POSHTA_API_KEY'),
          modelName: 'Address',
          calledMethod: 'getWarehouses',
          methodProperties: { CityRef: cityRef, FindByString: search, Limit: search ? '30' : '500' },
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
      : result.data.map((item: any) => ({ ref: item.Ref, name: item.Description, number: item.Number || '' }));

    return Response.json({ data }, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Сталася помилка' }, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
