var DELAY = 200;

$(function() {
    $('.content').hide();
    $('#lookup-content').fadeIn(DELAY);

    $('.nav-item').on('click', function() {
        $('.content').hide();
        $('#' + this.id + '-content').fadeIn(DELAY);
        resetLookup();
    });
});
