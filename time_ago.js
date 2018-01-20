/**
 * Lately.js is a jQuery plugin that makes it easy to support automatically
 *
 * @name ViewImage.js
 * @version 1.0.2
 * @requires jQuery v2.0+
 * @author Tokin (Tokinx)
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * https://tokinx.github.io/lately/
 *
 */
(function ($) {
    $.extend({
        lately: function (options) {
            var setting = $.extend({
                    'target': '.lastupdate > span',
                    'lang': {
                        'second': ' Seconds',
                        'minute': ' Minutes',
                        'hour': ' Hours',
                        'day': ' Days',
                        'month': ' Months',
                        'year': ' Years',
                        'ago': ' Ago',
                        'error': '0 Seconds'
                    }
                }, options),
                contains = $(setting.target);
                contains.each(function(){
                var contain = $(this);
                    date = '';
                    var htmls = $(this).html();
                    if (htmls ? !isNaN(new Date(htmls = htmls.replace(/-/g, "/"))) : false) date = htmls;
                    else return;
                    var item = $(this).closest('.item');
                    item.find('.timeagooutput').html(lately_count(date));
                });
            function lately_count(date) {
                var date = new Date(date),
                    second = (new Date().getTime() - date.getTime()) / 1000,
                    minute = second / 60,
                    hour = minute / 60,
                    day = hour / 24,
                    month = day / 30,
                    year = month / 12,
                    floor = Math.floor,
                    result = '';
                if (year >= 1) result = floor(year) + $.t(setting.lang.year);
                else if (month >= 1) result = floor(month) + $.t(setting.lang.month);
                else if (day >= 1) result = floor(day) + $.t(setting.lang.day);
                else if (hour >= 1) result = floor(hour) + $.t(setting.lang.hour);
                else if (minute >= 1) result = floor(minute) + $.t(setting.lang.minute);
                else if (second >= 1) result = floor(second) + $.t(setting.lang.second);
                else result = setting.lang.error;
                return result + setting.lang.ago;
            }
        }
    });
})(jQuery);
