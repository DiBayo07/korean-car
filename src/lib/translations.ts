export type Language = 'en' | 'ru' | 'ky';

export interface TranslationDict {
  navCatalog: string;
  navAuction: string;
  navBikes: string;
  navSalvage: string;
  navServices: string;
  navAbout: string;
  navContact: string;
  navAdmin: string;
  getInTouch: string;
  heroTitle: string;
  heroSubtitle: string;
  searchBrand: string;
  searchModel: string;
  searchGeneration: string;
  selectBrand: string;
  selectModel: string;
  selectGeneration: string;
  searchBtn: string;
  statVehicles: string;
  statVehiclesSub: string;
  statCountries: string;
  statCountriesSub: string;
  statYears: string;
  statYearsSub: string;
  carsTitle: string;
  carsSubtitle: string;
  viewAll: string;
  bikesTag: string;
  bikesTitle: string;
  bikesSubtitle: string;
  contactTag: string;
  contactTitle: string;
  contactSubtitle: string;
  contactQuick: string;
  contactWhatsApp: string;
  contactViber: string;
  contactEmailBtn: string;
  contactLanguages: string;
  footerAbout: string;
  footerLinks: string;
  footerContact: string;
  available: string;
  priceConverted: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    navCatalog: 'Catalog',
    navAuction: 'Auction',
    navBikes: 'Bikes',
    navSalvage: 'Salvage',
    navServices: 'Services',
    navAbout: 'About',
    navContact: 'Contact',
    navAdmin: 'Admin Panel',
    getInTouch: 'Get in Touch',
    heroTitle: 'Your Gateway to Korean Vehicles',
    heroSubtitle: "Direct access to South Korea's premium automobiles. Sourced, inspected, and delivered to Kyrgyzstan.",
    searchBrand: 'BRAND',
    searchModel: 'MODEL',
    searchGeneration: 'GENERATION',
    selectBrand: 'Select brand',
    selectModel: 'Select model',
    selectGeneration: 'Select generation',
    searchBtn: 'Search',
    statVehicles: '500+',
    statVehiclesSub: 'Vehicles Exported',
    statCountries: '50+',
    statCountriesSub: 'Regions Covered',
    statYears: '10+',
    statYearsSub: 'Years of Trust',
    carsTitle: 'Freshly added Cars',
    carsSubtitle: 'Browse the latest vehicles available for export from Korea',
    viewAll: 'View All',
    bikesTag: 'TWO-WHEEL DEALS',
    bikesTitle: 'Newly added Bikes',
    bikesSubtitle: 'Explore the latest motorcycles available for export from Korea',
    contactTag: 'CONTACT US',
    contactTitle: 'Ready to Find Your Perfect Car?',
    contactSubtitle: 'Get in touch with our team for a personalized quote. We typically respond within 24 hours.',
    contactQuick: 'Quick Contact',
    contactWhatsApp: 'Chat on WhatsApp',
    contactViber: 'Chat on Telegram', // Viber isn't very popular in KG compared to Telegram/WhatsApp, let's keep Telegram/WhatsApp but Viber in code
    contactEmailBtn: 'Send Email',
    contactLanguages: 'Available in English, Russian, Kyrgyz, and Korean',
    footerAbout: 'Your trusted partner for exporting quality used cars from South Korea to Kyrgyzstan.',
    footerLinks: 'Quick Links',
    footerContact: 'Contact Us',
    available: 'Available',
    priceConverted: 'approx.',
  },
  ru: {
    navCatalog: 'Каталог',
    navAuction: 'Аукцион',
    navBikes: 'Мотоциклы',
    navSalvage: 'Аварийные',
    navServices: 'Услуги',
    navAbout: 'О нас',
    navContact: 'Контакты',
    navAdmin: 'Админ панель',
    getInTouch: 'Связаться',
    heroTitle: 'Ваш путь к корейским автомобилям',
    heroSubtitle: 'Прямой доступ к премиальным автомобилям Южной Кореи. Поиск, проверка и доставка в Кыргызстан.',
    searchBrand: 'МАРКА',
    searchModel: 'МОДЕЛЬ',
    searchGeneration: 'ПОКОЛЕНИЕ',
    selectBrand: 'Выберите марку',
    selectModel: 'Выберите модель',
    selectGeneration: 'Выберите поколение',
    searchBtn: 'Найти',
    statVehicles: '500+',
    statVehiclesSub: 'Экспортировано авто',
    statCountries: '50+',
    statCountriesSub: 'Регионов охвачено',
    statYears: '10+',
    statYearsSub: 'Лет доверия',
    carsTitle: 'Свежие поступления автомобилей',
    carsSubtitle: 'Ознакомьтесь с последними автомобилями для экспорта из Кореи',
    viewAll: 'Смотреть все',
    bikesTag: 'ДВУХКОЛЕСНЫЙ ТРАНСПОРТ',
    bikesTitle: 'Свежие поступления мотоциклов',
    bikesSubtitle: 'Ознакомьтесь с новыми предложениями мотоциклов из Кореи',
    contactTag: 'СВЯЗАТЬСЯ С НАМИ',
    contactTitle: 'Готовы найти идеальный автомобиль?',
    contactSubtitle: 'Свяжитесь с нашей командой для персонального расчета стоимости доставки. Ответ в течение 24 часов.',
    contactQuick: 'Быстрый контакт',
    contactWhatsApp: 'Написать в WhatsApp',
    contactViber: 'Написать в Telegram',
    contactEmailBtn: 'Отправить Email',
    contactLanguages: 'Поддержка на английском, русском, кыргызском и корейском языках',
    footerAbout: 'Ваш надежный партнер по экспорту подержанных автомобилей из Южной Кореи в Кыргызстан.',
    footerLinks: 'Быстрые ссылки',
    footerContact: 'Контакты',
    available: 'В наличии',
    priceConverted: 'примерно',
  },
  ky: {
    navCatalog: 'Каталог',
    navAuction: 'Аукцион',
    navBikes: 'Мотоциклдер',
    navSalvage: 'Авариялык',
    navServices: 'Кызматтар',
    navAbout: 'Биз жөнүндө',
    navContact: 'Байланышуу',
    navAdmin: 'Админ панель',
    getInTouch: 'Байланышуу',
    heroTitle: 'Корей унааларына болгон жолуңуз',
    heroSubtitle: 'Түштүк Кореянын премиум класстагы унааларына түз жетүү. Издөө, текшерүү жана Кыргызстанга жеткирүү.',
    searchBrand: 'МАРКА',
    searchModel: 'МОДЕЛЬ',
    searchGeneration: 'МУУН',
    selectBrand: 'Марканы тандаңыз',
    selectModel: 'Моделди тандаңыз',
    selectGeneration: 'Муунду тандаңыз',
    searchBtn: 'Издөө',
    statVehicles: '500+',
    statVehiclesSub: 'Экспорттолгон унаалар',
    statCountries: '50+',
    statCountriesSub: 'Аймактар камтылган',
    statYears: '10+',
    statYearsSub: 'Ишенимдүү жылдар',
    carsTitle: 'Жаңы кошулган автоунаалар',
    carsSubtitle: 'Кореядан экспорттоого жеткиликтүү болгон акыркы унааларды көрүңүз',
    viewAll: 'Баарын көрүү',
    bikesTag: 'ЭКИ ДӨНГӨЛӨКТҮҮ ТРАНСПОРТ',
    bikesTitle: 'Жаңы кошулган мотоциклдер',
    bikesSubtitle: 'Кореядан экспорттоого даяр болгон акыркы мотоциклдерди көрүңүз',
    contactTag: 'БИЗ МЕНЕН БАЙЛАНЫШЫҢЫЗ',
    contactTitle: 'Идеалдуу унааңызды табууга даярсызбы?',
    contactSubtitle: 'Жеткирүү баасын эсептөө үчүн биздин команда менен байланышыңыз. Биз 24 сааттын ичинде жооп беребиз.',
    contactQuick: 'Тез байланышуу',
    contactWhatsApp: 'WhatsApp аркылуу жазуу',
    contactViber: 'Telegram аркылуу жазуу',
    contactEmailBtn: 'Email жөнөтүү',
    contactLanguages: 'Англис, орус, кыргыз жана корей тилдеринде байланышуу мүмкүнчүлүгү бар',
    footerAbout: 'Южной Кореядан Кыргызстанга сапаттуу унааларды экспорттоо боюнча сиздин ишенимдүү өнөктөшүңүз.',
    footerLinks: 'Тез шилтемелер',
    footerContact: 'Байланыш маалыматы',
    available: 'Жеткиликтүү',
    priceConverted: 'болжол менен',
  }
};
