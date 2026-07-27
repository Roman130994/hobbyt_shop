let currentSort = 'default';
let shopProducts = [...productsData];
const selectedVariants = new Map();

function formatPrice(value) {
    return `${Number(value || 0).toLocaleString('uk-UA')} ₴`;
}

function escapeProductText(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function mapDatabaseProduct(row) {
    const images = Array.isArray(row.images) ? row.images : [];
    const price = formatPrice(row.price);
    const oldPrice = row.old_price ? formatPrice(row.old_price) : null;
    return {
        id: row.id,
        name: row.name,
        price,
        oldPrice,
        discount: row.old_price && row.old_price > row.price
            ? `-${Math.round((1 - row.price / row.old_price) * 100)}%` : null,
        image: images[0] || '4.png',
        gallery: images,
        rating: 5,
        category: row.category,
        popular: row.is_popular,
        description: row.description,
        sku: row.sku,
        specifications: row.specifications,
        highlights: row.highlights || [],
        variants: row.variants || { enabled: false, items: [] },
        videoUrl: row.video_url,
        inStock: row.in_stock
    };
}

async function loadProductsFromSupabase() {
    if (!window.supabase || !window.HOBBYT_SUPABASE_URL) return;
    const client = window.supabase.createClient(window.HOBBYT_SUPABASE_URL, window.HOBBYT_SUPABASE_KEY);
    const { data, error } = await client.from('products').select('*').order('sort_order').order('id');
    if (!error && data && data.length) shopProducts = data.map(mapDatabaseProduct);
}

async function loadSiteContentFromSupabase() {
    if (!window.supabase || !window.HOBBYT_SUPABASE_URL) return;
    const client = window.supabase.createClient(window.HOBBYT_SUPABASE_URL, window.HOBBYT_SUPABASE_KEY);
    const { data } = await client.from('site_settings').select('data').eq('id', 'content').maybeSingle();
    if (data?.data) Object.keys(data.data).forEach(page => siteContent[page] = { ...(siteContent[page] || {}), ...data.data[page] });
    const { data: banners } = await client.from('site_settings').select('data').eq('id', 'banners').maybeSingle();
    if (banners?.data?.slides) bannerData.slides = banners.data.slides;
}

function renderProducts(containerId, categoryFilter = null, limit = null, page = 1, sortType = currentSort) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let products = [...shopProducts];
    if (categoryFilter) {
        if (categoryFilter === 'popular') {
            products = products.filter(p => p.popular === true);
        } else if (categoryFilter === 'sale') {
            products = products.filter(p => p.discount);
        } else {
            products = products.filter(p => p.category === categoryFilter);
        }
    }

    if (sortType === 'price') {
        products.sort((a, b) => parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, '')));
    } else if (sortType === 'popular') {
        products.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    } else if (sortType === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
    }

    const itemsPerPage = 16;
    if (containerId === 'all-products-list') {
        const totalPages = Math.ceil(products.length / itemsPerPage);
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        products = products.slice(start, end);
        renderPagination(totalPages, page);
    } else if (limit) {
        products = products.slice(0, limit);
    }

    const isCarousel = containerId.toLowerCase().includes('carousel');

    container.innerHTML = products.map(p => {
        const productCard = document.createElement('div');
        productCard.className = isCarousel ? 'product-card' : 'col-4';
        
        const discountBadge = p.discount ? `<div class="discount-badge">${p.discount}</div>` : '';
        const hasDiscount = p.oldPrice && parseInt(p.oldPrice.replace(/[^\d]/g, '')) > parseInt(p.price.replace(/[^\d]/g, ''));
        const priceHTML = hasDiscount
            ? `<p><span class="old-price">${p.oldPrice}</span> ${p.price}</p>` 
            : `<p>${p.price}</p>`;

        productCard.innerHTML = `
            ${discountBadge}
            <a href="product_details.html?id=${p.id}"><img src="${p.image.replace(/^images\//, '')}" alt="${p.name}"></a>
            <a href="product_details.html?id=${p.id}"><h4>${p.name}</h4></a>
            <div class="rating">
                ${'<i class="fa fa-star"></i>'.repeat(Math.floor(p.rating || 5))}
                ${'<i class="fa fa-star-o"></i>'.repeat(5 - Math.floor(p.rating || 5))}
            </div>
            ${priceHTML}
            <button onclick="addToCart(${p.id})" class="add-to-cart-btn">В кошик</button>
        `;
        return productCard.outerHTML;
    }).join('');
}

