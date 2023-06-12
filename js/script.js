$(document).ready(function(){
    console.log('Bienvenue sur mon portfolio !',"Je vois que tu explores mon site web. Le site a été construit avec le framework SkeletonCSS qui est lightweight qui permet d'appliquer un style de base et surtout gérer la partie responsive du site web. Pour charger mes fonts j'utilise google font et la police d'écriture Montserrat. Pour les icônes visibles dans la section contact j'utilise boxicons. Pour la partie interactive, jquery est installé et sinon l'effet de la souris,  du chargement ou des fades in sont fait par mes soins. Je t'invite à explorer le code si ça t'intéresse (/script.js). Merci d'explorer mon site et si tu as des questions n'hésite pas à me contacter.");

    //Load effect
    $("#loader").css('background-color', 'rgba(0,0,0,0)');


    //Mouse follow
    let mousePosX = 0,
        mousePosY = 0,
        mouseCircle = document.getElementById('mouse-circle');

    document.onmousemove = (e) => {
        mousePosX = e.pageX;
        mousePosY = e.pageY;
    }

    let delay = 6,
        revisedMousePosX = 0,
        revisedMousePosY = 0;

    function delayMouseFollow() {
        requestAnimationFrame(delayMouseFollow);

        revisedMousePosX += (mousePosX - revisedMousePosX) / delay;
        revisedMousePosY += (mousePosY - revisedMousePosY) / delay; 

        mouseCircle.style.top = revisedMousePosY + 'px';
        mouseCircle.style.left = revisedMousePosX + 'px';
    }
    delayMouseFollow();

    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a','b','a'];
    let current = [];
    $(document).keyup(function(e){
        current.push(e.key);

        if(current.length > konamiCode.length){
            current.shift();
        }

        if(JSON.stringify(current) == JSON.stringify(konamiCode)){
            console.log("You found the easter egg !");
            $("#cssStyle").remove();
            $("head").append('<link rel="stylesheet" href="css/oldweb.css">');
        }
    })
})

//Effect on scrolling
$(window).on('scroll', function(){
    var pour = $(window).scrollTop()/($(document).height() - $(window).height());
    if(pour > 0.75){
        $('#contact').css('opacity', '1');
        $('#contact').css('animation', 'loadSection 1s');
    }else if(pour> 0.5){
        $('#technos div').css('opacity', '1');
        $('#technos div').css('animation', 'loadSection 1s');
    }else if(pour > 0.25){
        $('#introduction').css('opacity', '1');
        $('#introduction').css('animation', 'loadSection 1s');
    }
})