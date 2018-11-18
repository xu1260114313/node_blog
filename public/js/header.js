$(function() {
    //头部吸顶条
    $('.ui.sticky').sticky({
        context: '#container'
    })
    ;
    $('.sidebar.item').on('click', function () {
        console.log(1)
        var $el = $('.ui.menu .pc-hidden');
        if ($el.length > 0) {
            $('.ui.menu').find('.pc-hidden').removeClass('pc-hidden');
        } else {
            $('.ui.menu .right.menu').find('.item').addClass('pc-hidden');
        }
    });
})