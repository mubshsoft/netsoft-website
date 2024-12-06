/*eslint-disable no-undef*/

(function ($) {
    "use strict"; // Start of use strict

    // Smooth scrolling using jQuery easing
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html, body').animate({
                    scrollTop: (target.offset().top - 54)
                }, 1000, "easeInOutExpo");
                return false;
            }
        }
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $('.js-scroll-trigger').click(function () {
        $('.navbar-collapse').collapse('hide');
        $(".navbar-toggler .line1").removeClass("open1");
        $(".navbar-toggler .line2").removeClass("open2");
        $(".navbar-toggler .line3").removeClass("open3");
    });

    // Nav burger menu
    $(".navbar-toggler").click(function () {
        $(".line1").toggleClass("open1");
        $(".line2").toggleClass("open2");
        $(".line3").toggleClass("open3");
    });

    var nav = document.querySelector('nav'); // Identify target

    window.addEventListener('scroll', function (event) {
        event.preventDefault();
        if (window.scrollY > 10) {
            nav.classList.add('scrolled-head'); // or default color
            nav.classList.remove('static-head');
        }
        else {
            nav.classList.add('static-head');
            nav.classList.remove('scrolled-head');
        }
    });

    if(location.href.lastIndexOf('/jobs/subscribe') != -1){
        notify("Please login or signup to subscribe for jobs", "warning");
    }
})(jQuery); // End of use strict
