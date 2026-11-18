# Подключение home.pl — 18 ноября 2026

## Готово

- Репозиторий: https://github.com/Svip-web/angels-warsaw-site
- Окружение GitHub Actions: `homepl`.
- Автоматическая публикация включена: изменения `dist/**`, `scripts/**` или
  сценария публикации в ветке `main` запускают `deploy-homepl.yml`.
- FTPS: `serwer2389562.home.pl`, порт `21`, строгая проверка сертификата.
- FTP-пользователь `github-deploy@angelskaraoke.com` ограничен каталогом
  `/angels-site`; `HOMEPL_DIRECTORY=./`.
- Пароль и имя пользователя хранятся в Environment secrets GitHub.
- Пробный запуск: https://github.com/Svip-web/angels-warsaw-site/actions/runs/44380032575
- Первая реальная загрузка: https://github.com/Svip-web/angels-warsaw-site/actions/runs/44380445496
- Содержимое всех 73 файлов на home.pl сверено со сборкой GitHub
  (с учетом LF и сгенерированных хешей CSS/JS). Ошибок нет.
- Мобильное меню на польском проверено: фотографии загружаются, оба видео
  кальянов воспроизводятся при появлении в области просмотра.
- Технический адрес: https://serwer2389562.home.pl/angels-site/
- API бронирования разрешает HTTPS origins `angelskaraoke.com` и
  `www.angelskaraoke.com`. Версия API 4 опубликована, CORS preflight проверен.

## До переключения основного домена

- Исправить SSL для `angelskaraoke.com` и `www.angelskaraoke.com`.
  Сервер сейчас предъявляет сертификат `*.home.pl`, который не подходит этим
  адресам. Доступный в аккаунте homeSSL Start выдан для `.pl` и `www .pl`.
- Покупка отдельного SSL для `.com` не выполнялась: требуется согласовать
  стоимость и условия продления.
- После исправления HTTPS изменить каталог домена с
  `/autoinstalator/wordpress` на `/angels-site` и проверить публичный сайт,
  меню, видео и тестовую заявку в Telegram.

Старый WordPress, его каталог и база данных сохранены. Для возврата старого
сайта достаточно вернуть назначение домена на `/autoinstalator/wordpress`.
GitHub Pages продолжает работать независимо.
