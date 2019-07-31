# BMP

Вы участвуете в стартапе по интерактивной аналитике данных для крупных бизнесов. Ноу-хау вашего проекта - интерактивные доски а-ля "умный стол". Приложение, которое разрабатывает конкретно ваша команда генерирует красивые диаграммы для отображения на столе, однако оказывается, что для корректного отображения картинки на столе её надо отражать вертикально (левая сторона становится правой и наоборот).

Вам необходимо реализовать класс transform-потока в виде экспорта в файле `convert.js`. На вход потока будет поступать бинарный поток картинки - на выходе поток картинки, вертикально отраженный. Корректными данными являются:

- картинка в формате (BMP)[https://en.wikipedia.org/wiki/BMP_file_format#Color_table]
- глубина картинки строго 24 бита на пиксель
- формат заголовка - `BITMAPINFOHEADER` или старше

Картинка на выходе должна иметь все заголовки идентичные исходной и также быть в формате BMP.

В случае получения некорректных данных ваш поток должен вернуть ошибку `InvalidImageError`

Вы можете быть уверены (не обязательно проверять в коде) в следующем:

- BMP на входе не имеет ни сжатия ни альфа-канала
- размеры картинки не превышают 8000х8000

Для простоты отадки вы можете использовать файл `index.js` который можно вызывать так:

```
node index.js input.bmp output.bmp
```

где input.bmp - исходная картинка, output.bmp - результат

Ваше приложение будет выполняться на маленьком контроллере, в котором размер памяти ограничен. Вы не должны потреблять больше 64Mb памяти
