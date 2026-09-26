/* S.E.R con vos — main.js (IIFE, sin módulos) */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hoy = new Date();
  var meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var dias = ["dom","lun","mar","mié","jue","vie","sáb"];

  /* ---------- Nav: sombra al scrollear, menú móvil, scroll-spy, anclas ---------- */
  function initNav() {
    var header = $("[data-header]"), menu = $("#menu"), toggle = $("[data-menu-toggle]");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (a.dataset.motivo) {
        var sel = $("#cMotivo");
        $$("option", sel).forEach(function (o) { if (o.textContent === a.dataset.motivo) sel.value = o.value; });
      }
      menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
      var top = id === "#inicio" ? 0 : el.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
      try { history.replaceState(null, "", id); } catch (_) {}
    });

    var links = $$(".menu a");
    var map = {};
    links.forEach(function (l) { map[l.getAttribute("href").slice(1)] = l; });
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove("is-active"); });
          if (map[en.target.id]) map[en.target.id].classList.add("is-active");
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      $$("main > section[id]").forEach(function (s) { spy.observe(s); });
    }

    // Deep link (#herramientas, etc.)
    var h = (location.hash || "").slice(1);
    if (h && /^[\w-]+$/.test(h) && document.getElementById(h)) {
      setTimeout(function () {
        var el = document.getElementById(h);
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1, behavior: "auto" });
      }, 60);
    }
  }

  /* ---------- Reveal (threshold bajo + red de seguridad 6s) ---------- */
  function initReveal() {
    var items = $$("[data-reveal], [data-bars]");
    var done = function (el) {
      el.classList.add("is-in");
      if (el.matches(".stats")) countUp(el);
      var bars = el.matches("[data-bars]") ? el : el.querySelector("[data-bars]");
      if (bars) bars.classList.add("is-in");
    };
    if (!("IntersectionObserver" in window)) { items.forEach(done); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { done(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el, i) {
      var sib = el.parentElement ? $$(":scope > [data-reveal]", el.parentElement) : [];
      var idx = sib.indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 90, 360) + "ms";
      io.observe(el);
    });
    setTimeout(function () {
      items.forEach(function (el) { if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight) done(el); });
    }, 6000);
  }

  function countUp(root) {
    $$("[data-count]", root).forEach(function (el) {
      if (el.dataset.counted) return; el.dataset.counted = "1";
      var to = +el.dataset.count, t0 = null, dur = 1400;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = "0"; requestAnimationFrame(step);
    });
  }

  /* ---------- Fecha en el mockup ---------- */
  function initToday() {
    $$("[data-today]").forEach(function (el) { el.textContent = dias[hoy.getDay()] + " " + hoy.getDate() + " de " + meses[hoy.getMonth()]; });
  }

  /* ---------- Tabs de herramientas ---------- */
  function initTabs() {
    var tabs = $$("[data-tabs] .tab");
    var show = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute("aria-controls"));
        p.hidden = !on;
        if (on) { p.classList.remove("enter"); void p.offsetWidth; p.classList.add("enter"); }
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") show(tabs[(i + 1) % tabs.length], true);
        if (e.key === "ArrowLeft") show(tabs[(i - 1 + tabs.length) % tabs.length], true);
      });
    });
    show(tabs[0]);
  }

  /* ---------- Semáforo ---------- */
  /* ---------- Alerta por WhatsApp (CallMeBot) — demo: los 3 niveles en rojo ---------- */
  var sentKey = "";
  function sendWhatsApp(status) {
    var C = window.SER_CONFIG || {};
    var em = C.email || {}, tg = C.telegram || {}, wa = C.whatsapp || {};
    var hasEm = !!(em.serviceId && em.templateId && em.publicKey && em.to);
    var hasTg = !!(tg.token && tg.chatId), hasWa = !!(wa.phone && wa.apikey);
    var key = hoy.toDateString();
    if (sentKey === key) return;              // no repetir el envío con cada clic
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    var fecha = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
    var box = function (cls, icon, html) { status.innerHTML = '<div class="alert ' + cls + ' pop"><svg><use href="#' + icon + '"/></svg><div>' + html + '</div></div>'; };
    if (!hasEm && !hasTg && !hasWa) {
      box("info", "i-info", "<b>Alerta roja detectada.</b> Para que llegue el aviso por email, completá los datos de EmailJS en el archivo <code>config.js</code>.");
      return;
    }
    sentKey = key;
    var text = "Un paciente marcó ROJO en los tres niveles del semáforo de bienestar: físico, mental y espiritual.\n" +
      "Fecha: " + fecha + " · " + hh + " h\n" +
      "Acción sugerida: contactar a la familia y avisar a la guardia de la institución.\n" +
      "(Mensaje de demostración)";
    var canal = hasEm ? "email" : hasTg ? "Telegram" : "WhatsApp";
    box("bad", "i-bell", "<b>Enviando alerta por " + canal + " al coordinador…</b>");
    var done = function () {
      box("bad", "i-bell", "<b>Alerta enviada por " + canal + "</b> · " + hh + " h<br>Rojo en los tres niveles. El coordinador recibe el aviso al instante para comunicarse con la familia y notificar a la guardia.");
    };
    var fail = function (why) {
      sentKey = "";
      box("info", "i-info", "<b>No se pudo enviar la alerta.</b> " + (why || "Revisá la conexión a internet y los datos de <code>config.js</code>, y volvé a marcar los colores."));
    };
    try {
      if (hasEm) {
        fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: em.serviceId, template_id: em.templateId, user_id: em.publicKey,
            template_params: { to_email: em.to, fecha: fecha, hora: hh, niveles: "Físico, Mental y Espiritual", mensaje: text }
          })
        }).then(function (r) {
          if (r.ok) return done();
          return r.text().then(function (t) { fail("EmailJS respondió: " + (t || r.status) + ". Revisá los tres códigos de <code>config.js</code>."); });
        }, function () { fail(); });
      } else if (hasTg) {
        var url = "https://api.telegram.org/bot" + String(tg.token).trim() + "/sendMessage?chat_id=" + encodeURIComponent(tg.chatId) + "&text=" + encodeURIComponent("ALERTA ROJA - S.E.R con vos\n" + text);
        fetch(url, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (j) {
          if (j && j.ok) done(); else fail("Telegram respondió: " + ((j && j.description) || "error") + ".");
        }).catch(function () { fetch(url, { mode: "no-cors" }).then(done, function () { fail(); }); });
      } else {
        var wurl = "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent(wa.phone) + "&text=" + encodeURIComponent("ALERTA ROJA - S.E.R con vos\n" + text) + "&apikey=" + encodeURIComponent(wa.apikey);
        fetch(wurl, { mode: "no-cors", cache: "no-store" }).then(done, function () { fail(); });
      }
    } catch (_) { fail(); }
  }

  function initSemaforo() {
    var dims = [["fisico", "Físico"], ["mental", "Mental"], ["espiritual", "Espiritual"]];
    var hist = { fisico: ["v","v","a","a","v","a"], mental: ["a","v","v","a","a","r"], espiritual: ["v","v","v","a","v","v"] };
    var today = { fisico: null, mental: null, espiritual: null };
    var status = $("[data-sem-status]");
    var render = function () {
      var h = "<span></span>";
      for (var i = 6; i >= 0; i--) { var d = new Date(hoy); d.setDate(d.getDate() - i); h += '<span class="h">' + (i === 0 ? "hoy" : dias[d.getDay()]) + "</span>"; }
      dims.forEach(function (d) {
        h += '<span class="rl">' + d[1] + "</span>";
        hist[d[0]].forEach(function (c) { h += '<span class="c ' + c + '"></span>'; });
        h += '<span class="c today ' + (today[d[0]] || "") + '"></span>';
      });
      $("[data-hist]").innerHTML = h;
    };
    $("[data-sem-form]").addEventListener("click", function (e) {
      var b = e.target.closest(".light"); if (!b) return;
      today[b.dataset.dim] = b.dataset.c;
      $$('.light[data-dim="' + b.dataset.dim + '"]').forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      status.innerHTML = ""; render();
      if (today.fisico === "r" && today.mental === "r" && today.espiritual === "r") sendWhatsApp(status);
      else sentKey = "";
    });
    $("[data-sem-save]").addEventListener("click", function () {
      if (!today.fisico || !today.mental || !today.espiritual) {
        status.innerHTML = '<div class="alert info pop"><svg><use href="#i-info"/></svg><div>Elegí un color para los tres niveles antes de registrar el día.</div></div>'; return;
      }
      var alerts = [];
      if (today.fisico === "r" && hist.fisico[5] === "r") alerts.push("dolor físico");
      if (today.mental === "r" && hist.mental[5] === "r") alerts.push("angustia mental");
      var hh = String(hoy.getHours()).padStart(2, "0") + ":" + String(hoy.getMinutes()).padStart(2, "0");
      if (alerts.length) {
        status.innerHTML = '<div class="alert bad pop"><svg><use href="#i-bell"/></svg><div><b>Alerta enviada al coordinador</b> · ' + hh + ' h (simulación)<br>Rojo en ' + alerts.join(" y ") + ' dos días seguidos. El coordinador se comunica con la familia y notifica a la guardia de la institución.</div></div>';
      } else if (today.fisico === "r" || today.mental === "r") {
        status.innerHTML = '<div class="alert info pop"><svg><use href="#i-info"/></svg><div><b>Día registrado.</b> Hoy hay un nivel en rojo. Si mañana se repite, se enviará una alerta al coordinador.</div></div>';
      } else {
        status.innerHTML = '<div class="alert ok pop"><svg><use href="#i-check"/></svg><div><b>Día registrado.</b> Sin alertas. Gracias por contarnos cómo estás.</div></div>';
      }
    });
    render();
  }

  /* ---------- Guía S.E.R ---------- */
  function initGuia() {
    var kb = [
      { k: ["cud","certificado","discapacidad"], chip: "¿Cómo tramito el CUD?", a: "El <b>Certificado Único de Discapacidad (CUD)</b> se tramita ante la Junta Evaluadora de tu localidad. En general piden DNI, un certificado médico reciente con el diagnóstico y los estudios que lo respalden.<br><br>Con el CUD accedés a cobertura total de las prestaciones vinculadas y a transporte público gratuito. Tu coordinador te ayuda a armar la carpeta y pedir el turno.", src: "Ficha S.E.R · Trámites · CUD" },
      { k: ["medicacion","medicamento","remedio","oncologic","quimio","droga"], chip: "Cobertura de medicación", a: "Las obras sociales y prepagas deben cubrir el <b>100% de la medicación oncológica</b> según el Programa Médico Obligatorio. Presentá la receta con el diagnóstico y el protocolo indicado.<br><br>Si no tenés cobertura, el servicio social del hospital público puede gestionarla a través de los programas nacionales y provinciales de provisión de medicamentos.", src: "Ficha S.E.R · Coberturas" },
      { k: ["insumo","cama","oxigeno","silla","concentrador","ortoped","pañal"], chip: "Cama ortopédica u oxígeno", a: "Para pedir <b>cama ortopédica, silla de ruedas o concentrador de oxígeno</b>:<br>1. Pedí al médico una prescripción con diagnóstico y justificación.<br>2. Presentala en tu obra social, PAMI o prepaga, o en el servicio social del hospital público.<br>3. Guardá la copia y el número de trámite.<br><br>Si hay demoras, tu coordinador hace el seguimiento.", src: "Ficha S.E.R · Insumos" },
      { k: ["traslado","transporte","colectivo","ambulancia","remis","viaje"], chip: "Traslados a tratamiento", a: "Si tenés obra social o prepaga, pedí al médico una orden de traslado con la indicación y presentala a tu cobertura.<br><br>Con el CUD, el transporte público es gratuito para la persona y un acompañante (Ley 25.635).", src: "Ficha S.E.R · Traslados" },
      { k: ["paliativo","ley","derecho"], chip: "Derechos en cuidados paliativos", a: "La <b>Ley 27.678 de Cuidados Paliativos</b> (2022) reconoce el derecho de las personas con enfermedades que amenazan o limitan la vida, y de sus familias, a recibir cuidados paliativos en el sector público, las obras sociales y las prepagas.", src: "Ficha S.E.R · Derechos" },
      { k: ["licencia","trabajo","empleo","cuidador","permiso"], chip: "Licencia para el cuidador", a: "La Ley de Contrato de Trabajo no prevé una licencia específica para cuidar a un familiar enfermo, pero muchos convenios colectivos y estatutos sí la incluyen.<br><br>Revisá tu convenio o consultá en Recursos Humanos. En el programa te ayudamos a ver qué te corresponde.", src: "Ficha S.E.R · Cuidadores" },
      { k: ["dato","privacidad","confidencial"], chip: "¿Quién ve mis datos?", a: "Tus registros solo los ven el coordinador de S.E.R y el interlocutor médico de la institución. Se protegen según la <b>Ley 25.326</b> y se destruyen si el convenio termina.", src: "Ficha S.E.R · Privacidad" },
      { k: ["urgencia","emergencia","guardia","107"], chip: "Tengo una urgencia", a: "Si hay una urgencia, <b>llamá al 107</b> o al servicio de emergencias de tu cobertura. La Guía S.E.R no reemplaza la atención médica.", src: "Ficha S.E.R · Emergencias" }
    ];
    var msgs = $("[data-msgs]"), chips = $("[data-chips]");
    if (chips.children.length === 0) chips.innerHTML = kb.map(function (e) { return '<button class="chip" type="button">' + e.chip + "</button>"; }).join("");
    var add = function (html, who, src) {
      var m = document.createElement("div"); m.className = "msg " + who;
      m.innerHTML = html + (src ? '<span class="src">Fuente: ' + src + "</span>" : "");
      msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; return m;
    };
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    var answer = function (q) {
      add(esc(q), "me");
      var t = add('<span class="typing"><i></i><i></i><i></i></span>', "bot");
      var nq = norm(q);
      var hit = kb.filter(function (e) { return e.k.some(function (k) { return nq.indexOf(norm(k)) > -1; }); })[0];
      setTimeout(function () {
        t.remove();
        if (hit) add(hit.a, "bot", hit.src);
        else add("No encuentro esa consulta en la base validada de S.E.R. Se la paso a tu coordinador de enlace, que te responde durante el día.<br><br>Mientras tanto, podés preguntarme por el CUD, medicación, insumos, traslados o licencias.", "bot");
      }, 700);
    };
    chips.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (c) answer(c.textContent); });
    $("[data-chat-form]").addEventListener("submit", function (e) {
      e.preventDefault(); var i = $("#chatInput"), v = i.value.trim(); if (!v) return; i.value = ""; answer(v);
    });
  }

  /* ---------- Botiquín: filtros + respiración ---------- */
  function initBotiquin() {
    $("[data-filters]").addEventListener("click", function (e) {
      var b = e.target.closest("[data-f]"); if (!b) return;
      $$("[data-filters] .chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      $$("[data-res] .res").forEach(function (r) { r.hidden = !(b.dataset.f === "all" || r.dataset.t === b.dataset.f); });
    });
    var orb = $("[data-orb]"), btn = $("[data-breath]"), cnt = $("[data-breath-count]");
    var timer = null, running = false;
    var stop = function (msg) { running = false; clearTimeout(timer); orb.classList.remove("big"); orb.textContent = msg || "Listo"; btn.textContent = "Empezar"; cnt.textContent = "5 ciclos"; };
    btn.addEventListener("click", function () {
      if (running) { stop(); return; }
      running = true; btn.textContent = "Detener";
      var phases = [["Inhalá", 4000, true, 4], ["Sostené", 2000, true, 4], ["Exhalá", 6000, false, 6]];
      var cycle = 0, p = 0;
      var step = function () {
        if (!running) return;
        if (p === 0) { cycle++; if (cycle > 5) { stop("Muy bien"); return; } cnt.textContent = "Ciclo " + cycle + " de 5"; }
        var ph = phases[p];
        orb.style.transitionDuration = ph[3] + "s";
        orb.classList.toggle("big", ph[2]); orb.textContent = ph[0];
        p = (p + 1) % 3; timer = setTimeout(step, ph[1]);
      };
      step();
    });
  }

  /* ---------- Capacitación ---------- */
  function initCapacitacion() {
    var vids = [
      ["i-gauge", "Cómo tomar la presión arterial", ["Que la persona descanse sentada o acostada 5 minutos antes.", "Apoyar el brazo a la altura del corazón, sin ropa ajustada.", "Colocar el manguito 2 o 3 cm por encima del pliegue del codo.", "No hablar ni moverse durante la medición.", "Anotar los dos valores, el pulso y la hora."]],
      ["i-finger", "Cómo leer un saturómetro", ["Usar un dedo limpio, sin esmalte, con la mano tibia.", "Colocar el saturómetro y esperar a que el número se estabilice.", "SpO₂ es el porcentaje de oxígeno; PR o LPM es el pulso.", "Anotar el valor y la hora.", "Si el valor es más bajo que el indicado por el equipo médico, comunicarse con ellos."]],
      ["i-bed", "Cambios de posición en la cama", ["Cambiar de posición con la frecuencia que indique el equipo, en general cada 2 horas.", "Usar almohadas entre las rodillas y debajo de los talones.", "Revisar a diario sacro, caderas, talones y codos.", "Mantener la piel limpia y seca, y las sábanas sin arrugas.", "Avisar si aparece una zona roja que no se aclara."]],
      ["i-drop", "Higiene en la cama", ["Preparar todo antes: palanganas, toallas, jabón neutro y ropa limpia.", "Descubrir solo la zona que se lava y tapar el resto.", "Ir de las zonas más limpias a las menos limpias.", "Secar bien los pliegues de la piel.", "Hidratar la piel y cambiar la ropa de cama si hace falta."]],
      ["i-pill", "Organizar la medicación", ["Pasar las indicaciones a una planilla con horarios fijos.", "Usar un pastillero semanal con días y turnos.", "Anotar cada dosis y las dosis de rescate indicadas.", "Llevar la planilla a cada consulta.", "No cambiar dosis sin consultar al equipo médico."]],
      ["i-lift", "Movilizar sin lastimarte", ["Explicarle a la persona lo que van a hacer juntos.", "Separar los pies, flexionar las rodillas y mantener la espalda recta.", "Acercar tu cuerpo al de la persona antes de hacer fuerza.", "Usar una sábana de arrastre para deslizar en lugar de levantar.", "Pedir ayuda cuando el movimiento requiere dos personas."]]
    ];
    var seen = {}, cur = 0, prog = null, pct = 0;
    var list = $("[data-lessons]");
    var renderList = function () {
      list.innerHTML = vids.map(function (v, i) {
        return '<button type="button" class="lesson" data-v="' + i + '" aria-current="' + (i === cur) + '"><span class="li"><svg><use href="#' + v[0] + '"/></svg></span><b>' + v[1] + '</b><span class="dur' + (seen[i] ? " seen" : "") + '">' + (seen[i] ? "✓ Visto" : "2:00") + "</span></button>";
      }).join("");
    };
    var fmt = function (p) { var s = Math.round(120 * p / 100); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
    var setPlay = function (playing) { $("[data-p-play]").innerHTML = '<svg><use href="#' + (playing ? "i-pause" : "i-play") + '"/></svg>'; $("[data-p-play]").setAttribute("aria-label", playing ? "Pausar" : "Reproducir"); };
    var open = function (i) {
      cur = i; clearInterval(prog); prog = null; pct = 0; setPlay(false);
      var v = vids[i];
      $("[data-p-icon]").innerHTML = '<use href="#' + v[0] + '"/>';
      $("[data-p-title]").textContent = v[1];
      $("[data-p-bar]").style.width = "0%"; $("[data-p-time]").textContent = "0:00 / 2:00";
      $("[data-steps]").innerHTML = '<b style="font-family:var(--display);color:var(--blue-deep)">' + v[1] + "</b><ol>" + v[2].map(function (s) { return "<li>" + s + "</li>"; }).join("") + '</ol><p class="tiny">Orientación general. Seguí siempre las indicaciones del equipo de salud del paciente.</p>';
      renderList();
    };
    list.addEventListener("click", function (e) { var b = e.target.closest("[data-v]"); if (b) open(+b.dataset.v); });
    $("[data-p-play]").addEventListener("click", function () {
      if (prog) { clearInterval(prog); prog = null; setPlay(false); return; }
      if (pct >= 100) pct = 0;
      setPlay(true);
      prog = setInterval(function () {
        pct = Math.min(pct + 2.5, 100);
        $("[data-p-bar]").style.width = pct + "%"; $("[data-p-time]").textContent = fmt(pct) + " / 2:00";
        if (pct >= 100) { clearInterval(prog); prog = null; setPlay(false); seen[cur] = true; renderList(); }
      }, 100);
    });
    open(0);
  }

  /* ---------- Doná ---------- */
  function initDona() {
    var amt = 10000, freq = "mensual";
    var fmt = function (n) { return "$" + n.toLocaleString("es-AR"); };
    var render = function () {
      $$("[data-amounts] .amount").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.a) === String(amt) ? "true" : "false"); });
      $("[data-otro]").hidden = amt !== "otro";
      var n = amt === "otro" ? (+$("#otroMonto").value || 0) : amt;
      $("[data-impact]").textContent = n ? "Con " + fmt(n) + (freq === "mensual" ? " por mes" : "") + " ayudás a sostener el acompañamiento de familias en hospitales públicos del AMBA." : "Ingresá el monto que quieras aportar.";
    };
    $("[data-amounts]").addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (!b) return; amt = b.dataset.a === "otro" ? "otro" : +b.dataset.a; render(); });
    $("#otroMonto").addEventListener("input", render);
    $$(".seg button").forEach(function (b) { b.addEventListener("click", function () { freq = b.dataset.freq; $$(".seg button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); render(); }); });
    $("[data-dona-btn]").addEventListener("click", function () { $("[data-dona-msg]").hidden = false; });
    render();
  }

  /* ---------- Contacto ---------- */
  function initContacto() {
    $("[data-contact]").addEventListener("submit", function (e) { e.preventDefault(); $("[data-contact-ok]").hidden = false; });
    $("[data-copy]").addEventListener("click", function () {
      var b = this, t = $("[data-mail]").textContent;
      var sel = function () { var r = document.createRange(); r.selectNodeContents($("[data-mail]")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); };
      try {
        navigator.clipboard.writeText(t).then(function () { b.textContent = "Copiado"; setTimeout(function () { b.textContent = "Copiar"; }, 1500); }, sel);
      } catch (_) { sel(); }
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initToday, "initToday");
    safe(initReveal, "initReveal");
    safe(initTabs, "initTabs");
    safe(initSemaforo, "initSemaforo");
    safe(initGuia, "initGuia");
    safe(initBotiquin, "initBotiquin");
    safe(initCapacitacion, "initCapacitacion");
    safe(initDona, "initDona");
    safe(initContacto, "initContacto");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