function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector('.page-btn');
    if (!paginationContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<span class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</span>`;
    }
    
    if (currentPage < totalPages) {
        html += `<span onclick="changePage(${currentPage + 1})">&#8594;</span>`;
    }

    paginationContainer.innerHTML = html;
}

function changePage(page) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    renderProducts('all-products-list', category, null, page, currentSort);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sortAndRender() {
    const select = document.getElementById('sort-select');
    if (select) {
        currentSort = select.value;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    renderProducts('all-products-list', category, null, 1, currentSort);
}

function renderSingleProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = shopProducts.find(p => p.id === productId);

    if (product) {
        // Заповнюємо основні дані
        const nameEl = document.getElementById('ProductName');
        const priceEl = document.getElementById('ProductPrice');
        const oldPriceEl = document.getElementById('ProductOldPrice');
        const discountEl = document.getElementById('ProductDiscount');
        const imgEl = document.getElementById('ProductImg');
        const descEl = document.getElementById('ProductDesc');
        const catEl = document.getElementById('ProductCategory');
        const skuEl = document.getElementById('ProductSku');

        const imagePath = product.image.replace(/^images\//, '');
        if (nameEl) nameEl.innerText = product.name;
        if (priceEl) priceEl.innerText = product.price;
        const hasDiscount = product.oldPrice && parseInt(product.oldPrice.replace(/[^\d]/g, '')) > parseInt(product.price.replace(/[^\d]/g, ''));
        if (oldPriceEl) { oldPriceEl.hidden = !hasDiscount; oldPriceEl.innerText = hasDiscount ? product.oldPrice : ''; }
        if (discountEl) { discountEl.hidden = !hasDiscount; discountEl.innerText = hasDiscount ? product.discount : ''; }
        if (imgEl) {
            imgEl.src = imagePath;
            imgEl.alt = product.name;
        }
        if (descEl) descEl.innerText = product.description || "Опис скоро з'явиться...";
        if (catEl) catEl.innerText = "Головна / " + (product.category === 'popular' ? 'Популярні' : product.category);
        if (skuEl) skuEl.innerText = `Код: HBT-${String(product.id).padStart(3, '0')}`;
        document.title = `${product.name} | Hobbyt Equipment`;

        renderProductGallery(product, imagePath);
        renderProductDetails(product);
        renderProductVariants(product);
        renderRelatedProducts(product);
        
        // Додаємо дію для кнопки кошика
        const cartBtn = document.querySelector('.single-product .btn');
        if (cartBtn) {
            cartBtn.setAttribute('onclick', `addProductPageToCart(${product.id}); return false;`);
        }
    }
}

function renderProductVariants(product) {
    const container = document.getElementById('ProductVariants');
    const select = document.getElementById('ProductVariantSelect');
    const stockEl = document.querySelector('.product-status .in-stock');
    if (!container || !select) return;
    const variants = product.variants?.enabled ? (product.variants.items || []).filter(item => item.name) : [];
    container.hidden = !variants.length;
    if (!variants.length) return;
    const chosen = selectedVariants.get(product.id) ?? 0;
    select.innerHTML = variants.map((item, index) => `<option value="${index}" ${index === chosen ? 'selected' : ''}>${escapeProductText(item.name)} — ${formatPrice(item.price)} (${item.stock_quantity || 0} шт.)</option>`).join('');
    const applyVariant = () => {
        const variant = variants[Number(select.value)];
        selectedVariants.set(product.id, Number(select.value));
        document.getElementById('ProductPrice').innerText = formatPrice(variant.price);
        if (stockEl) stockEl.innerHTML = `<i class="fa fa-check-circle" aria-hidden="true"></i>${variant.stock_quantity > 0 ? `В наявності: ${variant.stock_quantity} шт.` : 'Немає в наявності'}`;
    };
    select.onchange = applyVariant;
    applyVariant();
}

function renderProductDetails(product) {
    const description = document.getElementById('ProductDesc');
    const specifications = document.getElementById('ProductSpecifications');
    const video = document.getElementById('ProductVideo');
    const videoTitle = document.getElementById('ProductVideoTitle');
    const highlights = document.getElementById('ProductHighlights');
    const categoryNames = {
        handles: 'Ручки для тренувань',
        sets: 'Сети для тренувань',
        blocks: 'Блоки для тренувань',
        tables: 'Столи для тренувань'
    };
    const categorySpecs = {
        handles: [['Діаметр ручки', product.name.includes('60') ? '60 мм' : '50 мм'], ['Матеріал', 'Ударостійкий полімер'], ['Вага', '0,18 кг'], ['Кріплення', 'Карабін у комплекті'], ['Колір', 'Чорний'], ['Країна виробництва', 'Україна']],
        sets: [['Матеріал', 'Полімер і сталь'], ['Кількість елементів', '3 предмети'], ['Призначення', 'Тренування кисті та передпліччя'], ['Комплектація', 'Сет у фірмовій упаковці'], ['Вага комплекту', '0,85 кг'], ['Країна виробництва', 'Україна']],
        blocks: [['Матеріал', 'Сталь'], ['Максимальне навантаження', '120 кг'], ['Тип кріплення', 'Карабін'], ['Комплектація', 'Блок і елементи кріплення'], ['Покриття', 'Порошкове фарбування'], ['Країна виробництва', 'Україна']],
        tables: [['Матеріал рами', 'Сталь'], ['Покриття', 'Зносостійка фарба'], ['Призначення', 'Тренування з армрестлінгу'], ['Комплектація', 'Основна конструкція товару'], ['Колір', 'Чорний'], ['Країна виробництва', 'Україна']]
    };
    const categoryHighlights = {
        handles: ['Продумана форма для тренування кисті', 'Компактний формат для дому або залу', 'Надійне кріплення для робочої ваги'],
        sets: ['Готовий набір для комплексного тренування', 'Елементи підібрані для різних вправ', 'Зручно дарувати та зберігати'],
        blocks: ['Стабільна конструкція для навантажень', 'Сумісність із тренувальними аксесуарами', 'Зручне кріплення та швидке налаштування'],
        tables: ['Стійка основа для регулярних тренувань', 'Конструкція для дому та спортивного залу', 'Зносостійкі матеріали для активного використання']
    };
    const defaultSpecs = [
        ['Категорія', categoryNames[product.category] || 'Тренувальне обладнання'],
        ...categorySpecs[product.category],
        ['Гарантія', '12 місяців']
    ];
    const customSpecs = Array.isArray(product.specifications)
        ? product.specifications
        : Object.entries(product.specifications || {});
    const specs = customSpecs.length ? customSpecs : defaultSpecs;

    if (description) {
        const paragraphs = (product.description || 'Опис товару скоро з’явиться.')
            .split(/\n{2,}/)
            .map(text => text.trim())
            .filter(Boolean);
        description.innerHTML = `<h2>${escapeProductText(product.name)}</h2>${paragraphs.map(text => `<p>${escapeProductText(text)}</p>`).join('')}`;
    }
    if (specifications) {
        specifications.innerHTML = specs.map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join('');
    }
    if (video) video.style.backgroundImage = `linear-gradient(rgba(12, 12, 12, .4), rgba(12, 12, 12, .72)), url('${product.image.replace(/^images\//, '')}')`;
    if (videoTitle) videoTitle.innerText = `Відеоогляд: ${product.name}`;
    if (highlights) {
        highlights.innerHTML = '';
        (product.highlights?.length ? product.highlights : categoryHighlights[product.category] || []).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
            li.append(document.createTextNode(item));
            highlights.appendChild(li);
        });
    }
}

