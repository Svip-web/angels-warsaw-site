(function () {
  "use strict";

  const supported = ["ru", "pl", "en"];
  const textOriginals = new WeakMap();
  const attributeOriginals = new WeakMap();

  const copy = {
    "Меню": { pl: "Menu", en: "Menu" },
    "Бронь": { pl: "Rezerwuj", en: "Book" },
    "Забронировать": { pl: "Zarezerwuj", en: "Book now" },
    "Забронировать стол": { pl: "Zarezerwuj stolik", en: "Book a table" },
    "Забронировать вечер": { pl: "Zarezerwuj wieczór", en: "Book your evening" },
    "Открыть меню": { pl: "Zobacz menu", en: "View menu" },
    "Смотреть меню": { pl: "Zobacz menu", en: "View menu" },
    "На главную": { pl: "Strona główna", en: "Home" },
    "Наверх": { pl: "Do góry", en: "Back to top" },
    "Язык": { pl: "Język", en: "Language" },
    "Разделы сайта": { pl: "Sekcje strony", en: "Site sections" },
    "Манифест": { pl: "Manifest", en: "Manifesto" },
    "Что отличает Angels": { pl: "Co wyróżnia Angel's", en: "What makes Angel's different" },
    "Что отличает": { pl: "Co wyróżnia", en: "What makes" },
    "Ночи в Angel's": { pl: "Noce w Angel's", en: "Nights at Angel's" },
    "Ночи": { pl: "Noce", en: "Nights" },
    "в Angel's": { pl: "w Angel's", en: "at Angel's" },
    "Мероприятия": { pl: "Wydarzenia", en: "Events" },
    "мероприятия": { pl: "wydarzenia", en: "events" },
    "Частные мероприятия": { pl: "Wydarzenia prywatne", en: "Private events" },
    "Частные": { pl: "Prywatne", en: "Private" },
    "Впечатления": { pl: "Wrażenia", en: "Impressions" },
    "Контакты": { pl: "Kontakt", en: "Contact" },
    "Бар": { pl: "Bar", en: "Bar" },
    "Кухня": { pl: "Kuchnia", en: "Kitchen" },
    "Кальяны": { pl: "Shisha", en: "Hookah" },
    "Max Royal и Wookah": { pl: "Max Royal i Wookah", en: "Max Royal and Wookah" },
    "Авторские коктейли, вина, крепкие и безалкогольные напитки, кофе и чай.": { pl: "Autorskie koktajle, wina, mocne alkohole, napoje bezalkoholowe, kawa i herbata.", en: "Signature cocktails, wines, spirits, alcohol-free drinks, coffee and tea." },
    "От классических до эксклюзивных кальянов.": { pl: "Od klasycznej shishy po ekskluzywne modele.", en: "From classic to exclusive hookahs." },
    "Меню Angel's Варшава: бар, кухня и кальяны.": { pl: "Menu Angel's Warszawa: bar, kuchnia i shisha.", en: "Angel's Warsaw menu: bar, kitchen and hookah." },
    "Меню Angel's — бар, кухня и кальяны": { pl: "Menu Angel's — bar, kuchnia i shisha", en: "Angel's menu — bar, kitchen and hookah" },
    "Авторские коктейли, кухня и кальяны Angel's в Варшаве.": { pl: "Autorskie koktajle, kuchnia i shisha w Angel's w Warszawie.", en: "Signature cocktails, food and hookah at Angel's in Warsaw." },
    "Без алкоголя": { pl: "Bez alkoholu", en: "Alcohol-free" },
    "Безалкогольные напитки": { pl: "Napoje bezalkoholowe", en: "Non-alcoholic drinks" },
    "Безалкогольные коктейли": { pl: "Koktajle bezalkoholowe", en: "Alcohol-free cocktails" },
    "Фото скоро": { pl: "Zdjęcie wkrótce", en: "Photo coming soon" },
    "Angel's · Варшава": { pl: "Angel's · Warszawa", en: "Angel's · Warsaw" },
    "Angel's Варшава": { pl: "Angel's Warszawa", en: "Angel's Warsaw" },
    "Angel's — Варшава": { pl: "Angel's — Warszawa", en: "Angel's — Warsaw" },
    "© 2026 Angel's Варшава": { pl: "© 2026 Angel's Warszawa", en: "© 2026 Angel's Warsaw" },
    "Żurawia 6/12, Варшава": { pl: "Żurawia 6/12, Warszawa", en: "Żurawia 6/12, Warsaw" },
    "Żurawia 6/12 · Варшава": { pl: "Żurawia 6/12 · Warszawa", en: "Żurawia 6/12 · Warsaw" },
    "Żurawia 6/12, Варшава, Польша": { pl: "Żurawia 6/12, Warszawa, Polska", en: "Żurawia 6/12, Warsaw, Poland" },
    "Варшава, Польша": { pl: "Warszawa, Polska", en: "Warsaw, Poland" },
    "Здесь ночь": { pl: "Tutaj noc", en: "This is where the night" },
    "проживают": { pl: "się przeżywa", en: "comes alive" },
    "Место, где можно": { pl: "Miejsce, w którym możesz", en: "A place where you can" },
    "быть собой": { pl: "być sobą", en: "be yourself" },
    ". Петь, даже если не умеешь. Смеяться громко.": { pl: ". Śpiewać, nawet jeśli nie umiesz. Śmiać się głośno.", en: ". Sing, even if you cannot. Laugh out loud." },
    "Знакомиться легко. И чувствовать, что": { pl: "Łatwo poznawać ludzi. I czuć, że", en: "Meet people easily. And feel that" },
    "между людьми снова что-то происходит.": { pl: "między ludźmi znów coś się dzieje.", en: "something is happening between people again." },
    "Рейтинг Google 4,9": { pl: "Ocena Google 4,9", en: "Google rating 4.9" },
    "Профессиональное караоке": { pl: "Profesjonalne karaoke", en: "Professional karaoke" },
    "Лаунж и коктейль-бар": { pl: "Lounge i cocktail bar", en: "Lounge & cocktail bar" },
    "Здесь не нужно": { pl: "Tutaj nie musisz", en: "You do not have to" },
    "притворяться": { pl: "udawać", en: "pretend here" },
    ": петь даже без идеального голоса, смеяться от души, легко знакомиться с новыми людьми и проживать": { pl: ": śpiewać bez idealnego głosu, śmiać się szczerze, poznawać nowych ludzi i przeżywać", en: ": sing without a perfect voice, laugh freely, meet new people and live through" },
    "вечера, которые превращаются в истории.": { pl: "wieczory, które zmieniają się w historie.", en: "evenings that become stories." },
    "Авторские коктейли, шампанское и крепкий алкоголь — карта для тех, кто разбирается.": { pl: "Autorskie koktajle, szampan i mocne alkohole — karta dla tych, którzy wiedzą, czego chcą.", en: "Signature cocktails, champagne and spirits — a menu for those who know their drinks." },
    "Закуски, суши и основные блюда от шефа.": { pl: "Przystawki, sushi i dania główne od szefa kuchni.", en: "Starters, sushi and main courses by our chef." },
    "Лимонады, кофе, чай — для тех, кто выбирает ясность ума.": { pl: "Lemoniady, kawa i herbata — dla tych, którzy wybierają jasność umysłu.", en: "Lemonades, coffee and tea — for those who choose a clear head." },
    "Главная сцена —": { pl: "Główna scena —", en: "The main stage —" },
    "ваша": { pl: "jest Twoja", en: "is yours" },
    "Караоке, тёплый свет и вечер, который не требует репетиции.": { pl: "Karaoke, ciepłe światło i wieczór, który nie wymaga prób.", en: "Karaoke, warm light and an evening that needs no rehearsal." },
    "Пойте, даже если не умеете": { pl: "Śpiewaj, nawet jeśli nie umiesz", en: "Sing, even if you cannot" },
    "— здесь это часть ночи.": { pl: "— tutaj to część nocy.", en: "— here, that is part of the night." },
    "Сцена": { pl: "Scena", en: "Stage" },
    "Музыка": { pl: "Muzyka", en: "Music" },
    "Сервис": { pl: "Serwis", en: "Service" },
    "Приватность": { pl: "Prywatność", en: "Privacy" },
    "Профессиональный звук и свет — сцена, на которой хочется быть услышанным.": { pl: "Profesjonalny dźwięk i światło — scena, na której chce się być usłyszanym.", en: "Professional sound and lighting — a stage where you want to be heard." },
    "От ностальгии до момента здесь и сейчас — играет то, что просите Вы.": { pl: "Od nostalgii po tu i teraz — gramy to, o co prosisz.", en: "From nostalgia to the here and now — we play what you ask for." },
    "Персонал, который угадывает, что нужно, раньше, чем Вы попросите.": { pl: "Obsługa, która wie, czego potrzebujesz, zanim o to poprosisz.", en: "A team that knows what you need before you ask." },
    "Закрытая зона для тех, кто не хочет делить вечер со всеми.": { pl: "Prywatna strefa dla tych, którzy nie chcą dzielić wieczoru ze wszystkimi.", en: "A private area for those who do not want to share the evening with everyone." },
    "Особенные вечера": { pl: "Wyjątkowe wieczory", en: "Special evenings" },
    "Каждый вторник": { pl: "W każdy wtorek", en: "Every Tuesday" },
    "Каждый четверг": { pl: "W każdy czwartek", en: "Every Thursday" },
    "Вечер, когда всё внимание принадлежит девушкам. Стол без депозита, безлимитное игристое до 00:00, комплимент от шефа и караоке всю ночь.": { pl: "Wieczór, podczas którego cała uwaga należy do kobiet. Stolik bez depozytu, nielimitowane wino musujące do 00:00, prezent od szefa kuchni i karaoke przez całą noc.", en: "An evening when all attention belongs to the ladies. No table deposit, unlimited sparkling wine until midnight, a chef's treat and karaoke all night." },
    "Хороший вечер начинается с правильного коктейля. Каждый четверг для девушек действует предложение 1+1 на Pornstar Martini, Margarita и Clover Club.": { pl: "Dobry wieczór zaczyna się od właściwego koktajlu. W każdy czwartek panie otrzymują ofertę 1+1 na Pornstar Martini, Margaritę i Clover Club.", en: "A great evening starts with the right cocktail. Every Thursday, ladies enjoy a 1+1 offer on Pornstar Martini, Margarita and Clover Club." },
    "Дни рождения": { pl: "Urodziny", en: "Birthdays" },
    "Корпоративы": { pl: "Imprezy firmowe", en: "Corporate events" },
    "Закрытые вечеринки": { pl: "Prywatne przyjęcia", en: "Private parties" },
    "Дни рождения, корпоративы и закрытые вечеринки — соберём формат вечера под вашу компанию.": { pl: "Urodziny, imprezy firmowe i prywatne przyjęcia — dopasujemy format wieczoru do Twojej grupy.", en: "Birthdays, corporate events and private parties — we will tailor the evening to your group." },
    "Праздничный вечер с музыкой, караоке и вниманием к каждой детали. Поможем подобрать формат, который подойдёт именно вашей компании и настроению праздника.": { pl: "Wieczór z muzyką, karaoke i dbałością o każdy szczegół. Pomożemy wybrać format odpowiedni dla Twojej grupy i nastroju świętowania.", en: "A celebration with music, karaoke and attention to every detail. We will help choose the right format for your group and mood." },
    "Вечер для команды с отдельной программой, подходящим меню и атмосферой без офисной формальности. Пространство легко адаптируется под небольшой коллектив или большую компанию.": { pl: "Wieczór dla zespołu z osobnym programem, odpowiednim menu i atmosferą bez biurowej formalności. Przestrzeń łatwo dopasować do małej lub dużej grupy.", en: "A team evening with a dedicated programme, the right menu and none of the office formality. The space adapts easily to small or large groups." },
    "Приватное пространство для вечера только с вашими гостями. Вы отдыхаете в своём кругу, а команда Angel’s поддерживает ритм и атмосферу на протяжении всей ночи.": { pl: "Prywatna przestrzeń tylko dla Twoich gości. Ty bawisz się w swoim gronie, a zespół Angel's dba o rytm i atmosferę przez całą noc.", en: "A private space just for your guests. Relax with your circle while the Angel's team keeps the rhythm and atmosphere going all night." },
    "наших гостей": { pl: "naszych gości", en: "of our guests" },
    "Бронирование": { pl: "Rezerwacja", en: "Booking" },
    "Ваш вечер": { pl: "Twój wieczór", en: "Your evening" },
    "начинается здесь": { pl: "zaczyna się tutaj", en: "starts here" },
    "Забронируйте стол — музыку, свет и настроение вечера мы возьмём на себя.": { pl: "Zarezerwuj stolik — muzyką, światłem i nastrojem wieczoru zajmiemy się my.", en: "Book a table — we will take care of the music, lights and mood." },
    "Проложить маршрут": { pl: "Wyznacz trasę", en: "Get directions" },
    "Ежедневно": { pl: "Codziennie", en: "Daily" },
    "ежедневно": { pl: "codziennie", en: "daily" },
    "График работы": { pl: "Godziny otwarcia", en: "Opening hours" },
    "Адрес": { pl: "Adres", en: "Address" },
    "Онлайн": { pl: "Online", en: "Online" },
    "Оставьте заявку — мы свяжемся с вами.": { pl: "Zostaw zgłoszenie — skontaktujemy się z Tobą.", en: "Leave a request — we will contact you." },
    "Дата": { pl: "Data", en: "Date" },
    "Время": { pl: "Godzina", en: "Time" },
    "Выберите": { pl: "Wybierz", en: "Select" },
    "Количество гостей": { pl: "Liczba gości", en: "Number of guests" },
    "Ваше имя": { pl: "Imię", en: "Your name" },
    "Номер телефона": { pl: "Numer telefonu", en: "Phone number" },
    "Комментарий": { pl: "Komentarz", en: "Comment" },
    "необязательно": { pl: "opcjonalnie", en: "optional" },
    "Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.": { pl: "Klikając przycisk, zgadzasz się na przetwarzanie danych w celu kontaktu w sprawie zgłoszenia.", en: "By clicking the button, you agree to data processing so we can contact you about your request." },
    "Отправить заявку": { pl: "Wyślij zgłoszenie", en: "Send request" },
    "Меню — Angel's Варшава": { pl: "Menu — Angel's Warszawa", en: "Menu — Angel's Warsaw" },
    "Авторские коктейли, шампанское, вино и крепкий алкоголь. Все позиции и цены — из актуальной карты Angel's.": { pl: "Autorskie koktajle, szampan, wino i mocne alkohole. Wszystkie pozycje i ceny pochodzą z aktualnej karty Angel's.", en: "Signature cocktails, champagne, wine and spirits. All items and prices are from the current Angel's menu." },
    "Устрицы, закуски, салаты, супы, суши и десерты. Все позиции и цены — из актуального меню Angel's.": { pl: "Ostrygi, przystawki, sałatki, zupy, sushi i desery. Wszystkie pozycje i ceny pochodzą z aktualnego menu Angel's.", en: "Oysters, starters, salads, soups, sushi and desserts. All items and prices are from the current Angel's menu." },
    "Безалкогольные коктейли, лимонады, фреши, вода, кофе и чай.": { pl: "Koktajle bezalkoholowe, lemoniady, świeże soki, woda, kawa i herbata.", en: "Non-alcoholic cocktails, lemonades, fresh juices, water, coffee and tea." },
    "Для просмотра полного меню включите JavaScript.": { pl: "Włącz JavaScript, aby zobaczyć pełne menu.", en: "Enable JavaScript to view the full menu." },
    "Устрицы": { pl: "Ostrygi", en: "Oysters" },
    "Закуски": { pl: "Przystawki", en: "Starters" },
    "Салаты": { pl: "Sałatki", en: "Salads" },
    "Супы": { pl: "Zupy", en: "Soups" },
    "Суши": { pl: "Sushi", en: "Sushi" },
    "Десерты": { pl: "Desery", en: "Desserts" },
    "Коктейли": { pl: "Koktajle", en: "Cocktails" },
    "Авторские коктейли Angel's": { pl: "Autorskie koktajle Angel's", en: "Angel's signature cocktails" },
    "Классические коктейли": { pl: "Klasyczne koktajle", en: "Classic cocktails" },
    "Шампанское и игристое": { pl: "Szampan i wina musujące", en: "Champagne & sparkling" },
    "Игристое вино": { pl: "Wino musujące", en: "Sparkling wine" },
    "Вино": { pl: "Wino", en: "Wine" },
    "Белое вино": { pl: "Białe wino", en: "White wine" },
    "Красное вино": { pl: "Czerwone wino", en: "Red wine" },
    "Крепкий алкоголь": { pl: "Mocne alkohole", en: "Spirits" },
    "Вермуты и ликёры": { pl: "Wermuty i likiery", en: "Vermouths & liqueurs" },
    "Пиво": { pl: "Piwo", en: "Beer" },
    "Кофе и чай": { pl: "Kawa i herbata", en: "Coffee & tea" },
    "Кофе": { pl: "Kawa", en: "Coffee" },
    "Вода": { pl: "Woda", en: "Water" },
    "Лимонады": { pl: "Lemoniady", en: "Lemonades" },
    "Фреши · 0,25 л": { pl: "Świeże soki · 0,25 l", en: "Fresh juices · 0.25 l" },
    "бокал": { pl: "kieliszek", en: "glass" },
    "Gillardeau Oysters No. 2 — 1 pc": { ru: "Устрицы Gillardeau № 2 — 1 шт.", pl: "Ostrygi Gillardeau nr 2 — 1 szt." },
    "Gillardeau Oysters No. 2 — 6 pcs": { ru: "Устрицы Gillardeau № 2 — 6 шт.", pl: "Ostrygi Gillardeau nr 2 — 6 szt." },
    "Gillardeau Oysters No. 2 — 12 pcs": { ru: "Устрицы Gillardeau № 2 — 12 шт.", pl: "Ostrygi Gillardeau nr 2 — 12 szt." },
    "Tempura Shrimp": { ru: "Креветки в темпуре", pl: "Krewetki w tempurze" },
    "Fruit & Berry Platter": { ru: "Фруктово-ягодное ассорти", pl: "Patera owocowo-jagodowa" },
    "Antipasti": { ru: "Антипасти", pl: "Antipasti" },
    "Red Caviar (per 100 g)": { ru: "Красная икра (за 100 г)", pl: "Kawior czerwony (za 100 g)" },
    "Black Caviar (per 100 g)": { ru: "Чёрная икра (за 100 г)", pl: "Kawior czarny (za 100 g)" },
    "Caesar Salad with Chicken & Crispy Bacon": { ru: "Салат «Цезарь» с курицей и хрустящим беконом", pl: "Sałatka Cezar z kurczakiem i chrupiącym boczkiem" },
    "Caesar Salad with Shrimp & Crispy Bacon": { ru: "Салат «Цезарь» с креветками и хрустящим беконом", pl: "Sałatka Cezar z krewetkami i chrupiącym boczkiem" },
    "Borscht with Beef Cheeks": { ru: "Борщ с говяжьими щёчками", pl: "Barszcz z policzkami wołowymi" },
    "Chicken Broth with Turkey": { ru: "Куриный бульон с индейкой", pl: "Rosół drobiowy z indykiem" },
    "Philadelphia Grand Roll": { ru: "Ролл «Филадельфия Гранд»", pl: "Philadelphia Grand Roll" },
    "Philadelphia with Mango": { ru: "Филадельфия с манго", pl: "Philadelphia z mango" },
    "Philadelphia with Eel": { ru: "Филадельфия с угрём", pl: "Philadelphia z węgorzem" },
    "Volcano Roll": { ru: "Ролл «Вулкан»", pl: "Volcano Roll" },
    "Tiger Roll": { ru: "Ролл «Тигр»", pl: "Tiger Roll" },
    "California Roll": { ru: "Ролл «Калифорния»", pl: "California Roll" },
    "Ebi Tempura Roll": { ru: "Ролл «Эби темпура»", pl: "Ebi Tempura Roll" },
    "Bonito Roll": { ru: "Ролл «Бонито»", pl: "Bonito Roll" },
    "Brownie with Ice Cream": { ru: "Брауни с мороженым", pl: "Brownie z lodami" },
    "Honey Cake": { ru: "Медовик", pl: "Miodownik" },
    "Strudel": { ru: "Штрудель", pl: "Strudel" },
    "Pineapple & Mint": { ru: "Ананас и мята", pl: "Ananas i mięta" },
    "Kiwi & Basil": { ru: "Киви и базилик", pl: "Kiwi i bazylia" },
    "Raspberry": { ru: "Малина", pl: "Malina" },
    "Fresh Grapefruit": { ru: "Грейпфрутовый фреш", pl: "Świeży sok grejpfrutowy" },
    "Fresh Orange": { ru: "Апельсиновый фреш", pl: "Świeży sok pomarańczowy" },
    "Cappy Apple": { ru: "Cappy яблочный", pl: "Cappy jabłkowy" },
    "Cappy Orange": { ru: "Cappy апельсиновый", pl: "Cappy pomarańczowy" },
    "Americano": { ru: "Американо", pl: "Americano" },
    "Cappuccino": { ru: "Капучино", pl: "Cappuccino" },
    "Cappuccino — plant milk": { ru: "Капучино на растительном молоке", pl: "Cappuccino z napojem roślinnym" },
    "Double Espresso": { ru: "Двойной эспрессо", pl: "Podwójne espresso" },
    "Espresso": { ru: "Эспрессо", pl: "Espresso" },
    "Flat White": { ru: "Флэт уайт", pl: "Flat White" },
    "Flat White — plant milk": { ru: "Флэт уайт на растительном молоке", pl: "Flat White z napojem roślinnym" },
    "Latte": { ru: "Латте", pl: "Latte" },
    "Latte — plant milk": { ru: "Латте на растительном молоке", pl: "Latte z napojem roślinnym" },
    "Classic Tea": { ru: "Классический чай", pl: "Herbata klasyczna" },
    "Jasmine, Kiwi & Pineapple": { ru: "Жасмин, киви и ананас", pl: "Jaśmin, kiwi i ananas" },
    "Lychee & Strawberry": { ru: "Личи и клубника", pl: "Liczi i truskawka" },
    "Passion Fruit & Peach": { ru: "Маракуйя и персик", pl: "Marakuja i brzoskwinia" },
    "Шампанское": { pl: "Szampan", en: "Champagne" },
    "Портвейн и херес": { pl: "Porto i sherry", en: "Port & sherry" },
    "Водка": { pl: "Wódka", en: "Vodka" },
    "Джин": { pl: "Gin", en: "Gin" },
    "Ром": { pl: "Rum", en: "Rum" },
    "Текила и мескаль": { pl: "Tequila i mezcal", en: "Tequila & mezcal" },
    "Шотландский виски": { pl: "Szkocka whisky", en: "Scotch whisky" },
    "Ирландский виски": { pl: "Irlandzka whiskey", en: "Irish whiskey" },
    "Американский виски": { pl: "Amerykańska whiskey", en: "American whiskey" },
    "Японский виски": { pl: "Japońska whisky", en: "Japanese whisky" },
    "Коньяк": { pl: "Koniak", en: "Cognac" },
    "Вермуты 80 мл / ликёры 40 мл": { pl: "Wermuty 80 ml / likiery 40 ml", en: "Vermouth 80 ml / liqueurs 40 ml" },
    "Фреши": { pl: "Świeże soki", en: "Fresh juices" },
    "Прохладительные напитки": { pl: "Napoje gazowane i soki", en: "Soft drinks" },
    "Чай": { pl: "Herbata", en: "Tea" },
    "40 мл": { pl: "40 ml", en: "40 ml" },
    "По предварительному заказу наш шеф создаст персональное меню по вашему запросу.": { pl: "Na wcześniejsze zamówienie szef kuchni przygotuje dla Ciebie indywidualne menu.", en: "Our chef can prepare a custom menu on request when ordered in advance." },
    "бутылка": { pl: "butelka", en: "bottle" },
    "бутылка 0,7 л": { pl: "butelka 0,7 l", en: "0.7 l bottle" }
  };

  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const translate = (value, lang) => {
    const key = normalize(value);
    if (!key) return value;
    if (copy[key]?.[lang]) return copy[key][lang];
    if (lang === "ru") return value;
    const count = key.match(/^(\d+)\s+поз\.$/);
    if (count) return lang === "pl" ? `${count[1]} poz.` : `${count[1]} items`;
    return value;
  };

  const currentFromUrl = new URLSearchParams(location.search).get("lang");
  let current = supported.includes(currentFromUrl)
    ? currentFromUrl
    : supported.includes(localStorage.getItem("angels-language"))
      ? localStorage.getItem("angels-language")
      : "ru";

  function translateTextNode(node) {
    if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
    const original = textOriginals.get(node);
    const trimmed = normalize(original);
    if (!trimmed) return;
    const translated = translate(trimmed, current);
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leading}${translated}${trailing}`;
  }

  function translateAttributes(element) {
    const names = ["aria-label", "title", "placeholder", "content"];
    if (!attributeOriginals.has(element)) attributeOriginals.set(element, new Map());
    const originals = attributeOriginals.get(element);
    names.forEach((name) => {
      if (!element.hasAttribute(name)) return;
      if (name === "content" && !element.matches('meta[name="description"], meta[property="og:title"], meta[property="og:description"]')) return;
      if (!originals.has(name)) originals.set(name, element.getAttribute(name));
      element.setAttribute(name, translate(originals.get(name), current));
    });
  }

  function apply(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTextNode);
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
    root.querySelectorAll?.("[aria-label], [title], [placeholder], meta[content]").forEach(translateAttributes);
    document.documentElement.lang = current;
    document.body.dataset.lang = current;
    document.querySelectorAll('[data-language-select]').forEach((select) => {
      select.value = current;
    });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      const active = button.dataset.lang === current;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setLanguage(lang) {
    if (!supported.includes(lang)) return;
    current = lang;
    localStorage.setItem("angels-language", lang);
    const url = new URL(location.href);
    if (lang === "ru") url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang);
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    apply(document);
    window.dispatchEvent(new CustomEvent("angels:languagechange", { detail: { lang } }));
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lang]");
    if (!button) return;
    setLanguage(button.dataset.lang);
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches('[data-language-select]')) setLanguage(event.target.value);
  });

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
        else if (node.nodeType === Node.ELEMENT_NODE) apply(node);
      });
    });
  });

  apply(document);
  observer.observe(document.body, { childList: true, subtree: true });

  window.ANGELS_I18N = {
    get lang() { return current; },
    t(value) { return translate(value, current); },
    apply,
    setLanguage,
  };
})();
