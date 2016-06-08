(function ($) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

        // add class to hamburger button to animate to cross
        $('#btn--activate-menu').on('click', function(){
            $(this).toggleClass('is-active');
            $('.nav__list').toggleClass('nav__list-active');
        });


    });
}(jQuery));
//# sourceMappingURL=maps/all.js.map
