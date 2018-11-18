$(function() {
    $(window).on('scroll', function() {
        var scrollTop = $(document).scrollTop();
        var $header = $('header');
        if(scrollTop >= 47) {
            $header.addClass('fixed');
        }else {
            if($header.hasClass('fixed')) {
                $header.removeClass('fixed');
            }
        };
    });
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