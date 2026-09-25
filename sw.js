var CACHE='reader-v1';
var SHELL=[
  './',
  './index.html',
  './sw.js',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install',function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();})
  );
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
    }).then(function(){return self.clients.claim();})
  );
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  var url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  if(url.protocol!=='http:'&&url.protocol!=='https:') return;
  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        if(res&&res.ok&&res.type==='basic'){
          var copy=res.clone();
          caches.open(CACHE).then(function(c){c.put(req,copy);});
        }
        return res;
      }).catch(function(){
        if(req.mode==='navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});