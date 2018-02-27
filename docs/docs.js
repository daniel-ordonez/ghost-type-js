
const timeout = (t) => {
    return new Promise( (resolve, rejected) => { setTimeout(resolve,t) } );
}

const mounted = async() =>{
    let title = document.getElementById("title");
    let ghost = new ghostType( title, {typing:{ char:{ class: ['light'] } }} );
    ghost.type("Ghost Type ");
    await ghost.finished;
    ghost.update( {typing:{ char:{ class: ['bold'] } }} );
    ghost.type("JS");
    await ghost.finished;

    let timeline = anime.timeline();
    timeline.add({
        targets: '#title span',
        opacity: 0,
        duration: 900,
        delay: 400,
        easing: 'easeInOutSine'
    })
    .add({
        targets: '#logo-container',
        height: 160,
        duration: 1,
        offset: 1400
    })
    .add({
        targets: '#title span',
        opacity: 1,
        duration: 800,
        easing: 'easeInOutSine',
        offset: 4000
    })
    await timeout( 500 );
    let logo = document.getElementById("logo");
    logo.classList.remove("hidden");
    await animateLogo();
    logo.classList.toggle("ghost");
}

const animateLogo = () =>{
    let logoAnimation = anime.timeline();
    const append = ( t, k, v, e, d, o ) => {
        let ani = {}
        ani.targets = t;
        ani[k] = v;
        ani.easing = e;
        ani.duration = d;
        ani.offset = o;
        logoAnimation.add( ani );
    }
    append('#logo-outer-hex','opacity',[0,1],'easeInQuart',1500,0);
    append('#logo-outer-hex','scale',[0.5,1],'easeInQuart',1500,0);
    append('#logo-outer-hex','rotate',[270,0],'easeInOutSine',2000,1200);
    append('#logo-inner-cube','opacity',[0,1],'easeInOutQuart',1500,200);
    append('#logo-inner-cube','scale',[1.2,1],'easeInOutSine',1500,800);
    append('#logo-ball','scale',[0,1],'easeOutExpo',700,2200);
    append('#logo-eye','opacity',[0,1],'easeInQuad',500,2500);
    return logoAnimation.finished;
}

document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        mounted();
        document.onreadystatechange = null;
    }
  }