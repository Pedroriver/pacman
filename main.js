/* ============================================================
   CRIATURAS — Calamar + Pac-Man en un solo escenario
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const escenario = document.getElementById('escenario');
  if (!escenario) return;

  /* ============================================================
     CALAMAR
     ============================================================ */
    /* ---------- BURBUJAS DE FONDO ---------- */
  const crearBurbujas = () => {
    const NUM_BURBUJAS = 15;
    for (let i = 0; i < NUM_BURBUJAS; i++) {
      const burbuja = document.createElement('div');
      burbuja.className = 'burbuja';
      const tamaño = 4 + Math.random() * 14;
      burbuja.style.width = tamaño + 'px';
      burbuja.style.height = tamaño + 'px';
      burbuja.style.left = Math.random() * 100 + '%';
      burbuja.style.animationDuration = (6 + Math.random() * 8) + 's';
      burbuja.style.animationDelay = (Math.random() * 10) + 's';
      escenario.appendChild(burbuja);
    }
  };
  crearBurbujas();
   const canvas = document.getElementById('calamar-canvas');
  const ctx = canvas.getContext('2d');
  const PI2 = Math.PI * 2;

  const mouse = { x: 0, y: 0, angle: 0 };
  const gravity = 0.1;
  const friction = 0.95;

  let w, wH, h, hH;
  const radius = 30;
  let squid;
  const tentacleWidth = 8;
  const numTentacles = 6;
  const numPoints = 10;
  let particles = [];
  let tentacles;

  const distanceBetween = (p1, p2) =>
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  const angleBetween = (x1, y1, x2, y2) =>
    Math.atan2(y2 - y1, x2 - x1);
  const randomBetween = (min, max) =>
    Math.floor((Math.random() * (max - min + 1)) + min);

  const onResizeCalamar = () => {
    const rect = escenario.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    wH = w >> 1;
    hH = h >> 1;
    canvas.width = w;
    canvas.height = h;
  };

  const updateStage = () => {
    onResizeCalamar();
    mouse.x = wH;
    mouse.y = hH;
    squid = {
      x: mouse.x, y: mouse.y, radius,
      bodyWidth: radius * 2, bodyHeight: 30,
      angle: 0, velocity: 0
    };
    tentacles = [];
    let connectionX = squid.x - squid.radius - tentacleWidth;
    const incX = squid.bodyWidth / (numTentacles - 1);
    for (let i = 0; i < numTentacles; i++) {
      const length = randomBetween(5, 20);
      const tentacle = { length, connections: [] };
      let connectionY = squid.y + squid.bodyHeight;
      for (let q = 0; q < numPoints; q++) {
        tentacle.connections.push({
          x: connectionX, y: connectionY,
          oldX: connectionX, oldY: connectionY
        });
        connectionY += length;
      }
      connectionX += incX;
      tentacles.push(tentacle);
    }
  };

  const updatePoints = () => {
    tentacles.forEach((tentacle) => {
      tentacle.connections.forEach((point) => {
        const velX = point.x - point.oldX;
        const velY = point.y - point.oldY;
        point.oldX = point.x;
        point.oldY = point.y;
        point.x += velX * friction;
        point.y += velY * friction;
        point.y += gravity;
      });
    });
  };

  const updateSticks = () => {
    tentacles.forEach((tentacle) => {
      const { length, connections } = tentacle;
      for (let i = 0; i < connections.length - 1; i++) {
        const from = connections[i];
        const to = connections[i + 1];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = distanceBetween(from, to);
        const difference = length - distance;
        const percent = difference / distance / 2;
        const offsetX = dx * percent;
        const offsetY = dy * percent;
        from.x -= offsetX;
        from.y -= offsetY;
        to.x += offsetX;
        to.y += offsetY;
      }
    });
  };

  const connectTentacles = () => {
    let x = squid.x - squid.radius + (tentacleWidth / 2);
    let y = squid.y + squid.bodyHeight;
    const posInc = (squid.bodyWidth - tentacleWidth) / (tentacles.length - 1);
    tentacles.forEach((tentacle) => {
      const connector = tentacle.connections[0];
      const angleDiff = angleBetween(squid.x, squid.y, x, y);
      const dx = squid.x - x;
      const dy = squid.y - y;
      const hh = Math.sqrt(dx * dx + dy * dy);
      connector.x = squid.x + Math.cos(angleDiff + squid.angle) * hh;
      connector.y = squid.y + Math.sin(angleDiff + squid.angle) * hh;
      x += posInc;
    });
  };

  const drawTentacles = () => {
    tentacles.forEach((tentacle) => {
      const { connections } = tentacle;
      ctx.beginPath();
      ctx.lineWidth = tentacleWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1d1d1d';
      ctx.moveTo(connections[0].x, connections[0].y);
      connections.slice(1).forEach((connector) => {
        ctx.lineTo(connector.x, connector.y);
      });
      ctx.stroke();
      ctx.closePath();
    });
  };

  const updateSquid = () => {
    const newX = squid.x + (mouse.x - squid.x) / 50;
    const newY = squid.y + (mouse.y - squid.y) / 50;
    const velocity = squid.x - newX;
    squid.angle = -velocity * 0.1;
    squid.velocity = velocity;
    squid.x = newX;
    squid.y = newY;
  };

  const drawSquid = () => {
    const eyeXInc = Math.cos(mouse.angle) * 5;
    const eyeYInc = Math.sin(mouse.angle) * 5;
    const eyeXInc2 = Math.cos(mouse.angle) * 10;
    const eyeYInc2 = Math.sin(mouse.angle) * 10;

    ctx.save();
    ctx.translate(squid.x, squid.y);
    ctx.rotate(squid.angle);

    ctx.beginPath();
    ctx.fillStyle = '#1d1d1d';
    ctx.rect(-squid.radius, 0, squid.bodyWidth, squid.bodyHeight);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#1d1d1d';
    ctx.arc(0, 0, squid.radius, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(-15 + eyeXInc, eyeYInc, 4, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(18 + eyeXInc2, eyeYInc2, 6, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  };

  const drawParticles = () => {
    particles.forEach((p) => {
      p.radius *= 1.025;
      p.life *= 0.97;
      p.isDead = p.life <= 0.1;
      p.x += Math.cos(p.angle) * p.velocity;
      p.y += Math.sin(p.angle) * p.velocity;
      ctx.beginPath();
      ctx.fillStyle = `rgba(29, 29, 29, ${p.life})`;
      ctx.arc(p.x, p.y, p.radius, 0, PI2, false);
      ctx.fill();
      ctx.closePath();
    });
    particles = particles.filter((p) => !p.isDead);
  };

  const clearCalamar = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const loopCalamar = () => {
    clearCalamar();
    drawParticles();
    updateSquid();
    updatePoints();
    updateSticks();
    connectTentacles();
    drawTentacles();
    drawSquid();

    if (Math.abs(squid.velocity) > 2 && particles.length < 200) {
      tentacles.forEach((tentacle) => {
        const pos = tentacle.connections[tentacle.connections.length - 1];
        const angle = angleBetween(pos.x, pos.y, mouse.x, mouse.y);
        particles.push({
          x: pos.x, y: pos.y, life: 1, radius: 1,
          isDead: false,
          velocity: randomBetween(1, 3) * 0.5,
          angle
        });
      });
    }
    requestAnimationFrame(loopCalamar);
  };

  const onPointerMoveCalamar = (e) => {
    const target = (e.touches && e.touches.length) ? e.touches[0] : e;
    const rect = escenario.getBoundingClientRect();
    mouse.x = target.clientX - rect.left;
    mouse.y = target.clientY - rect.top;
    mouse.angle = angleBetween(squid.x, squid.y, mouse.x, mouse.y);
  };

    escenario.addEventListener('mousemove', onPointerMoveCalamar);
  escenario.addEventListener('touchmove', (e) => {
    e.preventDefault();   // evita scroll mientras se mueve el dedo
    onPointerMoveCalamar(e);
  }, { passive: false });
  escenario.addEventListener('touchstart', onPointerMoveCalamar, { passive: true });

  const iniciarCalamar = () => {
    updateStage();
    loopCalamar();
  };

  if (document.readyState === 'complete') {
    iniciarCalamar();
  } else {
    window.addEventListener('load', iniciarCalamar, { once: true });
  }

  window.addEventListener('resize', () => {
    onResizeCalamar();
  });

  /* ============================================================
     PAC-MAN / CARITA
     ============================================================ */
  const actor = document.getElementById('actor');
  const elipse = document.getElementById('elipse');
  const pac = document.getElementById('pac');
  const pacCtx = pac.getContext('2d');
  const scoreEl = document.getElementById('score');
  const hintEl = document.getElementById('hint');
  const ojos = document.querySelectorAll('.ojo');

  const NUM_BOLITAS = 12;
  const VELOCIDAD = 260;
  const DIST_COMER = 34;

  let modo = 'cara';
  let pacX = 0, pacY = 0;
  let puntos = 0;
  let bolitas = [];
  let ultimoPac = 0;

  const centroEscenario = () => {
    const rect = escenario.getBoundingClientRect();
    return { x: rect.width / 2, y: rect.height / 2 };
  };

  const colocarPac = () => {
    actor.style.transform = `translate(${pacX}px, ${pacY}px)`;
  };

  const irAlCentroPac = () => {
    const c = centroEscenario();
    pacX = c.x;
    pacY = c.y;
    colocarPac();
  };

  requestAnimationFrame(() => {
    irAlCentroPac();
  });

  escenario.addEventListener('pointermove', (e) => {
    if (modo !== 'cara') return;
    ojos.forEach((ojo) => {
      const pupila = ojo.querySelector('.pupila');
      const caja = ojo.getBoundingClientRect();
      const dx = e.clientX - (caja.left + caja.width / 2);
      const dy = e.clientY - (caja.top + caja.height / 2);
      const angulo = Math.atan2(dy, dx);
      const distancia = Math.min(Math.hypot(dx, dy) / 100, 1);
      pupila.style.transform =
        `translate(${Math.cos(angulo) * caja.width * 0.28 * distancia}px, ${Math.sin(angulo) * caja.height * 0.32 * distancia}px)`;
    });
  });

  const convertir = () => {
    if (modo !== 'cara') return;
    modo = 'transformando';
    hintEl.textContent = '';
    elipse.classList.add('redonda');
    setTimeout(() => {
      elipse.style.display = 'none';
      pac.style.display = 'block';
      puntos = 0;
      actualizarPuntosPac();
      scoreEl.classList.add('visible');
      crearBolitasPac(NUM_BOLITAS);
      hintEl.textContent = 'Clic dentro del recuadro para poner bolitas · clic en Pac-Man para que se vaya';
      modo = 'pacman';
      ultimoPac = performance.now();
      requestAnimationFrame(loopPac);
    }, 650);
  };

    elipse.addEventListener('click', convertir);
  elipse.addEventListener('touchend', (e) => {
    e.preventDefault();
    convertir();
  });
  elipse.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      convertir();
    }
  });

  const volverCara = () => {
    pac.style.display = 'none';
    elipse.style.display = 'block';
    void elipse.offsetWidth;
    elipse.classList.remove('redonda');
    modo = 'cara';
    hintEl.textContent = `Comió ${puntos} bolitas. Haz clic en la carita para jugar otra vez`;
  };

  const agregarBolitaPac = (bx, by) => {
    const el = document.createElement('div');
    el.className = 'bolita';
    el.style.left = bx + 'px';
    el.style.top = by + 'px';
    escenario.appendChild(el);
    bolitas.push({ x: bx, y: by, el });
  };

  const crearBolitasPac = (n) => {
    const rect = escenario.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      let bx, by, intentos = 0;
      do {
        bx = 40 + Math.random() * (rect.width - 80);
        by = 60 + Math.random() * (rect.height - 120);
        intentos++;
      } while (Math.hypot(bx - pacX, by - pacY) < 90 && intentos < 20);
      agregarBolitaPac(bx, by);
    }
  };

  const masCercanaPac = () => {
    let mejor = null, mejorD = Infinity;
    for (const b of bolitas) {
      const d = Math.hypot(b.x - pacX, b.y - pacY);
      if (d < mejorD) { mejorD = d; mejor = b; }
    }
    return mejor;
  };

  const comerPac = () => {
    bolitas = bolitas.filter((b) => {
      if (Math.hypot(b.x - pacX, b.y - pacY) < DIST_COMER) {
        b.el.remove();
        puntos++;
        actualizarPuntosPac();
        return false;
      }
      return true;
    });
  };

  const actualizarPuntosPac = () => {
    scoreEl.textContent = `Puntos: ${puntos}`;
  };

  escenario.addEventListener('pointerdown', (e) => {
    if (modo !== 'pacman' || e.target === pac) return;
    const rect = escenario.getBoundingClientRect();
    agregarBolitaPac(e.clientX - rect.left, e.clientY - rect.top);
  });

  pac.addEventListener('click', () => {
    if (modo !== 'pacman') return;
    bolitas.forEach((b) => b.el.remove());
    bolitas = [];
  });

  const dibujarPac = (t) => {
    const boca = (0.04 + 0.30 * Math.abs(Math.sin(t / 110))) * Math.PI;
    pacCtx.clearRect(0, 0, 120, 120);
    pacCtx.fillStyle = '#ffd400';
    pacCtx.beginPath();
    pacCtx.moveTo(60, 60);
    pacCtx.arc(60, 60, 59, boca, Math.PI * 2 - boca);
    pacCtx.closePath();
    pacCtx.fill();
    pacCtx.fillStyle = '#000';
    pacCtx.beginPath();
    pacCtx.arc(66, 32, 6, 0, Math.PI * 2);
    pacCtx.fill();
  };

  const orientarPac = (ang) => {
    const volteo = Math.cos(ang) < 0 ? -1 : 1;
    pac.style.transform = `translate(-50%, -50%) rotate(${ang}rad) scaleY(${volteo})`;
  };

  const loopPac = (t) => {
    if (modo !== 'pacman' && modo !== 'volviendo') return;
    const dt = Math.min((t - ultimoPac) / 1000, 0.05);
    ultimoPac = t;

    let objetivo = null;
    if (modo === 'pacman') {
      objetivo = masCercanaPac();
      if (!objetivo) { modo = 'volviendo'; hintEl.textContent = ''; }
    }
    if (modo === 'volviendo') objetivo = centroEscenario();

    if (objetivo) {
      const dx = objetivo.x - pacX, dy = objetivo.y - pacY;
      const d = Math.hypot(dx, dy);
      const paso = VELOCIDAD * dt;
      if (d > 0.5) {
        orientarPac(Math.atan2(dy, dx));
        if (d <= paso) { pacX = objetivo.x; pacY = objetivo.y; }
        else { pacX += (dx / d) * paso; pacY += (dy / d) * paso; }
      }
      colocarPac();
    }

    if (modo === 'pacman') comerPac();
    dibujarPac(t);

    if (modo === 'volviendo') {
      const c = centroEscenario();
      if (Math.hypot(pacX - c.x, pacY - c.y) < 1) {
        volverCara();
        return;
      }
    }
    requestAnimationFrame(loopPac);
  };

});
