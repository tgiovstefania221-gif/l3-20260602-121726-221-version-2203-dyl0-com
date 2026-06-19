
(function(){
  var menu=document.querySelector('.menubtn');
  var mobile=document.querySelector('.mobilemenu');
  if(menu&&mobile){menu.addEventListener('click',function(){mobile.classList.toggle('open')})}
  var slides=[].slice.call(document.querySelectorAll('.stage-slide'));
  var dots=[].slice.call(document.querySelectorAll('.stage-controls button'));
  var current=0;
  function show(i){if(!slides.length)return;current=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('active',n===current)});dots.forEach(function(d,n){d.classList.toggle('active',n===current)})}
  dots.forEach(function(d,i){d.addEventListener('click',function(){show(i)})});
  if(slides.length>1){setInterval(function(){show(current+1)},5200)}
  var input=document.querySelector('.movie-search');
  var clear=document.querySelector('.clear-search');
  var cards=[].slice.call(document.querySelectorAll('.movie-card'));
  var state={year:'',region:''};
  function norm(s){return (s||'').toString().toLowerCase()}
  function apply(){
    if(!cards.length)return;
    var q=norm(input&&input.value);
    var shown=0;
    cards.forEach(function(card){
      var hay=norm([card.dataset.title,card.dataset.region,card.dataset.year,card.dataset.genre,card.dataset.type].join(' '));
      var ok=(!q||hay.indexOf(q)>-1)&&(!state.year||card.dataset.year.indexOf(state.year)>-1)&&(!state.region||card.dataset.region===state.region);
      card.style.display=ok?'':'none';
      if(ok)shown++;
    });
    var wrap=document.querySelector('.filter-target');
    if(wrap){wrap.classList.toggle('no-results',shown===0)}
  }
  if(input){input.addEventListener('input',apply)}
  if(clear){clear.addEventListener('click',function(){input.value='';state.year='';state.region='';document.querySelectorAll('.quick-filters button').forEach(function(b){b.classList.remove('active')});apply()})}
  document.querySelectorAll('[data-filter-year]').forEach(function(btn){btn.addEventListener('click',function(){state.year=state.year===btn.dataset.filterYear?'':btn.dataset.filterYear;document.querySelectorAll('[data-filter-year]').forEach(function(b){b.classList.remove('active')});if(state.year)btn.classList.add('active');apply()})});
  document.querySelectorAll('[data-filter-region]').forEach(function(btn){btn.addEventListener('click',function(){state.region=state.region===btn.dataset.filterRegion?'':btn.dataset.filterRegion;document.querySelectorAll('[data-filter-region]').forEach(function(b){b.classList.remove('active')});if(state.region)btn.classList.add('active');apply()})});
  document.querySelectorAll('.player').forEach(function(player){
    var video=player.querySelector('video');
    var layer=player.querySelector('.play-layer');
    var src=player.getAttribute('data-hls');
    var ready=false;
    function attach(){
      if(ready||!video||!src)return;ready=true;
      if(window.Hls&&window.Hls.isSupported()){
        var hls=new window.Hls({maxBufferLength:60});
        hls.loadSource(src);
        hls.attachMedia(video);
      }else if(video.canPlayType('application/vnd.apple.mpegurl')){
        video.src=src;
      }
    }
    function play(){attach();video.play().then(function(){if(layer)layer.classList.add('hidden')}).catch(function(){if(layer)layer.classList.remove('hidden')})}
    if(layer){layer.addEventListener('click',play)}
    if(video){video.addEventListener('click',function(){if(video.paused){play()}else{video.pause();if(layer)layer.classList.remove('hidden')}})}
  });
})();
