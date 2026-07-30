const productsData = [
    // РУЧКИ (5 товарів)
    { id: 1, name: "Ручка PRO 60 мм", price: "1 200 ₴", oldPrice: "1 500 ₴", discount: "-20%", image: "category-handle.png", rating: 5, category: "handles", popular: true, description: "Професійна ручка для тренування сили хвату." },
    { id: 2, name: "Ручка Basic 50 мм", price: "800 ₴", image: "category-handle.png", rating: 4, category: "handles", description: "Базова ручка для регулярних тренувань." },
    { id: 3, name: "Конус для пронації", price: "1 500 ₴", oldPrice: "1 800 ₴", discount: "-17%", image: "category-handle.png", rating: 5, category: "handles", popular: true, description: "Конусна ручка для роботи над пронацією." },
    { id: 4, name: "Ручка-куля 80 мм", price: "1 300 ₴", image: "category-handle.png", rating: 5, category: "handles", description: "Куляста ручка для розвитку кисті та пальців." },
    { id: 5, name: "Ручка-циліндр", price: "950 ₴", image: "category-handle.png", rating: 4, category: "handles", description: "Класична циліндрична ручка для тренувань." },

    // СЕТИ (5 товарів)
    { id: 6, name: "Сет «Старт»", price: "2 500 ₴", oldPrice: "3 200 ₴", discount: "-22%", image: "category-set.png", rating: 5, category: "sets", popular: true, description: "Набір для початківців: ручки та лямка для тренувань." },
    { id: 7, name: "Сет «Сила кисті»", price: "3 100 ₴", image: "category-set.png", rating: 5, category: "sets", description: "Спеціалізований набір для розвитку сили кисті." },
    { id: 8, name: "Сет «Професіонал»", price: "4 800 ₴", image: "category-set.png", rating: 5, category: "sets", popular: true, description: "Повний набір ручок для інтенсивних тренувань." },
    { id: 9, name: "Подарунковий сет", price: "2 800 ₴", image: "category-set.png", rating: 5, category: "sets", description: "Готовий подарунковий набір для армрестлера." },
    { id: 10, name: "Сет для дому", price: "1 900 ₴", oldPrice: "2 400 ₴", discount: "-21%", image: "category-set.png", rating: 4, category: "sets", description: "Компактний комплект для домашніх тренувань." },

    // БЛОКИ (5 товарів)
    { id: 11, name: "Блок одинарний", price: "3 200 ₴", oldPrice: "4 000 ₴", discount: "-20%", image: "category-block.png", rating: 5, category: "blocks", popular: true, description: "Стандартний блок для кріплення ваги." },
    { id: 12, name: "Блок подвійний", price: "5 500 ₴", image: "category-block.png", rating: 5, category: "blocks", description: "Посилений подвійний блок для навантажень." },
    { id: 13, name: "Блок «Атлант»", price: "4 200 ₴", image: "category-block.png", rating: 5, category: "blocks", popular: true, description: "Міцний блок для складних вправ." },
    { id: 14, name: "Блок настінний", price: "7 800 ₴", image: "category-block.png", rating: 5, category: "blocks", description: "Стаціонарний блок для кріплення до стіни." },
    { id: 15, name: "Компактний блок", price: "2 100 ₴", image: "category-block.png", rating: 4, category: "blocks", description: "Легкий блок для тренувань удома або в дорозі." },

    // СТОЛИ (5 товарів)
    { id: 16, name: "Стіл Hobbyt Classic", price: "12 000 ₴", image: "category-table.png", rating: 5, category: "tables", popular: true, description: "Професійний розбірний стіл для армрестлінгу." },
    { id: 17, name: "Стіл тренувальний", price: "9 500 ₴", image: "category-table.png", rating: 4, category: "tables", description: "Стійка модель для залу та домашнього використання." },
    { id: 18, name: "Стіл Compact", price: "7 200 ₴", image: "category-table.png", rating: 4, category: "tables", description: "Легкий стіл, який зручно транспортувати." },
    { id: 19, name: "Стіл PRO Elite", price: "18 500 ₴", oldPrice: "21 000 ₴", discount: "-12%", image: "category-table.png", rating: 5, category: "tables", popular: true, description: "Преміальна модель для серйозних тренувань." },
    { id: 20, name: "Рама для столу", price: "5 400 ₴", image: "category-table.png", rating: 4, category: "tables", description: "Міцна сталева рама для складання столу." }
];

const bannerData = {
    slides: [
        {
            image: "banner-light-handle.png",
            title: "Потужний хват – твоя перевага",
            text: "Розвивай силу пальців, кистей та передпліч за допомогою професійних ручок."
        },
        {
            image: "banner-light-set.png",
            title: "Міцні та надійні матеріали",
            text: "3D-друк з високоякісного пластику витримує інтенсивні навантаження."
        },
        {
            image: "banner-light-table.png",
            title: "Компактні та зручні",
            text: "Легкі, портативні та ідеально підходять для тренувань будь-де: в залі чи вдома."
        }
    ]
};

const siteContent = {
    index: {
        heroTitle: "Ми створюємо інструменти для перемоги",
        heroText: "Hobbyt Equipment — це не просто бренд, це спільнота армрестлерів, які прагнуть до досконалості.",
        popularTitle: "Популярні товари",
        categoriesTitle: "Категорії товарів",
        saleTitle: "Розпродаж"
    },
    about: {
        heroTitle: "Ми створюємо інструменти для перемоги",
        heroText: "Hobbyt Equipment — це не просто бренд, це спільнота армрестлерів, які прагнуть до досконалості.",
        historyTitle: "Наша історія",
        historyText: "Ласкаво просимо до Hobbyt Equipment — виробника професійного обладнання для армреслінгу! Ми розпочали свій шлях у 2025 році...",
        historyMore: "Як виробник, ми приділяємо максимум уваги кожній деталі: від ергономіки ручок до міцності матеріалів.",
        advantagesTitle: "Чому обирають Hobbyt?",
        qualityTitle: "Якість понад усе",
        qualityText: "Наші ручки для тренування пронації та супінації розроблені так, щоб мінімізувати травматизм..."
    },
    delivery: {
        heroTitle: "Доставка та оплата",
        heroText: "Ваші замовлення будуть доставлені швидко та надійно в будь-яку точку України та світу.",
        deliveryTitle: "Методи доставки",
        novaPostTitle: "Нова Пошта",
        novaPostText: "Найпопулярніший спосіб доставки по Україні. Термін 1-3 дні.",
        internationalTitle: "Міжнародна доставка",
        internationalText: "Ми відправляємо наше обладнання атлетам по всьому світу через Укрпошту або DHL.",
        paymentTitle: "Методи оплати",
        onlinePaymentTitle: "Оплата онлайн",
        onlinePaymentText: "Швидко та безпечно за допомогою карт будь-якого банку (Visa, Mastercard).",
        codTitle: "Післяплата",
        codText: "Сплачуйте замовлення при отриманні у відділенні Нової Пошти."
    },
    catalog: { title: "Всі товари" },
    cart: { checkoutButton: "Оформити замовлення →" },
    checkout: { title: "Платіжні дані", couponText: "Маєте купон знижки? ВВЕДІТЬ КОД", submitButton: "ПІДТВЕРДИТИ ЗАМОВЛЕННЯ" },
    product: { relatedTitle: "Схожі товари", videoTitle: "Відеоогляд товару" }
};

// Експортуємо дані для використання в інших скриптах
if (typeof module !== 'undefined') {
    module.exports = { productsData, bannerData, siteContent };
}