function renderProductGallery(product, mainImage) {
    const gallery = document.getElementById('ProductGallery');
    const mainImageEl = document.getElementById('ProductImg');
    const previousButton = document.querySelector('.product-gallery-prev');
    const nextButton = document.querySelector('.product-gallery-next');
    if (!gallery || !mainImageEl) return;

    const fallbackGallery = [mainImage, '4.png', '3.png', '2.png', '1.png'];
    const images = [...new Set((product.gallery || fallbackGallery).map(image => image.replace(/^images\//, '')))];
    gallery.innerHTML = images.map((image, index) => `
        <button type="button" class="small-img-col${index === 0 ? ' active' : ''}" aria-label="Фото ${index + 1} товару">
            <img src="${image}" class="small-img" alt="${product.name}">
        </button>
    `).join('');

    let currentIndex = 0;
    const showImage = (index) => {
        currentIndex = (index + images.length) % images.length;
        mainImageEl.src = images[currentIndex];
        gallery.querySelectorAll('.small-img-col').forEach((item, itemIndex) => {
            item.classList.toggle('active', itemIndex === currentIndex);
        });
    };

    gallery.querySelectorAll('.small-img-col').forEach((thumb, index) => {
        thumb.addEventListener('click', () => showImage(index));
    });
    if (previousButton) previousButton.onclick = () => showImage(currentIndex - 1);
    if (nextButton) nextButton.onclick = () => showImage(currentIndex + 1);
}

function renderRelatedProducts(product) {
    const container = document.getElementById('related-products');
    if (!container) return;

    const related = shopProducts.filter(item => item.id !== product.id && item.category === product.category).slice(0, 4);
    container.innerHTML = related.map(item => `
        <div class="col-4">
            <a href="product_details.html?id=${item.id}"><img src="${item.image.replace(/^images\//, '')}" alt="${item.name}"></a>
            <a href="product_details.html?id=${item.id}"><h4>${item.name}</h4></a>
            <div class="rating">${'<i class="fa fa-star"></i>'.repeat(Math.floor(item.rating || 5))}</div>
            <p>${item.price}</p>
        </div>
    `).join('');
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('hobbytCart')) || [];
    const product = shopProducts.find(p => p.id === productId);
    
    if (product) {
        cart.push({...product, quantity: 1});
        localStorage.setItem('hobbytCart', JSON.stringify(cart));
        updateCartBadge();
        alert('Товар додано до кошика!');
    }
}

function addProductPageToCart(productId) {
    const product = shopProducts.find(item => item.id === productId);
    const variants = product?.variants?.enabled ? (product.variants.items || []).filter(item => item.name) : [];
    const index = selectedVariants.get(productId) ?? 0;
    const variant = variants[index];
    if (variant && variant.stock_quantity < 1) { alert('Цієї модифікації немає в наявності.'); return; }
    if (variant) {
        const cart = JSON.parse(localStorage.getItem('hobbytCart')) || [];
        cart.push({ ...product, name: `${product.name} — ${variant.name}`, price: formatPrice(variant.price), selectedVariant: variant, quantity: 1 });
        localStorage.setItem('hobbytCart', JSON.stringify(cart));
        updateCartBadge();
        alert('Товар додано до кошика!');
        return;
    }
    addToCart(productId);
}

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const cart = JSON.parse(localStorage.getItem('hobbytCart')) || [];
    const count = cart.length;

    badges.forEach(badge => {
        if (count > 0) {
            badge.innerText = count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    });
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    let cart = JSON.parse(localStorage.getItem('hobbytCart')) || [];
    let subtotal = 0;

    const checkoutBtn = document.getElementById('checkout-btn-container');

    if (cart.length === 0) {
        container.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 50px;">Кошик порожній</td></tr>';
        const subtotalEl = document.getElementById('cart-subtotal');
        if (subtotalEl) subtotalEl.innerText = '0 ₴';
        const taxEl = document.getElementById('cart-tax');
        if (taxEl) taxEl.innerText = '0 ₴';
        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.innerText = '0 ₴';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    if (checkoutBtn) checkoutBtn.style.display = 'block';

    container.innerHTML = cart.map((item, index) => {
        const price = parseInt(item.price.replace(/[^\d]/g, ''));
        subtotal += price * item.quantity;
        return `
            <tr>
                <td>
                    <div class="cart-info">
                        <img src="${item.image.replace(/^images\//, '')}">
                        <div>
                            <p>${item.name}</p>
                            <small>Ціна: ${item.price}</small>
                            <br>
                            <a href="#" onclick="removeFromCart(${index}); return false;" style="color: #ff523b;">Видалити</a>
                        </div>
                    </div>
                </td>
                <td><input type="number" value="${item.quantity}" disabled></td>
                <td>${item.price}</td>
            </tr>
        `;
    }).join('');

    const tax = Math.round(subtotal * 0.2);
    const total = subtotal + tax;

    const subtotalEl = document.getElementById('cart-subtotal');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString() + ' ₴';
    if (taxEl) taxEl.innerText = tax.toLocaleString() + ' ₴';
    if (totalEl) totalEl.innerText = total.toLocaleString() + ' ₴';
}

const deliveryTemplates = {
    nova_branch: `<div class="form-group"><label for="np-city">Місто Нової Пошти <span class="required">*</span></label><input id="np-city" type="text" autocomplete="off" placeholder="Почніть вводити місто" required><select id="np-city-results" class="nova-results" size="4" hidden aria-label="Варіанти міст"></select></div><div class="form-group"><label for="np-branch">Відділення <span class="required">*</span></label><input id="np-branch" type="text" autocomplete="off" placeholder="Спочатку виберіть місто" disabled required><select id="np-branch-results" class="nova-results" size="4" hidden aria-label="Варіанти відділень"></select><small id="np-branch-hint">Оберіть місто зі списку, щоб знайти відділення.</small></div>`,
    nova_courier: `<div class="form-group"><label for="np-courier-city">Місто <span class="required">*</span></label><input id="np-courier-city" type="text" autocomplete="off" placeholder="Почніть вводити місто" required><select id="np-courier-city-results" class="nova-results" size="4" hidden aria-label="Варіанти міст"></select></div><div class="form-row"><div class="form-group half"><label for="np-courier-street">Вулиця <span class="required">*</span></label><input id="np-courier-street" type="text" required></div><div class="form-group half"><label for="np-courier-house">Будинок <span class="required">*</span></label><input id="np-courier-house" type="text" required></div></div>`,
    ukrposhta: `<div class="form-group"><label for="ukr-city">Місто / село <span class="required">*</span></label><input id="ukr-city" type="text" required></div><div class="form-group"><label for="ukr-index">Поштовий індекс <span class="required">*</span></label><input id="ukr-index" type="text" inputmode="numeric" required></div>`,
    pickup: `<div class="form-group"><label for="pickup-location">Точка самовивозу</label><select id="pickup-location"><option>Узгодити з менеджером</option></select><small>Після замовлення ми підтвердимо час і адресу самовивозу.</small></div>`
};

async function novaPoshtaLookup(action, query, cityRef = '') {
    const response = await fetch(`${window.HOBBYT_SUPABASE_URL}/functions/v1/nova-poshta`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: window.HOBBYT_SUPABASE_KEY
        },
        body: JSON.stringify({ action, query, cityRef })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Не вдалося отримати дані Нової Пошти');
    return result.data || [];
}

function fillNovaResults(select, items, formatItem) {
    select.innerHTML = items.map(item => `<option value="${item.ref}">${formatItem(item)}</option>`).join('');
    select.hidden = items.length === 0;
}

function attachNovaCitySearch(inputId, resultsId, onSelect) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    if (!input || !results) return;
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        input.dataset.npRef = '';
        results.hidden = true;
        if (input.value.trim().length < 1) return;
        timer = setTimeout(async () => {
            try {
                const cities = await novaPoshtaLookup('cities', input.value);
                fillNovaResults(results, cities, city => city.name);
            } catch (error) {
                console.error('Nova Poshta cities:', error);
            }
        }, 300);
    });
    const chooseCity = () => {
        const option = results.options[results.selectedIndex];
        if (!option) return;
        input.value = option.text;
        input.dataset.npRef = option.value;
        results.hidden = true;
        onSelect?.(option.value);
    };
    results.addEventListener('change', chooseCity);
    results.addEventListener('click', () => setTimeout(chooseCity, 0));
}

function attachNovaBranchSearch() {
    const cityInput = document.getElementById('np-city');
    const branchInput = document.getElementById('np-branch');
    const branchResults = document.getElementById('np-branch-results');
    const hint = document.getElementById('np-branch-hint');
    if (!cityInput || !branchInput || !branchResults) return;

    attachNovaCitySearch('np-city', 'np-city-results', () => {
        branchInput.disabled = false;
        branchInput.placeholder = 'Почніть вводити номер або назву';
        if (hint) hint.textContent = 'Почніть вводити номер або назву відділення.';
    });

    let timer;
    branchInput.addEventListener('input', () => {
        clearTimeout(timer);
        branchResults.hidden = true;
        const cityRef = cityInput.dataset.npRef;
        if (!cityRef || branchInput.value.trim().length < 1) return;
        timer = setTimeout(async () => {
            try {
                const branches = await novaPoshtaLookup('warehouses', branchInput.value, cityRef);
                fillNovaResults(branchResults, branches, branch => branch.number ? `${branch.number}. ${branch.name}` : branch.name);
            } catch (error) {
                console.error('Nova Poshta branches:', error);
                if (hint) hint.textContent = 'Не вдалося знайти відділення. Спробуйте ще раз.';
            }
        }, 300);
    });
    const chooseBranch = () => {
        const option = branchResults.options[branchResults.selectedIndex];
        if (!option) return;
        branchInput.value = option.text;
        branchInput.dataset.npRef = option.value;
        branchResults.hidden = true;
    };
    branchResults.addEventListener('change', chooseBranch);
    branchResults.addEventListener('click', () => setTimeout(chooseBranch, 0));
}

function renderDeliveryFields() {
    const container = document.getElementById('delivery-fields');
    const selected = document.querySelector('input[name="delivery_method"]:checked');
    if (!container || !selected) return;
    container.innerHTML = deliveryTemplates[selected.value] || '';
    const shippingText = document.querySelector('.shipping-row div');
    const names = { nova_branch: 'Нова Пошта — відділення', nova_courier: 'Нова Пошта — кур’єр', ukrposhta: 'Укрпошта', pickup: 'Самовивіз' };
    if (shippingText) shippingText.textContent = names[selected.value];
    if (selected.value === 'nova_branch') attachNovaBranchSearch();
    if (selected.value === 'nova_courier') attachNovaCitySearch('np-courier-city', 'np-courier-city-results');
}

function renderCheckout() {
    const container = document.getElementById('checkout-items-list');
    if (!container) return;

    let cart = JSON.parse(localStorage.getItem('hobbytCart')) || [];
    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center;">Кошик порожній</p>';
        document.getElementById('checkout-subtotal').innerText = '0 ₴';
        document.getElementById('checkout-total').innerText = '0 ₴';
        return;
    }

    container.innerHTML = cart.map((item, index) => {
        const price = parseInt(item.price.replace(/[^\d]/g, ''));
        subtotal += price * item.quantity;
        return `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="checkout-item-details">
                    <div class="checkout-item-title">${item.name}</div>
                    <div class="checkout-item-controls">
                        <div class="checkout-item-qty">
                            <button type="button" class="qty-btn" onclick="updateCheckoutQuantity(${index}, -1)">-</button>
                            <span style="width: 20px; text-align: center;">${item.quantity}</span>
                            <button type="button" class="qty-btn" onclick="updateCheckoutQuantity(${index}, 1)">+</button>
                        </div>
                        <div class="checkout-item-price">${(price * item.quantity).toLocaleString()} ₴</div>
                        <button type="button" class="remove-item-btn" onclick="removeCheckoutItem(${index})">
                            <i class="fa fa-trash-o"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const tax = 0; // На скріншоті немає ПДВ
    const total = subtotal + tax; // Plus shipping if calculated

    document.getElementById('checkout-subtotal').innerText = subtotal.toLocaleString() + ' ₴';
    document.getElementById('checkout-total').innerText = total.toLocaleString() + ' ₴';

    // Слухач для форми
    const orderForm = document.getElementById('checkout-form');
    if (orderForm && !orderForm.dataset.initialized) {
        orderForm.dataset.initialized = 'true';
        let checkoutStep = 'delivery';
        const customerStep = document.getElementById('customer-details-step');
        const deliveryStep = document.getElementById('delivery-payment-step');
        const notesStep = document.getElementById('checkout-notes-step');
        const privacyPolicy = document.querySelector('.privacy-policy');
        const termsCheck = document.querySelector('.agreement-check');
        const doNotCallCheck = document.querySelector('.do-not-call');
        const submitButton = orderForm.querySelector('.checkout-submit-btn');
        const steps = document.querySelector('.checkout-steps');

        function toggleCustomerFields(disabled) {
            customerStep?.querySelectorAll('input, select, textarea').forEach(field => { field.disabled = disabled; });
        }

        function setCheckoutStep(step) {
            checkoutStep = step;
            const showCustomer = step === 'customer';
            if (customerStep) customerStep.hidden = !showCustomer;
            if (deliveryStep) deliveryStep.hidden = showCustomer;
            if (notesStep) notesStep.hidden = !showCustomer;
            if (privacyPolicy) privacyPolicy.hidden = !showCustomer;
            if (termsCheck) termsCheck.hidden = !showCustomer;
            if (doNotCallCheck) doNotCallCheck.hidden = !showCustomer;
            toggleCustomerFields(!showCustomer);
            termsCheck?.querySelectorAll('input').forEach(field => { field.disabled = !showCustomer; });
            doNotCallCheck?.querySelectorAll('input').forEach(field => { field.disabled = !showCustomer; });
            if (submitButton) submitButton.textContent = showCustomer ? 'ПІДТВЕРДИТИ ЗАМОВЛЕННЯ' : 'ПРОДОВЖИТИ';
            if (steps) steps.innerHTML = showCustomer
                ? '<span>1. Кошик</span><span>2. Доставка й оплата</span><strong>3. Дані покупця</strong>'
                : '<span>1. Кошик</span><strong>2. Доставка й оплата</strong><span>3. Дані покупця</span>';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        document.querySelectorAll('input[name="delivery_method"]').forEach(input => input.addEventListener('change', renderDeliveryFields));
        renderDeliveryFields();
        setCheckoutStep('delivery');
        orderForm.onsubmit = function(e) {
            e.preventDefault();

            if (checkoutStep === 'delivery') {
                if (!orderForm.reportValidity()) return;
                setCheckoutStep('customer');
                return;
            }
            
            // Collect form data
            const isCorp = document.getElementById('corp-order').checked;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const deliverToAlt = document.getElementById('alt-address').checked;
            const street = document.getElementById('street').value;
            const street2 = document.getElementById('street-2').value;
            const city = document.getElementById('city').value;
            const region = document.getElementById('region').value;
            const zip = document.getElementById('zip').value;
            const notes = document.getElementById('notes').value;
            
            const doNotCall = document.getElementById('do-not-call').checked;
            const paymentMethodStr = document.querySelector('input[name="payment_method"]:checked').value;
            const deliveryMethod = document.querySelector('input[name="delivery_method"]:checked').parentElement.textContent.trim();
            const deliveryDetails = [...document.querySelectorAll('#delivery-fields input, #delivery-fields select')].map(field => `${field.previousElementSibling?.textContent?.replace('*', '').trim() || 'Дані'}: ${field.value}`).join(', ');

            // Формуємо список товарів для повідомлення
            let itemsText = cart.map(item => `• ${item.name} x${item.quantity} - ${(parseInt(item.price.replace(/[^\\d]/g, '')) * item.quantity).toLocaleString()} ₴`).join('\n');
            
            const message = `🔔 НОВЕ ЗАМОВЛЕННЯ (Checkout)!\n\n` +
                            `👤 Покупець: ${firstName} ${lastName}\n` +
                            `📞 Телефон: ${phone}\n` +
                            `✉️ E-mail: ${email}\n` +
                            `🏢 Корпоративне: ${isCorp ? 'Так' : 'Ні'}\n` +
                            `📍 Адреса: ${city}, ${region}, Вул. ${street} ${street2}, Індекс: ${zip}\n` +
                            `${deliverToAlt ? '⚠️ Доставка на іншу адресу\n' : ''}` +
                            `📝 Нотатки: ${notes || '-'}\n` +
                            `🚚 Доставка: ${deliveryMethod}${deliveryDetails ? ` (${deliveryDetails})` : ''}\n` +
                            `💳 Оплата: ${paymentMethodStr}\n` +
                            `🔕 Не дзвонити: ${doNotCall ? 'Так' : 'Ні'}\n` +
                            `------------------------\n` +
                            `📦 Товари:\n${itemsText}\n` +
                            `------------------------\n` +
                            `💰 РАЗОМ: ${total.toLocaleString()} ₴\n\n` +
                            `Адмін: @rmnkbtkn`;

            // Відправка в Телеграм
            const token = '8685653696:AAGySLz7j9ntEnaGPHtXt8QF38UG2pluEVc';
            const chatId = '1864685581';
            const url = `https://api.telegram.org/bot${token}/sendMessage`;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            }).then(() => {
                alert('Дякуємо, ' + firstName + '! Ваше замовлення прийнято. Менеджер зв\'яжеться з вами найближчим часом.');
                localStorage.clear();
                window.location.href = 'index.html';
            }).catch(err => {
                console.error('Помилка відправки:', err);
                alert('Сталася помилка при оформленні. Спробуйте ще раз або зв\'яжіться з нами.');
            });
        };
        
        // Show/hide payment descriptions
        const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.querySelectorAll('.payment-desc').forEach(desc => desc.style.display = 'none');
                const id = e.target.id;
                const desc = document.getElementById('desc-' + id);
                if(desc) desc.style.display = 'block';
            });
        });

        // Show/hide alt address fields
        const altAddressCheck = document.getElementById('alt-address');
        const altFielsdContainer = document.querySelector('.alt-address-fields');
        if(altAddressCheck && altFielsdContainer) {
            altAddressCheck.addEventListener('change', (e) => {
                altFielsdContainer.style.display = e.target.checked ? 'block' : 'none';
            });
        }
    }
}

