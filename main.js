// 1nc0gn30.github.io — GitHub × 1nc0gn30 Collab Edition (vanilla JS, zero deps)
// 60fps Volumetric 360° Character Turntable, 3D Isometric GitHub Contribution Lattice, Vortex Morphs & 6 Shader Modes.
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.documentElement.classList.add('reduced');

  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
  const BIT = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
  const ASCII_CHARS = ' .:-=+*#%@⣿';

  const mouse = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
  addEventListener('pointermove', e => {
    const nx = e.clientX / innerWidth;
    const ny = e.clientY / innerHeight;
    mouse.vx = nx - mouse.x;
    mouse.vy = ny - mouse.y;
    mouse.x = nx;
    mouse.y = ny;
  }, { passive: true });

  // ---- 1. Background 3D Perspective Braille + GitHub Lattice ----
  function pack(buf, cols, rows) {
    let out = '';
    for (let r = 0; r < rows; r++) {
      let line = '';
      for (let c = 0; c < cols; c++) {
        let b = 0;
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            if (buf[(r * 4 + dy) * cols * 2 + c * 2 + dx]) b |= BIT[dy][dx];
          }
        }
        line += b ? String.fromCharCode(0x2800 + b) : ' ';
      }
      out += line + '\n';
    }
    return out;
  }

  function cellSize(el) {
    const s = document.createElement('span');
    s.textContent = '⣿'.repeat(20);
    el.appendChild(s);
    const r = s.getBoundingClientRect();
    s.remove();
    return { w: r.width / 20 || 7, h: parseFloat(getComputedStyle(el).lineHeight) || 12 };
  }

  const lat = document.getElementById('lattice');
  let L = null;
  function setupLattice() {
    if (!lat) return;
    const cs = cellSize(lat), rect = lat.getBoundingClientRect();
    const cols = Math.max(10, Math.ceil(rect.width / cs.w));
    const rows = Math.max(10, Math.ceil(rect.height / cs.h));
    L = { cols, rows, W: cols * 2, H: rows * 4, buf: new Uint8Array(cols * 2 * rows * 4) };
  }

  const P = [], E = [], N = 3;
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= N; j++)
      for (let k = 0; k <= N; k++)
        P.push([i / N * 2 - 1, j / N * 2 - 1, k / N * 2 - 1]);
  const id = (i, j, k) => (i * (N + 1) + j) * (N + 1) + k;
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= N; j++)
      for (let k = 0; k <= N; k++) {
        if (i < N) E.push([id(i, j, k), id(i + 1, j, k)]);
        if (j < N) E.push([id(i, j, k), id(i, j + 1, k)]);
        if (k < N) E.push([id(i, j, k), id(i, j, k + 1)]);
      }

  let turntableYaw = 0;

  function drawLattice(t) {
    if (!L) return;
    const { W, H, buf } = L;
    buf.fill(0);
    const ay = t * 0.00022 + (mouse.x - 0.5) * 1.1 + turntableYaw * 0.35;
    const ax = 0.48 + (mouse.y - 0.5) * 0.7 + Math.sin(t * 0.0002) * 0.18;
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const sc = Math.min(W, H) * 0.42, ox = W * 0.68, oy = H * 0.5;
    const pr = P.map(([x, y, z]) => {
      let X = x * cy - z * sy, Z = x * sy + z * cy, Y = y * cx - Z * sx;
      Z = y * sx + Z * cx;
      const f = 2.6 / (3.2 + Z);
      return [ox + X * sc * f, oy + Y * sc * f, (1.6 - Z) / 3.2];
    });
    for (const [a, b] of E) {
      const A = pr[a], B = pr[b], n = Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1]));
      for (let s = 0; s <= n; s++) {
        const u = s / (n || 1), x = (A[0] + (B[0] - A[0]) * u) | 0, y = (A[1] + (B[1] - A[1]) * u) | 0;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const I = A[2] + (B[2] - A[2]) * u;
        if (I > BAYER[(y & 3) * 4 + (x & 3)] * 0.9) buf[y * W + x] = 1;
      }
    }
    lat.textContent = pack(buf, L.cols, L.rows);
  }

  // ---- 2. Populate Interactive GitHub Contribution Heatmap Strip ----
  const contribGrid = document.getElementById('contribGrid');
  if (contribGrid) {
    const totalSquares = 36 * 5;
    let html = '';
    for (let i = 0; i < totalSquares; i++) {
      const hash = ((i * 73 + 19) * 31) % 97;
      let cls = 'contrib-sq';
      if (hash > 88) cls += ' gold';
      else if (hash > 68) cls += ' l4';
      else if (hash > 44) cls += ' l3';
      else if (hash > 22) cls += ' l2';
      else if (hash > 8) cls += ' l1';
      html += `<span class="${cls}" title="Commit block #${i + 1} · 1nc0gn30/zoth"></span>`;
    }
    contribGrid.innerHTML = html;
  }

  // ---- 3. 60fps Volumetric 1nc0gn30 × GitHub Character Engine ----
  const canvas = document.getElementById('charCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const CW = 920, CH = 860;
  const CELL_W = 6, CELL_H = 9;
  const GCOLS = Math.floor(CW / CELL_W);
  const GROWS = Math.floor(CH / CELL_H);

  const POSE_NAMES = ['hero', 'idle', 'front', 'three-quarter', 'side', 'back', 'walk', 'type', 'dissolve'];

  const SEQUENCES = {
    auto: [
      { pose: 'hero', flip: false, hold: 2300, deg: 15, tag: 'GIT_HEAD · SENTINEL' },
      { pose: 'type', flip: false, hold: 2400, deg: 35, tag: 'COMMIT · LIVE CODE STREAM' },
      { pose: 'walk', flip: false, hold: 2000, deg: 65, tag: 'PUSH · VECTOR STRIDE' },
      { pose: 'dissolve', flip: false, hold: 2200, deg: 90, tag: 'MERGE · PARTICLE WAKE' },
      { pose: 'front', flip: false, hold: 950, deg: 0, tag: 'TURN 000° · FRONT' },
      { pose: 'three-quarter', flip: false, hold: 900, deg: 45, tag: 'TURN 045° · 3/4 R' },
      { pose: 'side', flip: false, hold: 900, deg: 90, tag: 'TURN 090° · PROFILE R' },
      { pose: 'back', flip: false, hold: 950, deg: 180, tag: 'TURN 180° · REAR' },
      { pose: 'side', flip: true, hold: 900, deg: 270, tag: 'TURN 270° · PROFILE L' },
      { pose: 'three-quarter', flip: true, hold: 900, deg: 315, tag: 'TURN 315° · 3/4 L' },
      { pose: 'idle', flip: false, hold: 2000, deg: 0, tag: 'IDLE · HOODED FOCUS' }
    ],
    spin: [
      { pose: 'front', flip: false, hold: 780, deg: 0, tag: '360° RIG · 000° FRONT' },
      { pose: 'three-quarter', flip: false, hold: 780, deg: 45, tag: '360° RIG · 045° 3/4 R' },
      { pose: 'side', flip: false, hold: 780, deg: 90, tag: '360° RIG · 090° PROFILE R' },
      { pose: 'three-quarter', flip: false, hold: 780, deg: 135, tag: '360° RIG · 135° REAR R' },
      { pose: 'back', flip: false, hold: 780, deg: 180, tag: '360° RIG · 180° BACK' },
      { pose: 'three-quarter', flip: true, hold: 780, deg: 225, tag: '360° RIG · 225° REAR L' },
      { pose: 'side', flip: true, hold: 780, deg: 270, tag: '360° RIG · 270° PROFILE L' },
      { pose: 'three-quarter', flip: true, hold: 780, deg: 315, tag: '360° RIG · 315° 3/4 L' }
    ],
    action: [
      { pose: 'idle', flip: false, hold: 1700, deg: 0, tag: 'ACTION · 01 IDLE' },
      { pose: 'walk', flip: false, hold: 1800, deg: 45, tag: 'ACTION · 02 STRIDE' },
      { pose: 'type', flip: false, hold: 2200, deg: 60, tag: 'ACTION · 03 GIT PUSH' },
      { pose: 'dissolve', flip: false, hold: 2100, deg: 90, tag: 'ACTION · 04 PHASE SHIFT' },
      { pose: 'hero', flip: false, hold: 2000, deg: 15, tag: 'ACTION · 05 SENTINEL' }
    ]
  };

  let activeFx = 'hybrid'; // 'hybrid' | 'gh3d' | 'braille' | 'dither' | 'ascii' | 'lattice'
  let activeSeq = 'auto';
  let seqIndex = 0;
  let seqSwitchTime = performance.now();
  const TRANSITION_MS = 620;

  const AMBIENT_PARTICLES = Array.from({ length: 115 }, (_, i) => ({
    x: Math.random() * CW,
    y: Math.random() * (CH - 120) + 40,
    vx: 0.6 + Math.random() * 2.2,
    vy: (Math.random() - 0.5) * 0.7,
    size: Math.random() > 0.35 ? 2.5 : 4,
    glyph: '⣿⠿⠇⠋01/>_#*'[i % 11],
    tone: i % 4 === 0 ? 3 : i % 5 === 0 ? 2 : i % 2 === 0 ? 1 : 0, // tone 3 = GitHub Emerald
    phase: Math.random() * Math.PI * 2
  }));

  const poseBank = new Map();
  const scratchOff = document.createElement('canvas');
  scratchOff.width = CW;
  scratchOff.height = CH;
  const sctx = scratchOff.getContext('2d');

  function buildPoseEntry(name, img) {
    const off = document.createElement('canvas');
    off.width = CW;
    off.height = CH;
    const octx = off.getContext('2d', { willReadFrequently: true });
    octx.imageSmoothingEnabled = false;

    const maxH = name === 'dissolve' ? 540 : 640;
    const maxW = name === 'dissolve' ? 760 : 580;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const dw = Math.round(img.naturalWidth * scale);
    const dh = Math.round(img.naturalHeight * scale);
    const dx = name === 'dissolve' ? Math.round((CW - dw) * 0.44) : Math.round((CW - dw) * 0.40);
    const dy = Math.round((CH - dh) * 0.44);

    octx.drawImage(img, dx, dy, dw, dh);
    const raw = octx.getImageData(0, 0, CW, CH);
    const d = raw.data;

    const ditherOff = document.createElement('canvas');
    ditherOff.width = CW;
    ditherOff.height = CH;
    const dctx = ditherOff.getContext('2d');
    const dImg = dctx.createImageData(CW, CH);
    const dd = dImg.data;

    const rimOff = document.createElement('canvas');
    rimOff.width = CW;
    rimOff.height = CH;
    const rctx = rimOff.getContext('2d');
    const rImg = rctx.createImageData(CW, CH);
    const rd = rImg.data;

    const PIX = 3;
    for (let y = 1; y < CH - 1; y++) {
      for (let x = 1; x < CW - 1; x++) {
        const i = (y * CW + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
        if (lum < 0.042) {
          d[i + 3] = 0;
          continue;
        }
        d[i + 3] = Math.min(255, Math.round(lum * 1450));

        const iL = (y * CW + (x - 1)) * 4;
        const iR = (y * CW + (x + 1)) * 4;
        const iU = ((y - 1) * CW + x) * 4;
        const iD = ((y + 1) * CW + x) * 4;
        const gx = ((d[iR] - d[iL]) + (d[iR + 1] - d[iL + 1])) / 510;
        const gy = ((d[iD] - d[iU]) + (d[iD + 1] - d[iU + 1])) / 510;
        const edgeMag = Math.hypot(gx, gy);
        if (edgeMag > 0.12) {
          // Dual Gold + GitHub Emerald rim highlight
          const isEmeraldRim = ((x + y) % 9) === 0;
          rd[i] = isEmeraldRim ? 57 : 245;
          rd[i + 1] = isEmeraldRim ? 211 : 205;
          rd[i + 2] = isEmeraldRim ? 83 : 95;
          rd[i + 3] = Math.min(255, Math.round(edgeMag * 520));
        }

        const bx = ((x / PIX) | 0) & 3;
        const by = ((y / PIX) | 0) & 3;
        const thr = BAYER[by * 4 + bx];
        const v = lum * 2.3 + (thr - 0.5) * 0.32;
        if (v < 0.15) {
          dd[i + 3] = 0;
        } else if (v < 0.38) {
          // GitHub dark emerald shadow tone
          dd[i] = 38; dd[i + 1] = 166; dd[i + 2] = 65; dd[i + 3] = 255;
        } else if (v < 0.76) {
          // 1nc0gn30 24K Gold mid-tone
          dd[i] = 245; dd[i + 1] = 184; dd[i + 2] = 46; dd[i + 3] = 255;
        } else {
          dd[i] = 242; dd[i + 1] = 234; dd[i + 2] = 214; dd[i + 3] = 255;
        }
      }
    }
    octx.putImageData(raw, 0, 0);
    dctx.putImageData(dImg, 0, 0);
    rctx.putImageData(rImg, 0, 0);

    const brailleOff = document.createElement('canvas');
    brailleOff.width = CW;
    brailleOff.height = CH;
    const bctx = brailleOff.getContext('2d');
    const DOT_STEP = 3;
    for (let y = 0; y < CH; y += DOT_STEP) {
      for (let x = 0; x < CW; x += DOT_STEP) {
        const i = (y * CW + x) * 4;
        if (d[i + 3] < 20) continue;
        const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
        const thr = BAYER[((y / DOT_STEP) & 3) * 4 + ((x / DOT_STEP) & 3)];
        const v = lum * 2.85 + (rd[i + 3] / 255) * 0.45;
        if (v <= thr * 0.72 + 0.04) continue;
        bctx.fillStyle = v > 0.92 ? '#f2ead6' : v > 0.45 ? '#f5b82e' : ((x + y) % 6 === 0 ? '#39d353' : '#8a6514');
        bctx.fillRect(x, y, 2.2, 2.2);
      }
    }

    const asciiOff = document.createElement('canvas');
    asciiOff.width = CW;
    asciiOff.height = CH;
    const actx = asciiOff.getContext('2d');
    actx.font = 'bold 9px ui-monospace, "JetBrains Mono", monospace';

    const cells = [];
    const voxels = [];
    for (let gr = 0; gr < GROWS; gr++) {
      for (let gc = 0; gc < GCOLS; gc++) {
        let bits = 0, lumSum = 0, goldSum = 0, edgeSum = 0;
        for (let sy = 0; sy < 4; sy++) {
          for (let sx = 0; sx < 2; sx++) {
            const px = gc * CELL_W + sx * 3 + 1;
            const py = gr * CELL_H + sy * 2 + 1;
            if (px >= CW || py >= CH) continue;
            const idx = (py * CW + px) * 4;
            if (d[idx + 3] < 20) continue;
            const r = d[idx], g = d[idx + 1], b = d[idx + 2];
            const lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
            lumSum += lum;
            goldSum += (r - b) / 255;
            edgeSum += rd[idx + 3] / 255;
            if (Math.min(1, lum * 3.1) > BAYER[((gr * 4 + sy) & 3) * 4 + ((gc * 2 + sx) & 3)] + 0.07) {
              bits |= BIT[sy][sx];
            }
          }
        }
        if (bits > 0 || lumSum > 0.16) {
          const avgLum = lumSum / 8;
          const ch = String.fromCharCode(0x2800 + (bits || 0x24));
          const asciiIdx = Math.min(ASCII_CHARS.length - 1, Math.max(1, Math.floor((avgLum * 2.7 + edgeSum * 0.15) * (ASCII_CHARS.length - 1))));
          const asciiCh = edgeSum > 1.8 ? '/\\|='[(gc + gr) & 3] : ASCII_CHARS[asciiIdx];
          const tone = (avgLum > 0.38 || edgeSum > 2.1) ? 2 : (avgLum > 0.18 || goldSum > 0.42 ? 1 : ((gc + gr) % 5 === 0 ? 3 : 0));
          const color = tone === 2 ? '#f2ead6' : tone === 1 ? '#f5b82e' : tone === 3 ? '#39d353' : '#8a6514';

          actx.fillStyle = color;
          actx.fillText(asciiCh, gc * CELL_W, gr * CELL_H);

          const cellObj = {
            gc,
            gr,
            x: gc * CELL_W,
            y: gr * CELL_H,
            nx: (gc * CELL_W - dx) / Math.max(1, dw),
            ny: (gr * CELL_H - dy) / Math.max(1, dh),
            ch,
            asciiCh,
            tone,
            lum: avgLum,
            edge: edgeSum > 1.2,
            seed: ((gc * 73 + gr * 151) & 255) / 255
          };
          voxels.push(cellObj);
          if ((gc + gr) % 2 === 0 || edgeSum > 1.3) {
            cells.push(cellObj);
          }
        }
      }
    }

    return { off, rimOff, ditherOff, brailleOff, asciiOff, dx, dy, dw, dh, cells, voxels };
  }

  POSE_NAMES.forEach(name => {
    const im = new Image();
    im.onload = () => poseBank.set(name, buildPoseEntry(name, im));
    im.src = `assets/${name}.jpg`;
  });

  // ---- 4. 3D Isometric GitHub Contribution Pedestal & Orbital Telemetry Ring ----
  function drawPedestal(t, deg, labelText, progressRatio) {
    if (!ctx) return;
    const cx = CW * 0.46;
    const cy = CH * 0.84;
    const rx = 274;
    const ry = 58;
    const rot = (deg * Math.PI) / 180 + t * 0.00055 + turntableYaw;

    ctx.save();

    // 1. Rear 3D cylindrical orbital latitude rings (GitHub Emerald + Gold)
    for (const [idx, ringY] of [CH * 0.34, CH * 0.56].entries()) {
      ctx.strokeStyle = idx === 0 ? 'rgba(57, 211, 83, 0.24)' : 'rgba(245, 184, 46, 0.22)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.ellipse(cx, ringY, rx * 0.92, 34, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 2. 3D Isometric GitHub Contribution Grid Floor under 1nc0gn30's boots
    const floorGlow = ctx.createRadialGradient(cx, cy, 14, cx, cy, rx * 1.18);
    floorGlow.addColorStop(0, 'rgba(57, 211, 83, 0.22)');
    floorGlow.addColorStop(0.45, 'rgba(245, 184, 46, 0.14)');
    floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = floorGlow;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 1.18, ry * 1.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting GitHub Contribution Isometric Tiles on the pedestal disc
    for (let ring = 1; ring <= 3; ring++) {
      const rFrac = ring * 0.24;
      const nodes = ring * 8;
      for (let k = 0; k < nodes; k++) {
        const a = (k / nodes) * Math.PI * 2 + rot * (ring % 2 === 0 ? -0.7 : 0.9);
        const px = cx + Math.cos(a) * rx * rFrac;
        const py = cy + Math.sin(a) * ry * rFrac;
        const isGold = (k + ring) % 5 === 0;
        ctx.fillStyle = isGold ? 'rgba(245, 184, 46, 0.55)' : 'rgba(57, 211, 83, 0.48)';
        ctx.fillRect(px - 3, py - 2, 6, 4);
      }
    }

    // 3. Outer degree tick ring (36 ticks around 360°)
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2 + rot;
      const sinA = Math.sin(a), cosA = Math.cos(a);
      const depthAlpha = 0.26 + (sinA + 1) * 0.36;
      const isMajor = i % 3 === 0;
      const r0 = isMajor ? 0.88 : 0.94;
      const r1 = isMajor ? 1.05 : 1.0;

      ctx.strokeStyle = isMajor
        ? (i % 6 === 0 ? `rgba(57, 211, 83, ${depthAlpha})` : `rgba(245, 184, 46, ${depthAlpha})`)
        : `rgba(139, 148, 158, ${depthAlpha * 0.6})`;
      ctx.lineWidth = isMajor ? 2.2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx + cosA * rx * r0, cy + sinA * ry * r0);
      ctx.lineTo(cx + cosA * rx * r1, cy + sinA * ry * r1);
      ctx.stroke();

      if (i % 9 === 0) {
        const degLabel = `${(i * 10) % 360}°`;
        ctx.font = 'bold 12px ui-monospace, "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(230, 237, 243, ${depthAlpha * 0.95})`;
        ctx.fillText(degLabel, cx + cosA * rx * 1.13 - 14, cy + sinA * ry * 1.18 + 4);
      }
    }

    // 4. Inner dashed counter-rotating ring
    ctx.strokeStyle = 'rgba(57, 211, 83, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.72, ry * 0.72, 0, -rot * 0.8, -rot * 0.8 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Core solid rim ellipse
    ctx.strokeStyle = 'rgba(245, 184, 46, 0.48)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawFrontOrbitalHUD(t, deg, u, labelText, progressRatio) {
    if (!ctx) return;
    const cx = CW * 0.46;
    const cy = CH * 0.84;
    const rx = 274;
    const ry = 58;
    const rot = (deg * Math.PI) / 180 + t * 0.00055 + turntableYaw;

    ctx.save();
    const ringY = CH * 0.56;
    ctx.strokeStyle = 'rgba(57, 211, 83, 0.34)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 14]);
    ctx.beginPath();
    ctx.ellipse(cx, ringY, rx * 0.92, 34, 0, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    const orbAngle = (t * 0.0012 + rot) % (Math.PI * 2);
    if (Math.sin(orbAngle) > 0) {
      const ox = cx + Math.cos(orbAngle) * rx * 0.92;
      const oy = ringY + Math.sin(orbAngle) * 34;
      ctx.fillStyle = '#39d353';
      ctx.fillRect(ox - 3, oy - 3, 6, 6);
      ctx.font = 'bold 11px ui-monospace, "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(245, 184, 46, 0.92)';
      ctx.fillText(`SHA:${String(((Math.round(deg) % 360) + 360) % 360).padStart(3, '0')}°`, ox + 8, oy + 4);
    }

    if (u < 1.0 || activeSeq === 'spin') {
      const scanPhase = u < 1.0 ? u : ((t * 0.0008) % 1);
      const scanX = cx - 210 + scanPhase * 420;
      const scanAlpha = u < 1.0 ? Math.sin(u * Math.PI) * 0.55 : 0.22;
      const grad = ctx.createLinearGradient(scanX - 24, 0, scanX + 24, 0);
      grad.addColorStop(0, 'rgba(57, 211, 83, 0)');
      grad.addColorStop(0.5, `rgba(245, 184, 46, ${scanAlpha})`);
      grad.addColorStop(1, 'rgba(57, 211, 83, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(scanX - 24, CH * 0.12, 48, CH * 0.72);
    }

    ctx.strokeStyle = '#39d353';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, Math.PI * 0.15, Math.PI * (0.15 + 0.7 * Math.min(1, progressRatio || 0)));
    ctx.stroke();

    ctx.font = 'bold 14.5px ui-monospace, "JetBrains Mono", monospace';
    const degStr = String(((Math.round(deg) % 360) + 360) % 360).padStart(3, '0') + '°';
    const pillText = `⣿ GH×1NC0GN30 · ${degStr} · ${labelText || 'SENTINEL'} · FX:${activeFx.toUpperCase()}`;
    const tw = ctx.measureText(pillText).width + 28;
    const px = cx - tw / 2;
    const py = cy + ry + 14;
    ctx.fillStyle = 'rgba(13, 17, 23, 0.94)';
    ctx.fillRect(px, py, tw, 28);
    ctx.strokeStyle = '#39d353';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(px, py, tw, 28);
    ctx.fillStyle = '#f2ead6';
    ctx.fillText(pillText, px + 14, py + 19);

    ctx.restore();
  }

  // ---- 5. Volumetric Pose & Particle Vortex Renderer ----
  function renderCharacterFrame(curEntry, curStep, prevEntry, prevStep, u, t) {
    if (!curEntry || !ctx) return;
    const bobY = Math.sin(t * 0.0035) * 4.5;
    const spinSwayX = Math.sin(t * 0.0028) * (activeSeq === 'spin' ? 14 : 7);
    const tiltX = (mouse.x - 0.5) * 18 + spinSwayX;
    const tiltY = (mouse.y - 0.5) * 10;
    const isMorphing = prevEntry && u < 1.0;

    // 1. Ambient floating GitHub commit cubes & Braille glyphs
    ctx.font = '11px ui-monospace, "JetBrains Mono", monospace';
    for (let i = 0; i < AMBIENT_PARTICLES.length; i++) {
      const p = AMBIENT_PARTICLES[i];
      p.x += p.vx;
      p.y += p.vy + Math.sin(t * 0.002 + p.phase) * 0.25;
      if (p.x > CW - 20) {
        p.x = 120 + Math.random() * 240;
        p.y = 110 + Math.random() * (CH - 240);
      }
      const alpha = 0.24 + 0.26 * Math.sin(t * 0.004 + p.phase);
      ctx.fillStyle = p.tone === 3
        ? `rgba(57, 211, 83, ${alpha})`
        : p.tone === 2
          ? `rgba(242, 234, 214, ${alpha})`
          : p.tone === 1
            ? `rgba(245, 184, 46, ${alpha})`
            : `rgba(88, 166, 255, ${alpha * 0.8})`;
      if (activeFx === 'ascii' || activeFx === 'braille') {
        ctx.fillText(p.glyph, p.x, p.y);
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }

    if (isMorphing) {
      const ease = u * u * (3 - 2 * u);
      const vortexAmp = Math.sin(u * Math.PI);
      const srcCells = prevEntry.cells;
      const dstCells = curEntry.cells;
      const count = Math.min(srcCells.length, dstCells.length);

      drawSinglePoseShader(curEntry, curStep.flip, ease, t, bobY, tiltX, tiltY, vortexAmp * 0.55);
      drawSinglePoseShader(prevEntry, prevStep.flip, (1 - ease) * 0.65, t, bobY, tiltX, tiltY, vortexAmp * 0.85);

      ctx.save();
      ctx.font = 'bold 13px ui-monospace, "JetBrains Mono", monospace';
      for (let i = 0; i < count; i++) {
        const a = srcCells[i];
        const b = dstCells[i];
        const ax = (prevStep.flip ? CW - a.x - CELL_W : a.x) + tiltX * 0.5;
        const ay = a.y + bobY + tiltY * 0.5;
        const bx = (curStep.flip ? CW - b.x - CELL_W : b.x) + tiltX * 0.5;
        const by = b.y + bobY + tiltY * 0.5;

        const angle = vortexAmp * Math.PI * (0.95 + a.seed * 1.1) * (i % 2 === 0 ? 1 : -1);
        const midX = ax + (bx - ax) * ease + Math.sin(angle) * (55 + a.seed * 115) * vortexAmp;
        const midY = ay + (by - ay) * ease + Math.cos(angle) * 28 * vortexAmp;

        ctx.fillStyle = b.tone === 2 ? '#f2ead6' : b.tone === 1 ? '#f5b82e' : (i % 3 === 0 ? '#39d353' : '#8a6514');
        if (activeFx === 'ascii') {
          ctx.fillText(b.asciiCh, midX, midY);
        } else if (activeFx === 'braille' || (activeFx === 'hybrid' && i % 2 === 0)) {
          ctx.fillText(b.ch, midX, midY);
        } else {
          ctx.fillRect(midX | 0, midY | 0, 4, 4);
        }
      }

      const waveY = curEntry.dy + curEntry.dh * ease;
      const waveGrad = ctx.createLinearGradient(0, waveY - 32, 0, waveY + 32);
      waveGrad.addColorStop(0, 'rgba(57, 211, 83, 0)');
      waveGrad.addColorStop(0.5, `rgba(245, 184, 46, ${vortexAmp * 0.55})`);
      waveGrad.addColorStop(1, 'rgba(57, 211, 83, 0)');
      ctx.fillStyle = waveGrad;
      ctx.fillRect(curEntry.dx - 50, waveY - 32, curEntry.dw + 180, 64);
      ctx.restore();
    } else {
      drawSinglePoseShader(curEntry, curStep.flip, 1.0, t, bobY, tiltX, tiltY, 0);
    }

    if (curStep.pose === 'type') {
      ctx.save();
      ctx.font = 'bold 13px ui-monospace, "JetBrains Mono", monospace';
      const CODE_TOKENS = ['git push', '0x28FF', 'zoth://', 'U+2800', 'PR #72', '>>_', 'sha256', 'main✓'];
      for (let k = 0; k < 14; k++) {
        const life = ((t * 0.0009 + k * 0.17) % 1);
        const lx = CW * 0.34 + Math.sin(t * 0.003 + k * 1.7) * 55 + k * 6;
        const ly = CH * 0.46 - life * 175 + bobY;
        ctx.fillStyle = k % 2 === 0
          ? `rgba(57, 211, 83, ${(1 - life) * 0.92})`
          : `rgba(245, 184, 46, ${(1 - life) * 0.92})`;
        ctx.fillText(CODE_TOKENS[k % CODE_TOKENS.length], lx, ly);
      }
      ctx.restore();
    }
  }

  function drawSinglePoseShader(entry, flip, alpha, t, bobY, tiltX, tiltY, extraTurbulence) {
    ctx.save();
    ctx.globalAlpha = alpha;

    // MODE 1: HYBRID (High-def sprite + dual Gold/Emerald rim-light + dissolving U+2800 Braille & GitHub commit cube wake)
    if (activeFx === 'hybrid') {
      const dissolveFront = 0.58 + 0.14 * Math.sin(t * 0.0018) - extraTurbulence * 0.35;

      sctx.clearRect(0, 0, CW, CH);
      sctx.save();
      if (flip) {
        sctx.translate(CW, 0);
        sctx.scale(-1, 1);
      }
      sctx.drawImage(entry.off, tiltX * 0.5, bobY + tiltY * 0.5);

      const rimPulse = 0.55 + 0.45 * Math.sin(t * 0.004 + mouse.x * 4);
      sctx.globalAlpha = rimPulse;
      sctx.drawImage(entry.rimOff, tiltX * 0.62, bobY + tiltY * 0.62);
      sctx.globalAlpha = 1.0;

      sctx.globalCompositeOperation = 'destination-in';
      const gradX0 = entry.dx + entry.dw * (dissolveFront - 0.12);
      const gradX1 = entry.dx + entry.dw * (dissolveFront + 0.24);
      const g = sctx.createLinearGradient(gradX0, 0, gradX1, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, CW, CH);
      sctx.restore();

      ctx.drawImage(scratchOff, 0, 0);

      ctx.font = 'bold 13px ui-monospace, "JetBrains Mono", monospace';
      for (let i = 0; i < entry.cells.length; i++) {
        const c = entry.cells[i];
        const nx = flip ? 1 - c.nx : c.nx;
        if (nx < dissolveFront - 0.16 && !c.edge && extraTurbulence < 0.1) continue;

        const k = Math.max(0, nx - (dissolveFront - 0.1)) + extraTurbulence * 0.65;
        if (c.seed < k * 0.38) continue;

        const baseX = flip ? CW - c.x - CELL_W : c.x;
        const curlX = k * (52 + c.seed * 145) + Math.sin(t * 0.0045 + c.gr * 0.28 + c.seed * 6) * (4 + k * 10);
        const curlY = bobY + Math.cos(t * 0.0035 + c.gc * 0.2 + c.seed * 9) * k * 18;

        ctx.fillStyle = c.tone === 2 ? '#f2ead6' : c.tone === 1 ? '#f5b82e' : (i % 3 === 0 ? '#39d353' : '#8a6514');
        if (i % 4 === 0 && k > 0.15) {
          ctx.fillRect((baseX + curlX + tiltX * 0.5) | 0, (c.y + curlY + tiltY * 0.5) | 0, 3.8, 3.8);
        } else {
          ctx.fillText(c.ch, baseX + curlX + tiltX * 0.5, c.y + curlY + tiltY * 0.5);
        }
      }
    }

    // MODE 2: 3D GITHUB CONTRIBUTION MATRIX (`gh3d`) — True 3D Isometric Extruded Commit Cubes + Gold/Emerald Lattice
    else if (activeFx === 'gh3d') {
      const yaw = Math.sin(t * 0.0024) * 0.48 + (mouse.x - 0.5) * 0.92 + turntableYaw * 0.65;
      const pitch = (mouse.y - 0.5) * 0.45;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const cx = CW * 0.46, cy = CH * 0.46 + bobY;

      const vox = entry.voxels;
      for (let i = 0; i < vox.length; i += 2) {
        const c = vox[i];
        const bx = (flip ? CW - c.x - CELL_W : c.x) - cx;
        const by = c.y - CH * 0.46;
        // Extrude 3D commit tower height by luminance + wave
        const commitLevel = (c.lum * 4) | 0;
        const bz = (c.lum - 0.2) * 185 + (c.edge ? 32 : 0) + Math.sin(t * 0.0045 + c.gr * 0.22 + c.gc * 0.15) * 14;

        const rx = bx * cosY - bz * sinY;
        const rz = bx * sinY + bz * cosY;
        const fov = 640 / (640 + rz);
        const px = cx + rx * fov;
        const py = cy + (by + rz * pitch * 0.35) * fov;
        const sz = (c.edge ? 5.2 : 4.2) * fov;

        // Draw 3D extruded isometric cube side + top face
        ctx.fillStyle = '#0e4429';
        ctx.fillRect(px - sz * 0.5 + 2, py - sz * 0.5 + 2, sz, sz);

        if (c.tone === 2 || c.edge) {
          ctx.fillStyle = '#f5b82e';
        } else if (commitLevel >= 2) {
          ctx.fillStyle = '#39d353';
        } else if (commitLevel === 1) {
          ctx.fillStyle = '#26a641';
        } else {
          ctx.fillStyle = '#006d32';
        }
        ctx.fillRect(px - sz * 0.5, py - sz * 0.5, sz, sz);
      }
    }

    // MODE 3: BRAILLE
    else if (activeFx === 'braille') {
      ctx.save();
      if (flip) {
        ctx.translate(CW, 0);
        ctx.scale(-1, 1);
      }
      ctx.shadowColor = 'rgba(245, 184, 46, 0.5)';
      ctx.shadowBlur = 6;
      ctx.drawImage(entry.brailleOff, tiltX * 0.5, bobY + tiltY * 0.5);
      ctx.restore();

      ctx.font = 'bold 12px ui-monospace, "JetBrains Mono", monospace';
      for (let i = 0; i < entry.cells.length; i++) {
        const c = entry.cells[i];
        const nx = flip ? 1 - c.nx : c.nx;
        if (nx < 0.56 && !c.edge && extraTurbulence < 0.1) continue;
        const k = Math.max(0, nx - 0.56) + extraTurbulence * 0.6;
        if (c.seed < k * 0.34) continue;
        const baseX = flip ? CW - c.x - CELL_W : c.x;
        const dx = k * (48 + c.seed * 125) + Math.sin(t * 0.004 + c.gr * 0.25) * 5;
        const dy = bobY + Math.sin(t * 0.003 + c.seed * 10) * k * 14;
        ctx.fillStyle = c.tone === 2 ? '#f2ead6' : c.tone === 1 ? '#f5b82e' : '#39d353';
        ctx.fillText(c.ch, baseX + dx + tiltX * 0.5, c.y + dy + tiltY * 0.5);
      }
    }

    // MODE 4: DITHER
    else if (activeFx === 'dither') {
      ctx.save();
      if (flip) {
        ctx.translate(CW, 0);
        ctx.scale(-1, 1);
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(entry.ditherOff, tiltX * 0.5, bobY + tiltY * 0.5);
      ctx.restore();

      for (let i = 0; i < entry.cells.length; i++) {
        const c = entry.cells[i];
        const nx = flip ? 1 - c.nx : c.nx;
        if (nx < 0.58 && extraTurbulence < 0.1) continue;
        const k = Math.max(0, nx - 0.58) + extraTurbulence * 0.6;
        const baseX = flip ? CW - c.x - CELL_W : c.x;
        const vx = baseX + k * (45 + c.seed * 130) + (((t * 0.07 + c.seed * 40) | 0) % 28);
        const vy = c.y + bobY + Math.sin(t * 0.003 + c.seed * 8) * k * 12;
        ctx.fillStyle = c.tone === 2 ? '#f2ead6' : c.tone === 1 ? '#f5b82e' : '#39d353';
        ctx.fillRect(vx | 0, vy | 0, 4.5, 4.5);
      }
    }

    // MODE 5: ASCII
    else if (activeFx === 'ascii') {
      ctx.save();
      if (flip) {
        ctx.translate(CW, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(entry.asciiOff, tiltX * 0.5, bobY + tiltY * 0.5);
      ctx.restore();

      ctx.font = 'bold 11px ui-monospace, "JetBrains Mono", monospace';
      for (let i = 0; i < entry.cells.length; i++) {
        const c = entry.cells[i];
        const nx = flip ? 1 - c.nx : c.nx;
        if (nx < 0.55 && extraTurbulence < 0.1) continue;
        const k = Math.max(0, nx - 0.55) + extraTurbulence * 0.6;
        const baseX = flip ? CW - c.x - CELL_W : c.x;
        const dx = k * (46 + c.seed * 120) + (((t * 0.05 + c.seed * 30) | 0) % 20);
        const dy = bobY + Math.sin(t * 0.003 + c.seed * 9) * k * 12;
        const glyph = '01/>_#*@%λ'[(i + ((t * 0.009) | 0)) % 10];
        ctx.fillStyle = c.tone === 2 ? '#f2ead6' : c.tone === 1 ? '#f5b82e' : '#39d353';
        ctx.fillText(glyph, baseX + dx + tiltX * 0.5, c.y + dy + tiltY * 0.5);
      }
    }

    // MODE 6: 3D VOXEL LATTICE
    else if (activeFx === 'lattice') {
      const yaw = Math.sin(t * 0.0022) * 0.42 + (mouse.x - 0.5) * 0.85 + turntableYaw * 0.6;
      const pitch = (mouse.y - 0.5) * 0.45;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const cx = CW * 0.46, cy = CH * 0.46 + bobY;

      ctx.lineWidth = 1;
      const vox = entry.voxels;
      for (let i = 0; i < vox.length; i++) {
        const c = vox[i];
        const bx = (flip ? CW - c.x - CELL_W : c.x) - cx;
        const by = c.y - CH * 0.46;
        const bz = (c.lum - 0.22) * 165 + (c.edge ? 26 : 0) + Math.sin(t * 0.004 + c.gr * 0.18) * 10;

        const rx = bx * cosY - bz * sinY;
        const rz = bx * sinY + bz * cosY;
        const fov = 620 / (620 + rz);
        const px = cx + rx * fov;
        const py = cy + (by + rz * pitch * 0.35) * fov;

        if (c.gr % 3 === 0 && i + 1 < vox.length && vox[i + 1].gr === c.gr && Math.abs(vox[i + 1].gc - c.gc) <= 2) {
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(57, 211, 83, 0.28)' : 'rgba(245, 184, 46, 0.28)';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + CELL_W * fov * cosY, py);
          ctx.stroke();
        }

        ctx.fillStyle = c.tone === 2 ? '#f2ead6' : c.tone === 1 ? '#f5b82e' : '#39d353';
        const sz = (c.edge ? 3.4 : 2.5) * fov;
        ctx.fillRect(px - sz * 0.5, py - sz * 0.5, sz, sz);
      }
    }

    ctx.restore();
  }

  let isPaused = false;
  let manualPrevStep = null;
  let manualCurStep = null;
  let lastSyncedPoseKey = '';

  const poseChips = Array.from(document.querySelectorAll('.pose-chip[data-goto-pose]'));
  function syncPoseChipHighlight(step) {
    if (!step) return;
    const key = `${step.pose}:${step.flip ? 1 : 0}`;
    if (key === lastSyncedPoseKey) return;
    lastSyncedPoseKey = key;
    poseChips.forEach(chip => {
      const match = chip.dataset.gotoPose === step.pose && (chip.dataset.gotoFlip === '1') === !!step.flip;
      chip.classList.toggle('active', match);
    });
  }

  function updateStage(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, CW, CH);

    const seq = SEQUENCES[activeSeq] || SEQUENCES.auto;
    const step = manualCurStep || seq[seqIndex % seq.length];
    const elapsed = t - seqSwitchTime;

    if (!isDragging && !isPaused && !manualCurStep && seq.length > 1 && elapsed >= step.hold) {
      seqIndex = (seqIndex + 1) % seq.length;
      seqSwitchTime = t;
    } else if (manualCurStep && !isPaused && elapsed >= 2600) {
      manualCurStep = null;
      manualPrevStep = null;
      seqSwitchTime = t;
    }

    const curStep = manualCurStep || seq[seqIndex % seq.length];
    const prevStep = manualPrevStep || seq[(seqIndex - 1 + seq.length) % seq.length];
    const curEntry = poseBank.get(curStep.pose);
    const prevEntry = poseBank.get(prevStep.pose);

    syncPoseChipHighlight(curStep);

    const curElapsed = t - seqSwitchTime;
    const u = Math.min(1, curElapsed / TRANSITION_MS);
    const progressRatio = curStep.hold ? (curElapsed / curStep.hold) : u;
    const interpDeg = prevStep && u < 1
      ? prevStep.deg + (curStep.deg - prevStep.deg) * u
      : curStep.deg;

    drawPedestal(t, interpDeg, curStep.tag, progressRatio);
    if (curEntry) {
      renderCharacterFrame(curEntry, curStep, prevEntry, prevStep, u, t);
    }
    drawFrontOrbitalHUD(t, interpDeg, u, curStep.tag, progressRatio);
  }

  // ---- 6. Interactive Drag-to-Spin 360° Turntable & Click-to-Morph ----
  const spriteStage = document.getElementById('spriteStage');
  let isDragging = false;
  let dragStartX = 0;
  let dragAccumX = 0;

  if (spriteStage) {
    spriteStage.addEventListener('pointerdown', e => {
      isDragging = true;
      dragStartX = e.clientX;
      dragAccumX = 0;
      spriteStage.setPointerCapture(e.pointerId);
    });

    spriteStage.addEventListener('pointermove', e => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      dragStartX = e.clientX;
      dragAccumX += Math.abs(dx);
      turntableYaw += dx * 0.008;

      if (Math.abs(dx) > 4 && Math.abs(turntableYaw) > 0.16) {
        manualCurStep = null;
        manualPrevStep = null;
        const seq = SEQUENCES[activeSeq] || SEQUENCES.auto;
        seqIndex = (seqIndex + (dx > 0 ? 1 : seq.length - 1)) % seq.length;
        seqSwitchTime = performance.now();
        turntableYaw = 0;
      }
    });

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      if (dragAccumX < 8) {
        manualCurStep = null;
        manualPrevStep = null;
        const seq = SEQUENCES[activeSeq] || SEQUENCES.auto;
        seqIndex = (seqIndex + 1) % seq.length;
        seqSwitchTime = performance.now();
      }
    };
    spriteStage.addEventListener('pointerup', endDrag);
    spriteStage.addEventListener('pointercancel', endDrag);
  }

  document.querySelectorAll('[data-fx]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-fx]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFx = btn.dataset.fx;
      seqSwitchTime = performance.now();
    });
  });

  document.querySelectorAll('[data-seq]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-seq]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSeq = btn.dataset.seq;
      manualCurStep = null;
      manualPrevStep = null;
      seqIndex = 0;
      seqSwitchTime = performance.now();
    });
  });

  poseChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const seq = SEQUENCES[activeSeq] || SEQUENCES.auto;
      manualPrevStep = manualCurStep || seq[seqIndex % seq.length];
      const pose = chip.dataset.gotoPose;
      const flip = chip.dataset.gotoFlip === '1';
      const deg = Number(chip.dataset.gotoDeg || 0);
      manualCurStep = {
        pose,
        flip,
        deg,
        hold: 2600,
        tag: chip.textContent.trim().toUpperCase()
      };
      seqSwitchTime = performance.now();
      syncPoseChipHighlight(manualCurStep);
    });
  });

  const pauseLoopBtn = document.getElementById('pauseLoopBtn');
  if (pauseLoopBtn) {
    pauseLoopBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseLoopBtn.textContent = isPaused ? '▶' : '⏸';
      pauseLoopBtn.classList.toggle('active', isPaused);
    });
  }

  // ---- 7. Digestible 8-Tool Picker (Funneling to 1nc0gn30.si & zoth.nullai.tech) ----
  const TOOLS_BY_CAT = {
    popular: [
      ['Zoth ASCII Magic', 'image / video → braille & ascii', 'Convert images, video, or 3D models into sub-pixel Unicode Braille and 24-bit ANSI/HTML/SVG.', 'zoth-ascii-magic', 'zoth-ascii-magic'],
      ['JWT Inspector Guard', 'auth & crypto', 'Decode JWTs client-side, verify signatures, test HS256 weak secrets, and inspect DPoP claims.', 'jwt-inspector-guard', 'jwt-inspector-guard'],
      ['MCP Lens', 'mcp debugger', 'Inspect Model Context Protocol JSON-RPC traffic, validate tool schemas, and measure token weight.', 'mcp-lens', 'mcp-lens'],
      ['YARA-X & Sigma Forge', 'threat rules', 'Write and test YARA-X & Sigma detection rules with a byte-offset entropy radar and ATT&CK mapping.', 'yara-sigma-forge', 'yara-sigma-forge'],
      ['Nexus 3D Scene Studio', 'webgl & stl/obj', 'Generate mathematical 3D meshes, 4D tesseracts, and parametric surfaces with OBJ/STL export.', 'nexus-3d-scene-studio', 'nexus-3d-scene-studio'],
      ['Agent Prompt Firewall', 'llm defense', 'Test system prompts against prompt injection, jailbreaks, and PII leakage in the browser.', 'agent-prompt-firewall', 'agent-prompt-firewall'],
      ['Regex Droid', 'ast & redos check', 'Build regular expressions visually with railroad diagrams, multi-language codegen, and ReDoS checks.', 'regex-droid-builder', 'regex-droid-builder'],
      ['AudioCipher Stego', 'audio steganography', 'Hide encrypted payloads in WAV PCM LSB audio, decode DTMF tones, and synthesize Morse.', 'audiocipher-stego-engine', 'audiocipher-stego-engine']
    ],
    security: [
      ['Web Security Guard', 'headers & csp', 'Audit HTTP security headers, build strict CSP Level 3 policies, and compute SHA-384 SRI hashes.', 'web-security-guard', 'web-security-guard'],
      ['Payload Entropy Studio', 'binary analysis', 'Visualize 32-byte sliding-window Shannon entropy to spot packed, encrypted, or obfuscated sections.', 'payload-entropy-studio', 'payload-entropy-studio'],
      ['EnvGuard Secrets Vault', 'aes-256-gcm', 'Encrypt .env files in-browser with Argon2id + AES-256-GCM and split keys with Shamir quorum.', 'envguard-secrets-vault', 'envguard-secrets-vault'],
      ['Domain Intel OSINT Scout', 'dns & ct logs', 'Check Certificate Transparency logs, DoH DNS records, and SPF/DMARC posture for any domain.', 'osint-scout-skill', 'osint-scout-skill'],
      ['Agent Egress Sentinel', 'network policy', 'Design outbound firewall rules, SSRF guards, and TLS SNI allowlists for autonomous agents.', 'agent-egress-sentinel', 'agent-egress-sentinel'],
      ['Agent Capsule Jail', 'sandbox policy', 'Generate seccomp syscall filters, cgroup quotas, and sandbox profiles for local AI agents.', 'agent-capsule-jail', 'agent-capsule-jail'],
      ['Agent Policy Auditor', 'least privilege', 'Audit MCP tool permissions and generate least-privilege capability manifests.', 'agent-policy-auditor', 'agent-policy-auditor'],
      ['SubSweep Lead Scanner', 'passive recon', 'Run passive DNS discovery and tech-stack fingerprinting in the browser with zero cloud storage.', 'subsweep-lead-scanner', 'subsweep-lead-scanner']
    ],
    ai: [
      ['Vector Search Studio', 'hnsw + bm25', 'Run HNSW skip-graph vector search, IVF clustering, and BM25 + RRF hybrid ranking in your browser.', 'vector-search-engine', 'vector-search-engine'],
      ['PromptMaster Studio', 'prompt linter', 'Lint, structure, and compare prompts across Claude, GPT, and Gemini with token cost breakdowns.', 'promptmaster-studio', 'promptmaster-studio'],
      ['DeepSearch Agent', 'cited research', 'Run multi-source research workflows with inline citations and consensus matrices.', 'deepsearch-research-agent', 'deepsearch-research-agent'],
      ['Agent Flight Recorder', 'trace forensics', 'Scrub through hash-chained agent execution logs, tool calls, and memory state changes.', 'agent-flight-recorder', 'agent-flight-recorder'],
      ['Agent Budget Sentinel', 'token circuit breaker', 'Simulate multi-agent token spend and set hard circuit-breaker limits to stop runaway loops.', 'agent-budget-sentinel', 'agent-budget-sentinel'],
      ['Agent Mock Twin', 'offline ci mock', 'Replay deterministic LLM and OpenAPI tool responses offline so CI tests cost $0 in tokens.', 'agent-mock-twin', 'agent-mock-twin'],
      ['Agent Gods Eye', 'dag topology', 'Visualize multi-agent DAG dependencies, message bottlenecks, and cyclic deadlocks.', 'agent-gods-eye', 'agent-gods-eye'],
      ['WebMCP Protocol Suite', 'json-rpc 2.0', 'Test MCP server tool calls, prompts, and resources directly from a browser workbench.', 'webmcp-protocol-inspector', 'webmcp-protocol-inspector']
    ],
    creative: [
      ['Datamosh Glitch Studio', 'h.264 & crt fx', 'Corrupt video I-frames, apply chromatic aberration and Bayer dither, and export glitch clips.', 'datamosh-glitch-studio', 'datamosh-glitch-studio'],
      ['Cyber Turtle Studio', 'l-systems & g-code', 'Generate L-system fractals and vector turtle plots with SVG and CNC G-code export.', 'cyber-turtle-studio', 'cyber-turtle-studio'],
      ['UFO Sacred Geometry', 'parametric cad', 'Synthesize cymatic patterns and Metatron geometry with clean SVG, DXF, and OBJ exports.', 'ufo-sacred-geometry', 'ufo-sacred-geometry'],
      ['Reality Shader Forge', 'glsl & kde themes', 'Customize 60fps WebGL shaders and export matching KDE Plasma .colors, Alacritty, and CSS themes.', 'reality-shader-forge', 'reality-shader-forge'],
      ['Badge3D Coin Forge', '3d relief stl', 'Turn 2D SVG/PNG logos into watertight 3D relief coins and medallions ready for 3D printing.', 'badge3d-coin-generator', 'badge3d-coin-generator'],
      ['Vision Gesture Control', '21-joint hand track', 'Track 3D hand joints via webcam in the browser for touchless drawing and MIDI/MCP triggers.', 'vision-gesture-control', 'vision-gesture-control'],
      ['Zoth Scene Foundry', 'bayer pixel scenes', 'Browse and customize 1,000 deterministic ASCII and Bayer-dithered pixel-art scenes.', 'zoth-scene-foundry', 'zoth-scene-foundry'],
      ['Digital Asset Forge', '300 dpi print packs', 'Resize and package artwork into 300 DPI multi-ratio print ZIPs (2:3, 3:4, 4:5, ISO) in-browser.', 'digital-asset-forge', 'digital-asset-forge']
    ],
    dev: [
      ['Schema Illustrator', 'sql / prisma / ts', 'Draw database ER diagrams and transpile between SQL DDL, Prisma, TypeScript, Pydantic, and GraphQL.', 'schema-illustrator-studio', 'schema-illustrator-studio'],
      ['CronRhythm Studio', 'cron transpiler', 'Parse cron expressions, view a 24×7 run heatmap, and convert between systemd, K8s, and GitHub Actions.', 'cron-rhythm-studio', 'cron-rhythm-studio'],
      ['Polyglot Scaffolder', '13 frameworks', 'Convert UI components across React, Vue, Svelte, Astro, and Solid and download a ready ZIP.', 'polyglot-framework-exporter', 'polyglot-framework-exporter'],
      ['AEO Graph Engine', 'schema.org json-ld', 'Build and validate Schema.org @graph JSON-LD for WebApplication, FAQPage, and LocalBusiness.', 'aeo-graph-engine', 'aeo-graph-engine'],
      ['Robots.txt Auditor', 'rfc 9309 & ai bots', 'Test robots.txt rules against Googlebot, GPTBot, ClaudeBot, and PerplexityBot.', 'robots-txt-auditor', 'robots-txt-auditor'],
      ['CWV Speed Engine', 'core web vitals', 'Analyze DOM layout shifts, render-blocking assets, and generate optimized resource hints.', 'cwv-speed-engine', 'cwv-speed-engine'],
      ['PWA Manifest Studio', 'service worker zip', 'Generate manifest.json, offline ServiceWorker scripts, and app icon bundles in one click.', 'pwa-manifest-builder', 'pwa-manifest-builder'],
      ['Zoth WebGen', 'local site foundry', 'Scaffold static sites locally and deploy straight to Netlify from the command line or browser.', 'zoth-webgen', 'zoth-webgen']
    ]
  };

  const toolGrid = document.getElementById('toolGrid');
  function renderTools(cat) {
    if (!toolGrid) return;
    const list = TOOLS_BY_CAT[cat] || TOOLS_BY_CAT.popular;
    toolGrid.innerHTML = list.map(([name, tag, desc, id, repo]) => `
      <article class="tool-item">
        <div>
          <div class="tool-top">
            <h3>${name}</h3>
            <span class="tool-tag">${tag}</span>
          </div>
          <p>${desc}</p>
        </div>
        <div class="tool-foot">
          <a href="https://zoth.nullai.tech/tools/${id}">launch tool →</a>
          <a class="repo-link" href="https://github.com/1nc0gn30/${repo}">github ↗</a>
        </div>
      </article>
    `).join('');
  }

  document.querySelectorAll('.cat-tabs [data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-tabs [data-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTools(btn.dataset.cat);
    });
  });
  renderTools('popular');

  document.querySelectorAll('.copy-cmd[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(btn.dataset.copy).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓ copied command';
        setTimeout(() => { btn.textContent = orig; }, 1600);
      }).catch(() => {});
    });
  });

  // ---- 8. 60fps Master Loop ----
  let visible = true, lastLat = 0;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  function frame(t) {
    if (visible && scrollY < innerHeight * 1.2) {
      updateStage(t);
      if (t - lastLat > 36) {
        lastLat = t;
        drawLattice(t);
      }
    }
    requestAnimationFrame(frame);
  }

  setupLattice();
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      setupLattice();
      if (reduced) drawLattice(0);
    }, 150);
  });
  requestAnimationFrame(frame);

  // ---- 9. Solana Tip Copy & Shell (`>_` / backtick) ----
  const copySolBtn = document.getElementById('copySolBtn');
  if (copySolBtn) {
    copySolBtn.addEventListener('click', () => {
      const addr = copySolBtn.dataset.sol;
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(addr).then(() => {
        const orig = copySolBtn.textContent;
        copySolBtn.textContent = '✓ copied ' + addr.slice(0, 8) + '...' + addr.slice(-4);
        setTimeout(() => { copySolBtn.textContent = orig; }, 1600);
      }).catch(() => {});
    });
  }

  const dlg = document.getElementById('term'), out = document.getElementById('termOut'), inp = document.getElementById('termIn');
  const say = s => { out.textContent += s + '\n'; out.scrollTop = out.scrollHeight; };
  const CMD = {
    help: () => 'cmds: whoami ls fx <hybrid|gh3d|braille|dither|ascii|lattice> loop <auto|spin|action> si zoth zothos lite civ zothnet hermes nullai repos tip clear exit',
    whoami: () => '1nc0gn30 (@1nc0gn30) · nullai platform · github × 1nc0gn30 open-source hub.',
    ls: () => '1nc0gn30.si/  zoth-studio-v2/ (77 tools)  zoth-os/ (v3.4.0 · 23 daemons)  zothos-lite/ (v1.2 · 56 models)  zoth-civilization/ (v3.0 · 23 agents)  zothnet/  hermes-zoth/',
    fx: arg => {
      if (['hybrid', 'gh3d', 'braille', 'dither', 'ascii', 'lattice'].includes(arg)) {
        activeFx = arg;
        document.querySelectorAll('[data-fx]').forEach(b => b.classList.toggle('active', b.dataset.fx === arg));
        return 'fx switched to ' + arg;
      }
      return 'usage: fx <hybrid|gh3d|braille|dither|ascii|lattice>';
    },
    loop: arg => {
      if (SEQUENCES[arg]) {
        activeSeq = arg;
        seqIndex = 0;
        seqSwitchTime = performance.now();
        document.querySelectorAll('[data-seq]').forEach(b => b.classList.toggle('active', b.dataset.seq === arg));
        return 'motion switched to ' + arg;
      }
      return 'usage: loop <auto|spin|action>';
    },
    si: () => '1nc0gn30.si → https://1nc0gn30.si (full tools & resources hub)',
    zoth: () => 'zoth studio v2: 77 free tools (55 in-browser, 22 cli/daemon, 74 public github repos) → https://zoth.nullai.tech',
    zothos: () => 'zothos v3.4.0: sovereign ai linux workstation · debian 13 kde plasma 6 · 23 daemons · 77 cli tools · agent bridge (:8102) · neuro-memory (:8094) → https://zothos.nullai.tech',
    lite: () => 'zothos-lite v1.2: amnesic monotone (#F7F7F4/#000000) live usb/iso os · 56 curated models · 8 providers · toram · universal x86_64 → https://zothos-lite.nullai.tech',
    civ: () => 'zoth civilization v3.0: 23 pantheon agents · 22-key sanctuary · imperator quests · deepseek flash × hermes agent byok → https://zoth-civilization.netlify.app',
    zothnet: () => 'zothnet: zero-cloud encrypted mesh & 3-hop sphinx mixnet → https://zothnet.nullai.tech',
    hermes: () => 'hermes-zoth: nous hermes multi-agent orchestrator & plugin → https://github.com/1nc0gn30/hermes-zoth',
    nullai: () => 'nullai platform → https://nullai.tech · everything free.',
    repos: () => 'https://github.com/1nc0gn30 · https://github.com/NullAITech',
    tip: () => 'stripe: https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X · sol: GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK',
    sudo: () => 'nice try.',
    clear: () => { out.textContent = ''; return null; },
    exit: () => { dlg.close(); return null; }
  };

  function openTerm() {
    if (dlg.open) return;
    out.textContent = 'github × 1nc0gn30 shell · type help\n';
    dlg.showModal();
    inp.focus();
  }
  const termBtn = document.getElementById('termBtn');
  if (termBtn) termBtn.addEventListener('click', openTerm);
  addEventListener('keydown', e => {
    if (e.key === '`' && document.activeElement !== inp) {
      e.preventDefault();
      openTerm();
    }
  });
  document.getElementById('termForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = inp.value.trim().toLowerCase();
    inp.value = '';
    if (!v) return;
    say('$ ' + v);
    const parts = v.split(/\s+/);
    const f = CMD[parts[0]];
    const r = f ? f(parts[1]) : 'command not found: ' + v + ' (try help)';
    if (r) say(r);
  });
})();
