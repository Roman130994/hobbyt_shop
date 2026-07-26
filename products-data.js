const productsData = [
    // РУЧКИ (8 товарів)
    { id: 1, name: "Ручка PRO 60мм", price: "1 200 ₴", oldPrice: "1 500 ₴", discount: "-20%", image: "images/4.png", rating: 5, category: "handles", popular: true, description: "Професійна ручка для тренування хвату." },
    { id: 2, name: "Ручка Basic 50мм", price: "800 ₴", oldPrice: "1 000 ₴", discount: "-20%", image: "images/4.png", rating: 4, category: "handles", description: "Базова ручка для початківців." },
    { id: 3, name: "Конус великий", price: "1 500 ₴", oldPrice: "1 800 ₴", discount: "-17%", image: "images/4.png", rating: 5, category: "handles", popular: true, description: "Конусна ручка для роботи над пронацією." },
    { id: 4, name: "Ексцентрик PRO", price: "1 100 ₴", oldPrice: "1 400 ₴", discount: "-21%", image: "images/4.png", rating: 5, category: "handles", popular: true, description: "Ексцентрична ручка для сили пальців." },
    { id: 5, name: "Ручка Циліндр", price: "950 ₴", oldPrice: "1 200 ₴", discount: "-21%", image: "images/4.png", rating: 4, category: "handles", description: "Класичний циліндр для тренувань." },
    { id: 6, name: "Ручка Куля 80мм", price: "1 300 ₴", oldPrice: "1 600 ₴", discount: "-19%", image: "images/4.png", rating: 5, category: "handles", description: "Куляста ручка для розвитку кисті." },
    { id: 7, name: "Ручка Т-подібна", price: "1 050 ₴", oldPrice: "1 300 ₴", discount: "-19%", image: "images/4.png", rating: 4, category: "handles", description: "Для специфічних вправ армрестлінгу." },
    { id: 8, name: "Універсальна ручка", price: "1 150 ₴", oldPrice: "1 450 ₴", discount: "-21%", image: "images/4.png", rating: 5, category: "handles", description: "Підходить для більшості вправ." },

    // СЕТИ (8 товарів)
    { id: 9, name: "Сет 'Старт'", price: "2 500 ₴", oldPrice: "3 200 ₴", discount: "-22%", image: "images/3.png", rating: 5, category: "sets", popular: true, description: "Набір для початківців: 2 ручки + лямка." },
    { id: 10, name: "Сет 'Професіонал'", price: "4 800 ₴", image: "images/3.png", rating: 5, category: "sets", popular: true, description: "Повний набір ручок для залу." },
    { id: 11, name: "Набір конусів", price: "2 200 ₴", image: "images/3.png", rating: 4, category: "sets", description: "Три конуси різного розміру." },
    { id: 12, name: "Сет для дома", price: "1 900 ₴", oldPrice: "2 400 ₴", discount: "-21%", image: "images/3.png", rating: 4, category: "sets", description: "Компактний набір для домашніх тренувань." },
    { id: 13, name: "Елітний набір", price: "6 500 ₴", image: "images/3.png", rating: 5, category: "sets", popular: true, description: "Преміальний набір у фірмовому кейсі." },
    { id: 14, name: "Базовий сет ручок", price: "1 700 ₴", image: "images/3.png", rating: 4, category: "sets", description: "Дві базові ручки за вигідною ціною." },
    { id: 15, name: "Сет 'Сила кисті'", price: "3 100 ₴", image: "images/3.png", rating: 5, category: "sets", popular: true, description: "Спеціалізований набір для кисті." },
    { id: 16, name: "Подарунковий сет", price: "2 800 ₴", image: "images/3.png", rating: 5, category: "sets", description: "Найкращий вибір для подарунка армрестлеру." },

    // БЛОКИ (8 товарів)
    { id: 17, name: "Блок одинарний", price: "3 200 ₴", oldPrice: "4 000 ₴", discount: "-20%", image: "images/2.png", rating: 5, category: "blocks", popular: true, description: "Стандартний блок для кріплення ваги." },
    { id: 18, name: "Блок подвійний", price: "5 500 ₴", image: "images/2.png", rating: 5, category: "blocks", popular: true, description: "Посилений подвійний блок." },
    { id: 19, name: "Блок Атлант", price: "4 200 ₴", image: "images/2.png", rating: 5, category: "blocks", popular: true, description: "Міцний блок для екстремальних навантажень." },
    { id: 20, name: "Компактний блок", price: "2 100 ₴", image: "images/2.png", rating: 4, category: "blocks", description: "Для тренувань поза залом." },
    { id: 21, name: "Блок настінний", price: "7 800 ₴", image: "images/2.png", rating: 5, category: "blocks", description: "Для стаціонарного кріплення до стіни." },
    { id: 22, name: "Блок з карабіном", price: "3 400 ₴", image: "images/2.png", rating: 4, category: "blocks", description: "Швидка зміна насадок." },
    { id: 23, name: "Професійна система", price: "9 500 ₴", image: "images/2.png", rating: 5, category: "blocks", popular: true, description: "Повна блочна станція." },
    { id: 24, name: "Блок Лайт", price: "2 600 ₴", oldPrice: "3 100 ₴", discount: "-16%", image: "images/2.png", rating: 4, category: "blocks", description: "Полегшена версія для початківців." },

    // СТОЛИ (8 товарів)
    { id: 25, name: "Стіл Hobbyt Класік", price: "12 000 ₴", image: "images/1.png", rating: 5, category: "tables", popular: true, description: "Професійний розбірний стіл." },
    { id: 26, name: "Стіл Тренувальний", price: "9 500 ₴", image: "images/1.png", rating: 4, category: "tables", description: "Для залів та домашнього використання." },
    { id: 27, name: "Стіл Компакт", price: "7 200 ₴", image: "images/1.png", rating: 4, category: "tables", description: "Легкий та зручний для транспортування." },
    { id: 28, name: "Стіл PRO Elite", price: "18 500 ₴", image: "images/1.png", rating: 5, category: "tables", description: "Найкраща модель для чемпіонатів." },
    { id: 29, name: "Подушки (комплект)", price: "2 100 ₴", image: "images/1.png", rating: 5, category: "tables", description: "Запасні подушки для столу." },
    { id: 30, name: "Рама для столу", price: "5 400 ₴", image: "images/1.png", rating: 4, category: "tables", description: "Міцна сталева рама." },
    { id: 31, name: "Стіл Дитячий", price: "5 800 ₴", image: "images/1.png", rating: 5, category: "tables", description: "Для юних армрестлерів." },
    { id: 32, name: "Чохол для столу", price: "1 200 ₴", image: "images/1.png", rating: 4, category: "tables", description: "Захист при перевезенні." }
];

const bannerData = {
    slides: [
        {
            image: "images/golovnyj baner.png",
            title: "Потужний хват – твоя перевага",
            text: "Розвивай силу пальців, кистей та передпліч за допомогою професійних ручок."
        },
        {
            image: "images/golovnyj baner 1.png",
            title: "Міцні та надійні матеріали",
            text: "3D-друк з високоякісного пластику витримує інтенсивні навантаження."
        },
        {
            image: "images/golovnyj baner 3.png",
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