function updateCheckoutQuantity(index, delta) {
    let cart = JSON.parse(localStorage.getItem('hobbytCart')) || [];
    if(cart[index]) {
        cart[index].quantity += delta;
        if(cart[index].quantity < 1) cart[index].quantity = 1;
        localStorage.setItem('hobbytCart', JSON.stringify(cart));
        renderCheckout();
        updateCartBadge();
    }
}

function removeCheckoutItem(index) {
    let cart = JSON.parse(localStorage.getItem('hobbytCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('hobbytCart', JSON.stringify(cart));
    renderCheckout();
    renderCart(); // in case both are somehow open/needed
    updateCartBadge();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('hobbytCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('hobbytCart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
}

function renderSiteContent() {
    // Шукаємо всі елементи з атрибутом data-content
    // Формат: data-content="page.key" (наприклад: "index.heroTitle")
    const elements = document.querySelectorAll('[data-content]');
    elements.forEach(el => {
        const path = el.getAttribute('data-content').split('.');
        if (path.length === 2 && siteContent[path[0]] && siteContent[path[0]][path[1]]) {
            el.innerText = siteContent[path[0]][path[1]];
        }
    });
}

function renderHeroSlider() {
    const container = document.getElementById('hero-slider-container');
    if (!container || typeof bannerData === 'undefined') return;

    const slides = bannerData.slides.map(({ image }) =>
        `<div class="slide"><img src="${image}" alt=""></div>`
    ).join('');
    container.insertAdjacentHTML('afterbegin', slides);
}

// Початковий запуск при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    // Перевіряємо чи є параметр категорії в URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');

    renderProducts('popularCarousel', 'popular');
    renderProducts('newProductsCarousel', 'sale', 10);
    
    // Якщо ми на сторінці продуктів, рендеримо або категорію, або все
    if (categoryFromUrl) {
        renderProducts('all-products-list', categoryFromUrl);
        const titleEl = document.querySelector('.row-2 h2');
        if (titleEl) {
            const catNames = {
                'handles': 'Ручки для тренувань',
                'sets': 'Сети для тренувань',
                'blocks': 'Блоки для тренувань',
                'tables': 'Столи для тренувань'
            };
            titleEl.innerText = catNames[categoryFromUrl] || 'Товари';
        }
    } else {
        renderProducts('all-products-list');
    }

    renderSiteContent();
    renderHeroSlider();
    renderCart();
    updateCartBadge();
    renderSingleProduct();
    renderCheckout();
    if (document.getElementById('checkout-form')) {
        document.querySelectorAll('input[name="delivery_method"]').forEach(input => input.addEventListener('change', renderDeliveryFields));
        renderDeliveryFields();
    }

    // Додаємо навігацію для нової каруселі
    const newCarousel = document.getElementById('newProductsCarousel');
    const newPrevBtn = document.getElementById('newPrevBtn');
    const newNextBtn = document.getElementById('newNextBtn');

    if (newCarousel && newPrevBtn && newNextBtn) {
        newPrevBtn.addEventListener('click', () => {
            newCarousel.scrollBy({ left: -270, behavior: 'smooth' });
        });
        newNextBtn.addEventListener('click', () => {
            newCarousel.scrollBy({ left: 270, behavior: 'smooth' });
        });
    }

    // The static list keeps the shop visible during loading. Once the database
    // responds, redraw all product areas from the single live product source.
    loadProductsFromSupabase().then(() => {
        renderProducts('popularCarousel', 'popular');
        renderProducts('newProductsCarousel', 'sale', 10);
        renderProducts('all-products-list', categoryFromUrl);
        renderSingleProduct();
    });
    loadSiteContentFromSupabase().then(() => {
        renderSiteContent();
        if (typeof renderBanners === 'function') renderBanners();
    });
});
