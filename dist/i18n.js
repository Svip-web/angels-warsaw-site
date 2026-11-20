(function () {
  "use strict";

  const supported = ["ru", "pl", "en", "uk"];
  const aliases = { ua: "uk" };
  const textOriginals = new WeakMap();
  const attributeOriginals = new WeakMap();

  const copy = {
    "Меню": { pl: "Menu", en: "Menu", uk: "Меню" },
    "Бронь": { pl: "Rezerwuj", en: "Book", uk: "Бронювання" },
    "Забронировать": { pl: "Zarezerwuj", en: "Book now", uk: "Забронювати" },
    "Забронировать стол": { pl: "Zarezerwuj stolik", en: "Book a table", uk: "Забронювати столик" },
    "Забронировать вечер": { pl: "Zarezerwuj wieczór", en: "Book your evening", uk: "Забронювати вечір" },
    "Открыть меню": { pl: "Zobacz menu", en: "View menu", uk: "Відкрити меню" },
    "Смотреть меню": { pl: "Zobacz menu", en: "View menu", uk: "Переглянути меню" },
    "На главную": { pl: "Strona główna", en: "Home", uk: "На головну" },
    "Наверх": { pl: "Do góry", en: "Back to top", uk: "Нагору" },
    "Язык": { pl: "Język", en: "Language", uk: "Мова" },
    "Разделы сайта": { pl: "Sekcje strony", en: "Site sections", uk: "Розділи сайту" },
    "Манифест": { pl: "Manifest", en: "Manifesto", uk: "Маніфест" },
    "Что отличает Angels": { pl: "Co wyróżnia Angel's", en: "What makes Angel's different", uk: "Що вирізняє Angel's" },
    "Что отличает": { pl: "Co wyróżnia", en: "What makes", uk: "Що вирізняє" },
    "Ночи в Angel's": { pl: "Noce w Angel's", en: "Nights at Angel's", uk: "Ночі в Angel's" },
    "Ночи": { pl: "Noce", en: "Nights", uk: "Ночі" },
    "в Angel's": { pl: "w Angel's", en: "at Angel's", uk: "в Angel's" },
    "Мероприятия": { pl: "Wydarzenia", en: "Events", uk: "Події" },
    "мероприятия": { pl: "wydarzenia", en: "events", uk: "заходи" },
    "Частные мероприятия": { pl: "Wydarzenia prywatne", en: "Private events", uk: "Приватні заходи" },
    "Частные": { pl: "Prywatne", en: "Private", uk: "Приватні" },
    "Впечатления": { pl: "Wrażenia", en: "Impressions", uk: "Враження" },
    "Контакты": { pl: "Kontakt", en: "Contact", uk: "Контакти" },
    "Бар": { pl: "Bar", en: "Bar", uk: "Бар" },
    "Кухня": { pl: "Kuchnia", en: "Kitchen", uk: "Кухня" },
    "Кальяны": { pl: "Shisha", en: "Hookah", uk: "Кальяни" },
    "Max Royal и Wookah": { pl: "Max Royal i Wookah", en: "Max Royal and Wookah", uk: "Max Royal і Wookah" },
    "Авторские коктейли, вина, крепкие и безалкогольные напитки, кофе и чай.": { pl: "Autorskie koktajle, wina, mocne alkohole, napoje bezalkoholowe, kawa i herbata.", en: "Signature cocktails, wines, spirits, alcohol-free drinks, coffee and tea.", uk: "Авторські коктейлі, вина, міцні та безалкогольні напої, кава й чай." },
    "От классических до эксклюзивных кальянов.": { pl: "Od klasycznej shishy po ekskluzywne modele.", en: "From classic to exclusive hookahs.", uk: "Від класичних до ексклюзивних кальянів." },
    "Меню Angel's Варшава: бар, кухня и кальяны.": { pl: "Menu Angel's Warszawa: bar, kuchnia i shisha.", en: "Angel's Warsaw menu: bar, kitchen and hookah.", uk: "Меню Angel's Варшава: бар, кухня та кальяни." },
    "Меню Angel's — бар, кухня и кальяны": { pl: "Menu Angel's — bar, kuchnia i shisha", en: "Angel's menu — bar, kitchen and hookah", uk: "Меню Angel's — бар, кухня та кальяни" },
    "Авторские коктейли, кухня и кальяны Angel's в Варшаве.": { pl: "Autorskie koktajle, kuchnia i shisha w Angel's w Warszawie.", en: "Signature cocktails, food and hookah at Angel's in Warsaw.", uk: "Авторські коктейлі, кухня та кальяни Angel's у Варшаві." },
    "Без алкоголя": { pl: "Bez alkoholu", en: "Alcohol-free", uk: "Безалкогольне" },
    "Безалкогольные напитки": { pl: "Napoje bezalkoholowe", en: "Non-alcoholic drinks", uk: "Безалкогольні напої" },
    "Безалкогольные коктейли": { pl: "Koktajle bezalkoholowe", en: "Alcohol-free cocktails", uk: "Безалкогольні коктейлі" },
    "Фото скоро": { pl: "Zdjęcie wkrótce", en: "Photo coming soon", uk: "Фото незабаром" },
    "Angel's · Варшава": { pl: "Angel's · Warszawa", en: "Angel's · Warsaw", uk: "Angel's · Варшава" },
    "Angel's Варшава": { pl: "Angel's Warszawa", en: "Angel's Warsaw", uk: "Angel's Варшава" },
    "Angel's — Варшава": { pl: "Angel's — Warszawa", en: "Angel's — Warsaw", uk: "Angel's — Варшава" },
    "© 2026 Angel's Варшава": { pl: "© 2026 Angel's Warszawa", en: "© 2026 Angel's Warsaw", uk: "© 2026 Angel's Варшава" },
    "Żurawia 6/12, Варшава": { pl: "Żurawia 6/12, Warszawa", en: "Żurawia 6/12, Warsaw", uk: "Żurawia 6/12, Варшава" },
    "Żurawia 6/12 · Варшава": { pl: "Żurawia 6/12 · Warszawa", en: "Żurawia 6/12 · Warsaw", uk: "Żurawia 6/12 · Варшава" },
    "Żurawia 6/12, Варшава, Польша": { pl: "Żurawia 6/12, Warszawa, Polska", en: "Żurawia 6/12, Warsaw, Poland", uk: "Żurawia 6/12, Варшава, Польща" },
    "Варшава, Польша": { pl: "Warszawa, Polska", en: "Warsaw, Poland", uk: "Варшава, Польща" },
    "Здесь ночь": { pl: "Tutaj noc", en: "This is where the night", uk: "Тут ніч" },
    "проживают": { pl: "się przeżywa", en: "comes alive", uk: "оживає" },
    "Место, где можно": { pl: "Miejsce, w którym możesz", en: "A place where you can", uk: "Місце, де можна" },
    "быть собой": { pl: "być sobą", en: "be yourself", uk: "бути собою" },
    ". Петь, даже если не умеешь. Смеяться громко.": { pl: ". Śpiewać, nawet jeśli nie umiesz. Śmiać się głośno.", en: ". Sing, even if you cannot. Laugh out loud.", uk: ". Співати, навіть якщо не вмієш. Сміятися вголос." },
    "Знакомиться легко. И чувствовать, что": { pl: "Łatwo poznawać ludzi. I czuć, że", en: "Meet people easily. And feel that", uk: "Легко знайомитися. І відчувати, що" },
    "между людьми снова что-то происходит.": { pl: "między ludźmi znów coś się dzieje.", en: "something is happening between people again.", uk: "між людьми знову щось відбувається." },
    "Рейтинг Google 4,9": { pl: "Ocena Google 4,9", en: "Google rating 4.9", uk: "Рейтинг Google 4,9" },
    "Профессиональное караоке": { pl: "Profesjonalne karaoke", en: "Professional karaoke", uk: "Професійне караоке" },
    "Лаунж и коктейль-бар": { pl: "Lounge i cocktail bar", en: "Lounge & cocktail bar", uk: "Лаунж і коктейль-бар" },
    "Здесь не нужно": { pl: "Tutaj nie musisz", en: "You do not have to", uk: "Тут не треба" },
    "притворяться": { pl: "udawać", en: "pretend here", uk: "прикидатися" },
    ": петь даже без идеального голоса, смеяться от души, легко знакомиться с новыми людьми и проживать": { pl: ": śpiewać bez idealnego głosu, śmiać się szczerze, poznawać nowych ludzi i przeżywać", en: ": sing without a perfect voice, laugh freely, meet new people and live through", uk: ": співати навіть без ідеального голосу, щиро сміятися, легко знайомитися з новими людьми та проживати" },
    "вечера, которые превращаются в истории.": { pl: "wieczory, które zmieniają się w historie.", en: "evenings that become stories.", uk: "вечори, що стають історіями." },
    "Авторские коктейли, шампанское и крепкий алкоголь — карта для тех, кто разбирается.": { pl: "Autorskie koktajle, szampan i mocne alkohole — karta dla tych, którzy wiedzą, czego chcą.", en: "Signature cocktails, champagne and spirits — a menu for those who know their drinks.", uk: "Авторські коктейлі, шампанське та міцний алкоголь — карта для тих, хто знається." },
    "Закуски, суши и основные блюда от шефа.": { pl: "Przystawki, sushi i dania główne od szefa kuchni.", en: "Starters, sushi and main courses by our chef.", uk: "Закуски, суші та основні страви від шефа." },
    "Лимонады, кофе, чай — для тех, кто выбирает ясность ума.": { pl: "Lemoniady, kawa i herbata — dla tych, którzy wybierają jasność umysłu.", en: "Lemonades, coffee and tea — for those who choose a clear head.", uk: "Лимонади, кава, чай — для тих, хто обирає ясність розуму." },
    "Главная сцена —": { pl: "Główna scena —", en: "The main stage —", uk: "Головна сцена —" },
    "ваша": { pl: "jest Twoja", en: "is yours", uk: "ваша" },
    "Караоке, тёплый свет и вечер, который не требует репетиции.": { pl: "Karaoke, ciepłe światło i wieczór, który nie wymaga prób.", en: "Karaoke, warm light and an evening that needs no rehearsal.", uk: "Караоке, тепле світло й вечір, що не потребує репетиції." },
    "Пойте, даже если не умеете": { pl: "Śpiewaj, nawet jeśli nie umiesz", en: "Sing, even if you cannot", uk: "Співайте, навіть якщо не вмієте" },
    "— здесь это часть ночи.": { pl: "— tutaj to część nocy.", en: "— here, that is part of the night.", uk: "— тут це частина ночі." },
    "Сцена": { pl: "Scena", en: "Stage", uk: "Сцена" },
    "Музыка": { pl: "Muzyka", en: "Music", uk: "Музика" },
    "Сервис": { pl: "Serwis", en: "Service", uk: "Сервіс" },
    "Приватность": { pl: "Prywatność", en: "Privacy", uk: "Приватність" },
    "Профессиональный звук и свет — сцена, на которой хочется быть услышанным.": { pl: "Profesjonalny dźwięk i światło — scena, na której chce się być usłyszanym.", en: "Professional sound and lighting — a stage where you want to be heard.", uk: "Професійний звук і світло — сцена, на якій хочеться бути почутим." },
    "От ностальгии до момента здесь и сейчас — играет то, что просите Вы.": { pl: "Od nostalgii po tu i teraz — gramy to, o co prosisz.", en: "From nostalgia to the here and now — we play what you ask for.", uk: "Від ностальгії до моменту тут і зараз — звучить те, що просите Ви." },
    "Персонал, который угадывает, что нужно, раньше, чем Вы попросите.": { pl: "Obsługa, która wie, czego potrzebujesz, zanim o to poprosisz.", en: "A team that knows what you need before you ask.", uk: "Персонал, який відчуває, що потрібно, ще до того, як Ви попросите." },
    "Закрытая зона для тех, кто не хочет делить вечер со всеми.": { pl: "Prywatna strefa dla tych, którzy nie chcą dzielić wieczoru ze wszystkimi.", en: "A private area for those who do not want to share the evening with everyone.", uk: "Закрита зона для тих, хто не хоче ділити вечір з усіма." },
    "Особенные вечера": { pl: "Wyjątkowe wieczory", en: "Special evenings", uk: "Особливі вечори" },
    "Каждый вторник": { pl: "W każdy wtorek", en: "Every Tuesday", uk: "Щовівторка" },
    "Каждый четверг": { pl: "W każdy czwartek", en: "Every Thursday", uk: "Щочетверга" },
    "Вечер, когда всё внимание принадлежит девушкам. Стол без депозита, безлимитное игристое до 00:00, комплимент от шефа и караоке всю ночь.": { pl: "Wieczór, podczas którego cała uwaga należy do kobiet. Stolik bez depozytu, nielimitowane wino musujące do 00:00, prezent od szefa kuchni i karaoke przez całą noc.", en: "An evening when all attention belongs to the ladies. No table deposit, unlimited sparkling wine until midnight, a chef's treat and karaoke all night.", uk: "Вечір, коли вся увага належить дівчатам. Столик без депозиту, безлімітне ігристе до 00:00, комплімент від шефа та караоке всю ніч." },
    "Хороший вечер начинается с правильного коктейля. Каждый четверг для девушек действует предложение 1+1 на Pornstar Martini, Margarita и Clover Club.": { pl: "Dobry wieczór zaczyna się od właściwego koktajlu. W każdy czwartek panie otrzymują ofertę 1+1 na Pornstar Martini, Margaritę i Clover Club.", en: "A great evening starts with the right cocktail. Every Thursday, ladies enjoy a 1+1 offer on Pornstar Martini, Margarita and Clover Club.", uk: "Гарний вечір починається з правильного коктейлю. Щочетверга для дівчат діє пропозиція 1+1 на Pornstar Martini, Margarita та Clover Club." },
    "Дни рождения": { pl: "Urodziny", en: "Birthdays", uk: "Дні народження" },
    "Корпоративы": { pl: "Imprezy firmowe", en: "Corporate events", uk: "Корпоративи" },
    "Закрытые вечеринки": { pl: "Prywatne przyjęcia", en: "Private parties", uk: "Закриті вечірки" },
    "Дни рождения, корпоративы и закрытые вечеринки — соберём формат вечера под вашу компанию.": { pl: "Urodziny, imprezy firmowe i prywatne przyjęcia — dopasujemy format wieczoru do Twojej grupy.", en: "Birthdays, corporate events and private parties — we will tailor the evening to your group.", uk: "Дні народження, корпоративи та закриті вечірки — створимо формат вечора саме для вашої компанії." },
    "Праздничный вечер с музыкой, караоке и вниманием к каждой детали. Поможем подобрать формат, который подойдёт именно вашей компании и настроению праздника.": { pl: "Wieczór z muzyką, karaoke i dbałością o każdy szczegół. Pomożemy wybrać format odpowiedni dla Twojej grupy i nastroju świętowania.", en: "A celebration with music, karaoke and attention to every detail. We will help choose the right format for your group and mood.", uk: "Святковий вечір із музикою, караоке та увагою до кожної деталі. Допоможемо дібрати формат, який пасуватиме саме вашій компанії та настрою свята." },
    "Вечер для команды с отдельной программой, подходящим меню и атмосферой без офисной формальности. Пространство легко адаптируется под небольшой коллектив или большую компанию.": { pl: "Wieczór dla zespołu z osobnym programem, odpowiednim menu i atmosferą bez biurowej formalności. Przestrzeń łatwo dopasować do małej lub dużej grupy.", en: "A team evening with a dedicated programme, the right menu and none of the office formality. The space adapts easily to small or large groups.", uk: "Вечір для команди з окремою програмою, відповідним меню та атмосферою без офісної формальності. Простір легко адаптується як для невеликого колективу, так і для великої компанії." },
    "Приватное пространство для вечера только с вашими гостями. Вы отдыхаете в своём кругу, а команда Angel’s поддерживает ритм и атмосферу на протяжении всей ночи.": { pl: "Prywatna przestrzeń tylko dla Twoich gości. Ty bawisz się w swoim gronie, a zespół Angel's dba o rytm i atmosferę przez całą noc.", en: "A private space just for your guests. Relax with your circle while the Angel's team keeps the rhythm and atmosphere going all night.", uk: "Приватний простір для вечора лише з вашими гостями. Ви відпочиваєте у своєму колі, а команда Angel’s підтримує ритм і атмосферу впродовж усієї ночі." },
    "наших гостей": { pl: "naszych gości", en: "of our guests", uk: "наших гостей" },
    "Бронирование": { pl: "Rezerwacja", en: "Booking", uk: "Бронювання" },
    "Ваш вечер": { pl: "Twój wieczór", en: "Your evening", uk: "Ваш вечір" },
    "начинается здесь": { pl: "zaczyna się tutaj", en: "starts here", uk: "починається тут" },
    "Забронируйте стол — музыку, свет и настроение вечера мы возьмём на себя.": { pl: "Zarezerwuj stolik — muzyką, światłem i nastrojem wieczoru zajmiemy się my.", en: "Book a table — we will take care of the music, lights and mood.", uk: "Забронюйте столик — музику, світло й настрій вечора ми візьмемо на себе." },
    "Проложить маршрут": { pl: "Wyznacz trasę", en: "Get directions", uk: "Прокласти маршрут" },
    "Ежедневно": { pl: "Codziennie", en: "Daily", uk: "Щодня" },
    "ежедневно": { pl: "codziennie", en: "daily", uk: "щодня" },
    "График работы": { pl: "Godziny otwarcia", en: "Opening hours", uk: "Графік роботи" },
    "Адрес": { pl: "Adres", en: "Address", uk: "Адреса" },
    "Онлайн": { pl: "Online", en: "Online", uk: "Онлайн" },
    "Оставьте заявку — мы свяжемся с вами.": { pl: "Zostaw zgłoszenie — skontaktujemy się z Tobą.", en: "Leave a request — we will contact you.", uk: "Залиште заявку — ми з вами зв’яжемося." },
    "Дата": { pl: "Data", en: "Date", uk: "Дата" },
    "Время": { pl: "Godzina", en: "Time", uk: "Час" },
    "Выберите": { pl: "Wybierz", en: "Select", uk: "Оберіть" },
    "Количество гостей": { pl: "Liczba gości", en: "Number of guests", uk: "Кількість гостей" },
    "Ваше имя": { pl: "Imię", en: "Your name", uk: "Ваше ім’я" },
    "Номер телефона": { pl: "Numer telefonu", en: "Phone number", uk: "Номер телефону" },
    "Комментарий": { pl: "Komentarz", en: "Comment", uk: "Коментар" },
    "необязательно": { pl: "opcjonalnie", en: "optional", uk: "необов’язково" },
    "Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.": { pl: "Klikając przycisk, zgadzasz się na przetwarzanie danych w celu kontaktu w sprawie zgłoszenia.", en: "By clicking the button, you agree to data processing so we can contact you about your request.", uk: "Натискаючи кнопку, ви погоджуєтеся на обробку даних для зв’язку щодо заявки." },
    "Отправить заявку": { pl: "Wyślij zgłoszenie", en: "Send request", uk: "Надіслати заявку" },
    "Меню — Angel's Варшава": { pl: "Menu — Angel's Warszawa", en: "Menu — Angel's Warsaw", uk: "Меню — Angel's Варшава" },
    "Авторские коктейли, шампанское, вино и крепкий алкоголь. Все позиции и цены — из актуальной карты Angel's.": { pl: "Autorskie koktajle, szampan, wino i mocne alkohole. Wszystkie pozycje i ceny pochodzą z aktualnej karty Angel's.", en: "Signature cocktails, champagne, wine and spirits. All items and prices are from the current Angel's menu.", uk: "Авторські коктейлі, шампанське, вино та міцний алкоголь. Усі позиції й ціни — з актуальної карти Angel's." },
    "Устрицы, закуски, салаты, супы, суши и десерты. Все позиции и цены — из актуального меню Angel's.": { pl: "Ostrygi, przystawki, sałatki, zupy, sushi i desery. Wszystkie pozycje i ceny pochodzą z aktualnego menu Angel's.", en: "Oysters, starters, salads, soups, sushi and desserts. All items and prices are from the current Angel's menu.", uk: "Устриці, закуски, салати, супи, суші та десерти. Усі позиції й ціни — з актуального меню Angel's." },
    "Безалкогольные коктейли, лимонады, фреши, вода, кофе и чай.": { pl: "Koktajle bezalkoholowe, lemoniady, świeże soki, woda, kawa i herbata.", en: "Non-alcoholic cocktails, lemonades, fresh juices, water, coffee and tea.", uk: "Безалкогольні коктейлі, лимонади, фреші, вода, кава й чай." },
    "Для просмотра полного меню включите JavaScript.": { pl: "Włącz JavaScript, aby zobaczyć pełne menu.", en: "Enable JavaScript to view the full menu.", uk: "Щоб переглянути повне меню, увімкніть JavaScript." },
    "Устрицы": { pl: "Ostrygi", en: "Oysters", uk: "Устриці" },
    "Закуски": { pl: "Przystawki", en: "Starters", uk: "Закуски" },
    "Салаты": { pl: "Sałatki", en: "Salads", uk: "Салати" },
    "Супы": { pl: "Zupy", en: "Soups", uk: "Супи" },
    "Суши": { pl: "Sushi", en: "Sushi", uk: "Суші" },
    "Десерты": { pl: "Desery", en: "Desserts", uk: "Десерти" },
    "Коктейли": { pl: "Koktajle", en: "Cocktails", uk: "Коктейлі" },
    "Авторские коктейли Angel's": { pl: "Autorskie koktajle Angel's", en: "Angel's signature cocktails", uk: "Авторські коктейлі Angel's" },
    "Классические коктейли": { pl: "Klasyczne koktajle", en: "Classic cocktails", uk: "Класичні коктейлі" },
    "Авторские коктейли": { pl: "Autorskie koktajle", en: "Signature cocktails", uk: "Авторські коктейлі" },
    "Шампанское и игристое": { pl: "Szampan i wina musujące", en: "Champagne & sparkling", uk: "Шампанське та ігристе" },
    "Игристое вино": { pl: "Wino musujące", en: "Sparkling wine", uk: "Ігристе вино" },
    "Вино": { pl: "Wino", en: "Wine", uk: "Вино" },
    "Белое вино": { pl: "Białe wino", en: "White wine", uk: "Біле вино" },
    "Красное вино": { pl: "Czerwone wino", en: "Red wine", uk: "Червоне вино" },
    "Крепкий алкоголь": { pl: "Mocne alkohole", en: "Spirits", uk: "Міцний алкоголь" },
    "Вермуты и ликёры": { pl: "Wermuty i likiery", en: "Vermouths & liqueurs", uk: "Вермути та лікери" },
    "Пиво": { pl: "Piwo", en: "Beer", uk: "Пиво" },
    "Кофе и чай": { pl: "Kawa i herbata", en: "Coffee & tea", uk: "Кава й чай" },
    "Кофе": { pl: "Kawa", en: "Coffee", uk: "Кава" },
    "Вода": { pl: "Woda", en: "Water", uk: "Вода" },
    "Лимонады": { pl: "Lemoniady", en: "Lemonades", uk: "Лимонади" },
    "Фреши · 0,25 л": { pl: "Świeże soki · 0,25 l", en: "Fresh juices · 0.25 l", uk: "Фреші · 0,25 л" },
    "бокал": { pl: "kieliszek", en: "glass", uk: "келих" },
    "Шампанское": { pl: "Szampan", en: "Champagne", uk: "Шампанське" },
    "Портвейн и херес": { pl: "Porto i sherry", en: "Port & sherry", uk: "Портвейн і херес" },
    "Водка": { pl: "Wódka", en: "Vodka", uk: "Горілка" },
    "Джин": { pl: "Gin", en: "Gin", uk: "Джин" },
    "Ром": { pl: "Rum", en: "Rum", uk: "Ром" },
    "Текила и мескаль": { pl: "Tequila i mezcal", en: "Tequila & mezcal", uk: "Текіла та мескаль" },
    "Текила": { pl: "Tequila", en: "Tequila", uk: "Текіла" },
    "Вермуты": { pl: "Wermuty", en: "Vermouth", uk: "Вермути" },
    "Ликёры": { pl: "Likiery", en: "Liqueurs", uk: "Лікери" },
    "Шотландский виски": { pl: "Szkocka whisky", en: "Scotch whisky", uk: "Шотландський віскі" },
    "Ирландский виски": { pl: "Irlandzka whiskey", en: "Irish whiskey", uk: "Ірландський віскі" },
    "Американский виски": { pl: "Amerykańska whiskey", en: "American whiskey", uk: "Американський віскі" },
    "Японский виски": { pl: "Japońska whisky", en: "Japanese whisky", uk: "Японський віскі" },
    "Коньяк": { pl: "Koniak", en: "Cognac", uk: "Коньяк" },
    "Вермуты 80 мл / ликёры 40 мл": { pl: "Wermuty 80 ml / likiery 40 ml", en: "Vermouth 80 ml / liqueurs 40 ml", uk: "Вермути 80 мл / лікери 40 мл" },
    "Фреши": { pl: "Świeże soki", en: "Fresh juices", uk: "Фреші" },
    "Прохладительные напитки": { pl: "Napoje gazowane i soki", en: "Soft drinks", uk: "Прохолодні напої" },
    "Чай": { pl: "Herbata", en: "Tea", uk: "Чай" },
    "40 мл": { pl: "40 ml", en: "40 ml", uk: "40 мл" },
    "По предварительному заказу наш шеф создаст персональное меню по вашему запросу.": { pl: "Na wcześniejsze zamówienie szef kuchni przygotuje dla Ciebie indywidualne menu.", en: "Our chef can prepare a custom menu on request when ordered in advance.", uk: "За попереднім замовленням наш шеф створить персональне меню на ваш запит." },
    "бутылка": { pl: "butelka", en: "bottle", uk: "пляшка" },
    "бутылка 0,7 л": { pl: "butelka 0,7 l", en: "0.7 l bottle", uk: "пляшка 0,7 л" },
    "бутылка 0,75 л": { pl: "butelka 0,75 l", en: "0.75 l bottle", uk: "пляшка 0,75 л" },
    "бутылка 0,33 л": { pl: "butelka 0,33 l", en: "0.33 l bottle", uk: "пляшка 0,33 л" },
    "80 мл": { pl: "80 ml", en: "80 ml", uk: "80 мл" },
    "0,25 л": { pl: "0,25 l", en: "0.25 l", uk: "0,25 л" },
    "чайник": { pl: "dzbanek", en: "teapot", uk: "чайник" },
    // Ukrainian-only entries: attributes and labels without PL/EN versions
    "Angels — караоке и ночное пространство в Варшаве.": { uk: "Angels — караоке та нічний простір у Варшаві." },
    "Angel's — караоке и lounge bar в Варшаве": { uk: "Angel's — караоке та lounge bar у Варшаві" },
    "Караоке, бар, кухня и частные мероприятия в центре Варшавы.": { uk: "Караоке, бар, кухня та приватні заходи в центрі Варшави." },
    "Основная навигация": { uk: "Основна навігація" },
    "Angel's — на главную": { uk: "Angel's — на головну" },
    "Ключевые особенности Angel's": { uk: "Ключові особливості Angel's" },
    "Меню Angel's": { uk: "Меню Angel's" },
    "Коктейль с лавандой в баре Angel's": { uk: "Коктейль із лавандою в барі Angel's" },
    "Устрицы на льду на кухне Angel's": { uk: "Устриці на льоду від кухні Angel's" },
    "Кальян на ледяном кубе в Angel's": { uk: "Кальян на крижаному кубі в Angel's" },
    "Атмосфера ночей в Angel's": { uk: "Атмосфера ночей в Angel's" },
    "Компания гостей на вечеринке в Angel's": { uk: "Компанія гостей на вечірці в Angel's" },
    "Гости отдыхают в лаунж-зоне Angel's": { uk: "Гості відпочивають у лаунж-зоні Angel's" },
    "Гости у световой инсталляции с крыльями в Angel's": { uk: "Гості біля світлової інсталяції з крилами в Angel's" },
    "Управление галереей": { uk: "Керування галереєю" },
    "Предыдущий кадр": { uk: "Попередній кадр" },
    "Следующий кадр": { uk: "Наступний кадр" },
    "Особенные вечера Angel's": { uk: "Особливі вечори Angel's" },
    "Праздничный вечер с друзьями в Angel's": { uk: "Святковий вечір із друзями в Angel's" },
    "Вечеринка гостей в Angel's": { uk: "Вечірка гостей в Angel's" },
    "Гости празднуют день рождения в Angel's": { uk: "Гості святкують день народження в Angel's" },
    "Компания гостей на корпоративном вечере в Angel's": { uk: "Компанія гостей на корпоративному вечорі в Angel's" },
    "Гости закрытой вечеринки у фотозоны Angel's": { uk: "Гості закритої вечірки біля фотозони Angel's" },
    "Впечатления гостей Angel's": { uk: "Враження гостей Angel's" },
    "Фрагменты атмосферы Angel's": { uk: "Фрагменти атмосфери Angel's" },
    "Друзья отдыхают в Angel's": { uk: "Друзі відпочивають в Angel's" },
    "Гости в лаунж-зоне Angel's": { uk: "Гості в лаунж-зоні Angel's" },
    "Яркий момент вечеринки в Angel's": { uk: "Яскравий момент вечірки в Angel's" },
    "Управление галереей впечатлений": { uk: "Керування галереєю вражень" },
    "Google Maps — Angel's, Żurawia 6/12, Варшава": { uk: "Google Maps — Angel's, Żurawia 6/12, Варшава" },
    "Навигация в подвале": { uk: "Навігація внизу сторінки" },
    "Закрыть меню": { uk: "Закрити меню" },
    "Основное меню": { uk: "Основне меню" },
    "Выбор языка": { uk: "Вибір мови" },
    "Языковые версии сайта": { uk: "Мовні версії сайту" },
    "Меню и разделы сайта": { uk: "Меню та розділи сайту" },
    "Открыть Angel's на Google Maps": { uk: "Відкрити Angel's на Google Maps" },
    "Закрыть форму бронирования": { uk: "Закрити форму бронювання" },
    "Закрыть форму": { uk: "Закрити форму" },
    "Информация о бронировании": { uk: "Інформація про бронювання" },
    "Имя": { uk: "Ім’я" },
    "Повод, пожелания или удобный способ связи": { uk: "Привід, побажання або зручний спосіб зв’язку" },
    "Сайт": { uk: "Сайт" },
    "Вернуться на главную": { uk: "Повернутися на головну" },
    "Быстрый переход по разделам меню": { uk: "Швидкий перехід розділами меню" },
    "Категории текущего раздела": { uk: "Категорії поточного розділу" },
    "Разделы меню": { uk: "Розділи меню" },
    "Барная карта Angel's": { uk: "Барна карта Angel's" },
    "Безалкогольные напитки Angel's": { uk: "Безалкогольні напої Angel's" },
    "Меню кухни Angel's": { uk: "Меню кухні Angel's" }
  };

  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const translate = (value, lang) => {
    if (lang === "ru") return value;
    const key = normalize(value);
    if (!key) return value;
    if (copy[key]?.[lang]) return copy[key][lang];
    const count = key.match(/^(\d+)\s+поз\.$/);
    if (count) {
      if (lang === "uk") return `${count[1]} поз.`;
      return lang === "pl" ? `${count[1]} poz.` : `${count[1]} items`;
    }
    if (lang === "uk") {
      const position = key.match(/^(\d+) из (\d+)$/);
      if (position) return `${position[1]} з ${position[2]}`;
      const categories = key.match(/^Категории раздела (.+)$/);
      if (categories) return `Категорії розділу ${translate(categories[1], lang).toLowerCase()}`;
    }
    return value;
  };

  const requestedLang = new URLSearchParams(location.search).get("lang");
  const currentFromUrl = aliases[requestedLang] || requestedLang;
  let current = supported.includes(currentFromUrl)
    ? currentFromUrl
    : supported.includes(localStorage.getItem("angels-language"))
      ? localStorage.getItem("angels-language")
      : "ru";

  const isSkipped = (node) =>
    Boolean((node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement)?.closest("[data-i18n-skip]"));

  function translateTextNode(node) {
    if (isSkipped(node)) return;
    if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
    const original = textOriginals.get(node);
    const trimmed = normalize(original);
    if (!trimmed) return;
    const translated = translate(trimmed, current);
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    const value = `${leading}${translated}${trailing}`;
    if (node.nodeValue !== value) node.nodeValue = value;
  }

  function translateAttributes(element) {
    if (isSkipped(element)) return;
    const names = ["aria-label", "title", "placeholder", "content", "alt"];
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
    root.querySelectorAll?.("[aria-label], [title], [placeholder], [alt], meta[content]").forEach(translateAttributes);
    if (root !== document) return;
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

  // A language link (?lang=…) counts as the visitor's choice for the next pages.
  if (supported.includes(currentFromUrl)) {
    try {
      localStorage.setItem("angels-language", currentFromUrl);
    } catch (error) {}
  }

  apply(document);
  observer.observe(document.body, { childList: true, subtree: true });

  // First-visit language selector. The inline script in <head> adds the class
  // before the first paint when no language has been chosen yet.
  const gate = document.querySelector("[data-language-gate]");
  const root = document.documentElement;
  if (gate && root.classList.contains("language-gate-open")) {
    const options = [...gate.querySelectorAll("[data-gate-lang]")];
    const scrollKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"];
    const stop = (event) => event.stopPropagation();
    const block = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    gate.addEventListener("wheel", block, { passive: false });
    gate.addEventListener("touchmove", block, { passive: false });
    gate.addEventListener("touchstart", stop, { passive: true });
    gate.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Tab") {
        const index = options.indexOf(document.activeElement);
        const next = index === -1 ? (event.shiftKey ? options.length - 1 : 0) : event.shiftKey ? index - 1 : index + 1;
        event.preventDefault();
        options[(next + options.length) % options.length].focus();
      } else if (scrollKeys.includes(event.key)) {
        event.preventDefault();
        const index = Math.max(0, options.indexOf(document.activeElement));
        const step = ["ArrowDown", "PageDown", "End"].includes(event.key) ? 1 : -1;
        options[(index + step + options.length) % options.length].focus();
      }
    });

    gate.addEventListener("click", (event) => {
      const option = event.target.closest("[data-gate-lang]");
      if (!option) return;
      setLanguage(option.dataset.gateLang);
      gate.classList.add("is-closing");
      root.classList.remove("language-gate-open");
      option.blur();
      window.setTimeout(() => gate.remove(), 600);
    });

    window.requestAnimationFrame(() => gate.focus({ preventScroll: true }));
  } else {
    gate?.remove();
  }

  window.ANGELS_I18N = {
    get lang() { return current; },
    t(value) { return translate(value, current); },
    apply,
    setLanguage,
  };
})();
