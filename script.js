/* 关于艾米 · 创业档案 — 交互脚本 */
(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function(s,c){ return (c||document).querySelector(s); };
  var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };
  var clamp = function(v,a,b){ return Math.min(Math.max(v,a),b); };

  /* ---------- 0. 开场加载仪式 ---------- */
  var boot = $('#boot');
  if (boot){
    var bootN = $('.boot__n', boot), bootBar = $('.boot__bar i', boot), bootLog = $('.boot__log', boot);
    var bootLines = /intro\.html/.test(location.pathname) ? [
      '初始化 · 破冰引导 04',
      '装载 · 四步自我介绍',
      '准备 · 可复制的模板',
      '校验 · 示例与提示语',
      '就绪 · 等你先讲'
    ] : /doubao\.html/.test(location.pathname) ? [
      '初始化 · 飞书 × 豆包 工作流',
      '装载 · 现场留痕 07',
      '接入 · 服务客户台账',
      '校验 · 会议与现场记录',
      '就绪 · 证据链已归档'
    ] : [
      '初始化 · 企业级 AI 中台落地',
      '装载 · 企业融资方案节点',
      '接入 · AI 落地场景样本',
      '校验 · 公开背书记录 03',
      '就绪 · 10 条档案已归档'
    ];
    var bootDone = false;
    function finishBoot(){
      if (bootDone) return;
      bootDone = true;
      document.body.classList.remove('booting');
      try { sessionStorage.setItem('booted', '1'); } catch (e) {}
      if (reduce){ boot.style.display = 'none'; return; }
      boot.classList.add('out');
      setTimeout(function(){ boot.style.display = 'none'; }, 1150);
    }
    var skipBtn = $('.boot__skip', boot);
    if (skipBtn) skipBtn.addEventListener('click', finishBoot);
    window.addEventListener('keydown', function(e){ if (e.key === 'Escape') finishBoot(); });

    var seen = false;
    try { seen = sessionStorage.getItem('booted') === '1'; } catch (e) {}
    if (seen || reduce){
      boot.style.display = 'none';
      finishBoot();
    } else {
      var bt0 = null, bDur = 1600, lastIdx = -1;
      (function bootStep(ts){
        if (bootDone) return;
        if (bt0 === null) bt0 = ts;
        var k = Math.min((ts - bt0) / bDur, 1);
        var e = 1 - Math.pow(1 - k, 2.2);
        if (bootN) bootN.innerHTML = Math.round(e * 100) + '<em>%</em>';
        if (bootBar) bootBar.style.width = (e * 100).toFixed(1) + '%';
        var idx = Math.min(Math.floor(e * bootLines.length), bootLines.length - 1);
        if (idx !== lastIdx && bootLog){ lastIdx = idx; bootLog.textContent = bootLines[idx]; }
        if (k < 1) requestAnimationFrame(bootStep);
        else setTimeout(finishBoot, 280);
      })(performance.now());
      setTimeout(finishBoot, 5200);
    }
  } else {
    document.body.classList.remove('booting');
  }

  /* ---------- 1. 自定义光标（细线环 + 实心点，lerp 跟随） ---------- */
  var cur = $('#cursor'), dot = $('#cursorDot');
  if (cur && dot && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      cur.classList.add('on'); dot.classList.add('on');
    }, { passive: true });
    (function loop(){
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function(e){
      var t = e.target && e.target.closest
        ? e.target.closest('a,button,.hcard,.vid,.gallery img,.grid img,.ev-media img')
        : null;
      cur.classList.toggle('grow', !!t);
    });
    document.addEventListener('mouseleave', function(){
      cur.classList.remove('on'); dot.classList.remove('on');
    });
  }

  /* ---------- 2. 横向滚动章节 ---------- */
  var hsec = $('.hsec'), htrack = $('#htrack'), hbar = $('#hbar');
  var hsticky = hsec ? $('.hsec__sticky', hsec) : null;
  var maxX = 0;
  function setupH(){
    if (!hsec || !htrack || !hsticky) return;
    if (window.innerWidth <= 1000 || reduce){
      hsec.style.height = '';
      htrack.style.transform = '';
      maxX = 0;
      return;
    }
    var stickyH = hsticky.offsetHeight || (window.innerHeight - (head ? head.offsetHeight : 66));
    maxX = Math.max(0, htrack.scrollWidth - hsticky.clientWidth);
    hsec.style.height = (maxX + stickyH) + 'px';
  }
  function updateH(){
    if (!hsec || !htrack || !hsticky || maxX <= 0) return;
    var r = hsec.getBoundingClientRect();
    var total = hsec.offsetHeight - hsticky.offsetHeight;
    var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    htrack.style.transform = 'translateX(' + (-p * maxX).toFixed(2) + 'px)';
    if (hbar) hbar.style.width = (p * 100).toFixed(2) + '%';
  }

  /* ---------- 3. 进度条 + 顶栏 + 横向驱动 + 视差 ---------- */
  var prog = $('#prog'), head = $('#head'), heroEl = $('.hero');
  var parallax = $$('[data-parallax]');
  var pTicking = false;
  var docEl = document.documentElement;
  /* 把顶栏实际高度写入 --head-h，供各吸顶元素对齐，避免重叠/露缝 */
  function syncHeadH(){
    if (head && head.offsetHeight) docEl.style.setProperty('--head-h', head.offsetHeight + 'px');
  }
  function updateParallax(){
    var vh = window.innerHeight;
    parallax.forEach(function(img){
      var box = img.parentElement;
      if (!box) return;
      var r = box.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var k = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = 'translateY(' + (k * -26).toFixed(2) + 'px) scale(1.08)';
    });
    pTicking = false;
  }
  function onScroll(){
    var h = docEl;
    var y = h.scrollTop || document.body.scrollTop || 0;
    var max = h.scrollHeight - h.clientHeight;
    if (prog) prog.style.width = (max > 0 ? (y / max) * 100 : 0).toFixed(2) + '%';
    if (head){
      var tight = y > 40;
      if (head.classList.contains('tight') !== tight){
        head.classList.toggle('tight', tight);
        syncHeadH();
      }
    }
    if (head && heroEl) head.classList.toggle('dark', y < (heroEl.offsetTop + heroEl.offsetHeight - 72));
    updateH();
    if (!reduce && parallax.length && !pTicking){
      pTicking = true;
      requestAnimationFrame(updateParallax);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  var rzTimer;
  window.addEventListener('resize', function(){
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function(){ setupH(); onScroll(); syncHeadH(); }, 140);
  });
  window.addEventListener('load', function(){ setupH(); onScroll(); syncHeadH(); });
  setupH(); onScroll(); syncHeadH();

  /* ---------- 4. 滚动渐显 ---------- */
  var revealables = $$('.rv, .mask, .cut');
  if ('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseInt(el.getAttribute('data-d') || '0', 10);
        setTimeout(function(){ el.classList.add('in'); }, d);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    revealables.forEach(function(el){ io.observe(el); });
  } else {
    revealables.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- 5. 章节轨道高亮 ---------- */
  var rail = $('#rail');
  if (rail && 'IntersectionObserver' in window){
    var links = $$('a', rail);
    var targets = links.map(function(a){ return document.getElementById((a.getAttribute('href') || '').slice(1)); });
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var i = targets.indexOf(en.target);
        if (i < 0) return;
        links.forEach(function(a, j){ a.classList.toggle('on', j === i); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    targets.forEach(function(t){ if (t) spy.observe(t); });
  }

  /* ---------- 6. 数字计数 ---------- */
  var counters = $$('[data-count]');
  if (counters.length){
    var counted = new WeakSet();
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting || counted.has(en.target)) return;
        counted.add(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduce){ el.textContent = target + suffix; return; }
        var t0 = null, dur = 1100;
        (function step(ts){
          if (t0 === null) t0 = ts;
          var k = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(target * eased) + (k === 1 ? suffix : '');
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.4 });
    counters.forEach(function(c){ cio.observe(c); });
  }

  /* ---------- 7. 页面转场幕布 ---------- */
  var curtain = $('#curtain');
  if (curtain){
    var flag = 'dossier-nav', jumped = false;
    try { jumped = sessionStorage.getItem(flag) === '1'; sessionStorage.removeItem(flag); } catch (e) {}
    if (jumped && !reduce){
      curtain.classList.add('go');
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          curtain.classList.add('out');
          setTimeout(function(){ curtain.classList.remove('go', 'out'); }, 780);
        });
      });
    }
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!/\.html($|[?#])/.test(href)) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (reduce) return;
      e.preventDefault();
      var b = curtain.querySelector('b');
      if (b) b.textContent = /intro/.test(href) ? 'ICE'
        : (/archive/.test(href) ? 'ARCHIVE'
        : (/about/.test(href) ? 'ABOUT'
        : (/doubao/.test(href) ? 'DOUBAO' : 'HOME')));
      try { sessionStorage.setItem(flag, '1'); } catch (err) {}
      curtain.classList.remove('out');
      curtain.classList.add('go');
      setTimeout(function(){ window.location.href = href; }, 620);
    });
  }

  /* ---------- 8. 档案筛选 ---------- */
  var filters = $('#filters');
  if (filters){
    var btns = $$('button', filters), recs = $$('.record'), out = $('#resultCount');
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        var f = b.getAttribute('data-filter');
        btns.forEach(function(x){
          var on = x === b;
          x.classList.toggle('active', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        var n = 0;
        recs.forEach(function(r){
          var show = (f === 'all') || (r.getAttribute('data-kind') === f);
          r.hidden = !show;
          var d = r.querySelector('details');
          if (d && !show) d.open = false;
          if (show) n++;
        });
        if (out) out.textContent = (f === 'all')
          ? ('显示全部 ' + n + ' 个案例')
          : (b.textContent.replace(/\s*\d+\s*$/, '') + ' · 显示 ' + n + ' 个案例');
      });
    });
  }

  /* ---------- 9. 档案展开：互斥 + 复制 + 收起 ---------- */
  var details = $$('.record details');
  details.forEach(function(d){
    d.addEventListener('toggle', function(){
      if (!d.open) return;
      details.forEach(function(o){ if (o !== d && o.open) o.open = false; });
      var card = d.closest('.record');
      if (card && !reduce){
        setTimeout(function(){
          window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
        }, 60);
      }
    });
  });
  $$('[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var url = new URL('#' + btn.getAttribute('data-copy'), location.href).href;
      var ok = function(){
        var old = btn.textContent;
        btn.textContent = '已复制 ✓';
        setTimeout(function(){ btn.textContent = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(ok, function(){ window.prompt('复制此链接', url); });
      } else { window.prompt('复制此链接', url); }
    });
  });
  $$('[data-close]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var d = btn.closest('details');
      if (d) d.open = false;
    });
  });

  /* ---------- 10. 视频点击播放 ---------- */
  $$('.vid .box').forEach(function(box){
    box.addEventListener('click', function(){
      var src = box.getAttribute('data-video');
      if (!src || box.querySelector('video')) return;
      var v = document.createElement('video');
      v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0';
      var img = box.querySelector('img');
      if (img) img.style.display = 'none';
      box.appendChild(v);
    });
  });

  /* ---------- 11. 长图卷轴 ---------- */
  $$('[data-scrollframe]').forEach(function(fr){
    fr.addEventListener('click', function(){
      if (window.matchMedia('(hover: hover)').matches) return;
      fr.classList.toggle('on');
    });
  });

  /* ---------- 12. 灯箱 ---------- */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbX = $('#lbX');
  if (lb && lbImg){
    document.addEventListener('click', function(e){
      var img = e.target && e.target.closest ? e.target.closest('.gallery img, .grid img, .ev-media img') : null;
      if (!img) return;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      if (typeof lb.showModal === 'function') lb.showModal();
      else lb.setAttribute('open', '');
    });
    if (lbX) lbX.addEventListener('click', function(){
      if (typeof lb.close === 'function') lb.close(); else lb.removeAttribute('open');
    });
    lb.addEventListener('click', function(e){ if (e.target === lb && lbX) lbX.click(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && lb.open && lbX) lbX.click(); });
  }

  /* ---------- 14. 首屏数据网络（跨境 / 金融 / AI 的数据流） ---------- */
  var net = document.getElementById('net');
  var telN = document.getElementById('telNodes'), telL = document.getElementById('telLinks');
  if (net && net.getContext){
    var nc = net.getContext('2d');
    var NW = 0, NH = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], pkts = [], LINK = 134, frame = 0;
    var nm = { x: -9999, y: -9999, on: false };

    function netResize(){
      var r = net.getBoundingClientRect();
      if (!r.width || !r.height) return;
      NW = r.width; NH = r.height;
      net.width = Math.round(NW * dpr); net.height = Math.round(NH * dpr);
      nc.setTransform(dpr, 0, 0, dpr, 0, 0);
      netBuild();
    }
    function netPkt(){
      return {
        a: (Math.random() * nodes.length) | 0,
        b: (Math.random() * nodes.length) | 0,
        t: Math.random(),
        sp: 0.0024 + Math.random() * 0.0042,
        hot: Math.random() < 0.4
      };
    }
    function netBuild(){
      var count = Math.round(clamp((NW * NH) / 22000, 26, 84));
      nodes = [];
      for (var i = 0; i < count; i++){
        nodes.push({
          x: Math.random() * NW, y: Math.random() * NH,
          vx: (Math.random() - 0.5) * (reduce ? 0 : 0.18),
          vy: (Math.random() - 0.5) * (reduce ? 0 : 0.18),
          r: Math.random() < 0.18 ? 2 : 1.1,
          hot: Math.random() < 0.22
        });
      }
      pkts = [];
      var pn = Math.max(6, Math.round(count * 0.3));
      for (var j = 0; j < pn; j++) pkts.push(netPkt());
      if (telN) telN.textContent = (nodes.length < 10 ? '0' : '') + nodes.length;
    }
    function netDraw(){
      if (!NW || !NH) return;
      nc.clearRect(0, 0, NW, NH);
      var i, j, a, b, dx, dy, d, links = 0;
      nc.lineWidth = 1;
      if (!reduce){
        for (i = 0; i < nodes.length; i++){
          a = nodes[i];
          a.x += a.vx; a.y += a.vy;
          if (a.x < -24) a.x = NW + 24; else if (a.x > NW + 24) a.x = -24;
          if (a.y < -24) a.y = NH + 24; else if (a.y > NH + 24) a.y = -24;
        }
      }
      for (i = 0; i < nodes.length; i++){
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++){
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          links++;
          nc.strokeStyle = 'rgba(127,168,255,' + ((1 - d / LINK) * 0.3).toFixed(3) + ')';
          nc.beginPath(); nc.moveTo(a.x, a.y); nc.lineTo(b.x, b.y); nc.stroke();
        }
      }
      if (nm.on){
        for (i = 0; i < nodes.length; i++){
          a = nodes[i];
          dx = a.x - nm.x; dy = a.y - nm.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d > 152) continue;
          nc.strokeStyle = 'rgba(155,140,255,' + ((1 - d / 152) * 0.45).toFixed(3) + ')';
          nc.beginPath(); nc.moveTo(a.x, a.y); nc.lineTo(nm.x, nm.y); nc.stroke();
        }
        nc.fillStyle = 'rgba(127,168,255,.9)';
        nc.beginPath(); nc.arc(nm.x, nm.y, 2.6, 0, 6.2832); nc.fill();
      }
      for (i = 0; i < nodes.length; i++){
        a = nodes[i];
        dx = a.x - nm.x; dy = a.y - nm.y;
        var hl = nm.on && Math.sqrt(dx * dx + dy * dy) < 122;
        nc.beginPath(); nc.arc(a.x, a.y, hl ? a.r + 1.3 : a.r, 0, 6.2832);
        nc.fillStyle = hl ? 'rgba(233,238,245,.95)' : (a.hot ? 'rgba(155,140,255,.72)' : 'rgba(127,168,255,.58)');
        nc.fill();
      }
      if (!reduce){
        for (i = 0; i < pkts.length; i++){
          var p = pkts[i];
          a = nodes[p.a]; b = nodes[p.b];
          if (!a || !b){ pkts[i] = netPkt(); continue; }
          p.t += p.sp;
          if (p.t >= 1){ pkts[i] = netPkt(); continue; }
          var px = a.x + (b.x - a.x) * p.t, py = a.y + (b.y - a.y) * p.t;
          nc.strokeStyle = p.hot ? 'rgba(155,140,255,.26)' : 'rgba(127,168,255,.26)';
          nc.beginPath(); nc.moveTo(a.x, a.y); nc.lineTo(px, py); nc.stroke();
          nc.beginPath(); nc.arc(px, py, 1.7, 0, 6.2832);
          nc.fillStyle = p.hot ? 'rgba(155,140,255,.92)' : 'rgba(233,238,245,.92)';
          nc.fill();
        }
      }
      if (telL && (frame++ % 24 === 0)) telL.textContent = (links < 10 ? '0' : '') + links;
    }
    function netVisible(){
      if (!heroEl) return true;
      var r = heroEl.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    }
    function netLoop(){
      if (NW && NH && netVisible()) netDraw();
      requestAnimationFrame(netLoop);
    }
    netResize();
    if (reduce){ if (NW && NH) netDraw(); }
    else requestAnimationFrame(netLoop);
    var netRz;
    window.addEventListener('resize', function(){
      clearTimeout(netRz);
      netRz = setTimeout(netResize, 160);
    });
    if (heroEl && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      heroEl.addEventListener('mousemove', function(e){
        var r = net.getBoundingClientRect();
        nm.x = e.clientX - r.left; nm.y = e.clientY - r.top; nm.on = true;
      }, { passive: true });
      heroEl.addEventListener('mouseleave', function(){ nm.on = false; });
    }
  }

  /* ---------- 13. 平滑锚点 ---------- */
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 78, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();

(function () {
  function openLinkedRecord() {
    var id = location.hash.slice(1);
    if (!/^f(?:0[1-9]|10)$/.test(id)) return;
    var record = document.getElementById(id);
    var details = record && record.querySelector('details');
    if (!details) return;
    if (record.hidden) document.querySelector('[data-filter="all"]').click();
    details.open = true;
    record.scrollIntoView();
  }

  window.addEventListener('hashchange', openLinkedRecord);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openLinkedRecord);
  } else {
    openLinkedRecord();
  }
})();
