/*eslint-disable no-unused-vars*/
/*eslint-disable no-useless-escape*/
/*eslint-disable no-undef*/


$(".disable-on-click").click(function(){
    $(this).css('opacity','0.2');
    $(this).next().show();
})

$(".btn_view_more").click(function(){
    $(this).prev().toggle()
    if($(this).html().indexOf('View More') != "-1"){
        $(this).html($(this).html().replace('View More', 'View Less'))
    }
    else{
        $(this).html($(this).html().replace('View Less', 'View More'))
    }
})
