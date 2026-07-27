const productsData = [
    // РУЧКИ (5 товарів)
    { id: 1, name: "Ручка PRO 60 мм", price: "1 200 ₴", oldPrice: "1 500 ₴", discount: "-20%", image: "4.png", rating: 5, category: "handles", popular: true, description: "Професійна ручка для тренування сили хвату." },
    { id: 2, name: "Ручка Basic 50 мм", price: "800 ₴", image: "4.png", rating: 4, category: "handles", description: "Базова ручка для регулярних тренувань." },
    { id: 3, name: "Конус для пронації", price: "1 500 ₴", oldPrice: "1 800 ₴", discount: "-17%", image: "4.png", rating: 5, category: "handles", popular: true, description: "Конусна ручка для роботи над пронацією." },
    { id: 4, name: "Ручка-куля 80 мм", price: "1 300 ₴", image: "4.png", rating: 5, category: "handles", description: "Куляста ручка для розвитку кисті та пальців." },
    { id: 5, name: "Ручка-циліндр", price: "950 ₴", image: "4.png", rating: 4, category: "handles", description: "Класична циліндрична ручка для тренувань." },

    // СЕТИ (5 товарів)
    { id: 6, name: "Сет «Старт»", price: "2 500 ₴", oldPrice: "3 200 ₴", discount: "-22%", image: "3.png", rating: 5, category: "sets", popular: true, description: "Набір для початківців: ручки та лямка для тренувань." },
    { id: 7, name: "Сет «Сила кисті»", price: "3 100 ₴", image: "3.png", rating: 5, category: "sets", description: "Спеціалізований набір для розвитку сили кисті." },
    { id: 8, name: "Сет «Професіонал»", price: "4 800 ₴", image: "3.png", rating: 5, category: "sets", popular: true, description: "Повний набір ручок для інтенсивних тренувань." },
    { id: 9, name: "Подарунковий сет", price: "2 800 ₴", image: "3.png", rating: 5, category: "sets", description: "Готовий подарунковий набір для армрестлера." },
    { id: 10, name: "Сет для дому", price: "1 900 ₴", oldPrice: "2 400 ₴", discount: "-21%", image: "3.png", rating: 4, category: "sets", description: "Компактний комплект для домашніх тренувань." },

    // БЛОКИ (5 товарів)
    { id: 11, name: "Блок одинарний", price: "3 200 ₴", oldPrice: "4 000 ₴", discount: "-20%", image: "2.png", rating: 5, category: "blocks", popular: true, description: "Стандартний блок для кріплення ваги." },
    { id: 12, name: "Блок подвійний", price: "5 500 ₴", image: "2.png", rating: 5, category: "blocks", description: "Посилений подвійний блок для навантажень." },
    { id: 13, name: "Блок «Атлант»", price: "4 200 ₴", image: "2.png", rating: 5, category: "blocks", popular: true, description: "Міцний блок для складних вправ." },
    { id: 14, name: "Блок настінний", price: "7 800 ₴", image: "2.png", rating: 5, category: "blocks", description: "Стаціонарний блок для кріплення до стіни." },
    { id: 15, name: "Компактний блок", price: "2 100 ₴", image: "2.png", rating: 4, category: "blocks", description: "Легкий блок для тренувань удома або в дорозі." },

    // СТОЛИ (5 товарів)
    { id: 16, name: "Стіл Hobbyt Classic", price: "12 000 ₴", image: "1.png", rating: 5, category: "tables", popular: true, description: "Професійний розбірний стіл для армрестлінгу." },
    { id: 17, name: "Стіл тренувальний", price: "9 500 ₴", image: "1.png", rating: 4, category: "tables", description: "Стійка модель для залу та домашнього використання." },
    { id: 18, name: "Стіл Compact", price: "7 200 ₴", image: "1.png", rating: 4, category: "tables", description: "Легкий стіл, який зручно транспортувати." },
    { id: 19, name: "Стіл PRO Elite", price: "18 500 ₴", oldPrice: "21 000 ₴", discount: "-12%", image: "1.png", rating: 5, category: "tables", popular: true, description: "Преміальна модель для серйозних тренувань." },
    { id: 20, name: "Рама для столу", price: "5 400 ₴", image: "1.png", rating: 4, category: "tables", description: "Міцна сталева рама для складання столу." }
];

const bannerData = {
    slides: [
        {
            image: "golovnyj baner.png",
            title: "Потужний хват – твоя перевага",
            text: "Розвивай силу пальців, кистей та передпліч за допомогою професійних ручок."
        },
        {
            image: "golovnyj baner 1.png",
            title: "Міцні та надійні матеріали",
            text: "3D-друк з високоякісного пластику витримує інтенсивні навантаження."
        },
        {
            image: "golovnyj baner 3.png",
            title: "Компактні та зручні",
            text: "Легкі, портативні та ідеально підходять для тренувань будь-де: в залі чи вдома."
        }
    ]
};

const siteContent = {
    index: {
        heroTitle: "Ми створюємо інструменти для перемоги",
        heroText: "Hobbyt Equipment — це не просто бренд, це спільнота армрестлерів, які прагнуть до досконалості.",
        popularTitle: "Категорії товарів",
        newProductsTitle: "Нові товари"
    },
    about: {
        heroTitle: "Ми створюємо інструменти для перемоги",
        heroText: "Hobbyt Equipment — це не просто бренд, це спільнота армрестлерів, які прагнуть до досконалості.",
        historyTitle: "Наша історія",
        historyText: "Ласкаво просимо до Hobbyt Equipment — виробника професійного обладнання для армреслінгу! Ми розпочали свій шлях у 2025 році...",
        qualityTitle: "Якість понад усе",
        qualityText: "Наші ручки для тренування пронації та супінації розроблені так, щоб мінімізувати травматизм..."
    }
};

// Експортуємо дані для використання в інших скриптах
if (typeof module !== 'undefined') {
    module.exports = { productsData, bannerData, siteContent };
}
