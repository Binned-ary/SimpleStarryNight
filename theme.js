function waitForElement(selector, func) {
  const observer = new MutationObserver(() => {
    const el = document.querySelector(selector);
    if (el) {
      observer.disconnect();
      func(el);
    }
  });

  const el = document.querySelector(selector);
  if (el) {
    func(el);
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function drawStarsWithCanvas(ctx, width, height, starColor) {
  const canvasSize = width * height;
  const starsFraction = canvasSize / 4000;
  
  ctx.clearRect(0, 0, width, height);
  
  for (let i = 0; i < starsFraction; i++) {
    const x = random(0, width);
    const y = random(0, height);
    const size = Math.random() < 0.5 ? 1 : 1.5;
    const opacity = random(0.5, 1);
    
    ctx.globalAlpha = opacity;
    ctx.fillStyle = starColor;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

waitForElement('.Root__top-container', (topContainer) => {
  const r = document.documentElement;
  const rs = window.getComputedStyle(r);
  const starColor = rs.getPropertyValue('--spice-star').trim();
  const starGlowColor = rs.getPropertyValue('--spice-star-glow').trim();

  const backgroundContainer = document.createElement('div');
  backgroundContainer.className = 'starrynight-bg-container';
  topContainer.appendChild(backgroundContainer);

  topContainer.style.zIndex = '0';

  // Create canvas for stars (much more performant than DOM elements)
  const canvas = document.createElement('canvas');
  canvas.className = 'starrynight-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = backgroundContainer.clientWidth * dpr;
    canvas.height = backgroundContainer.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    drawStarsWithCanvas(ctx, canvas.width / dpr, canvas.height / dpr, starColor);
  }

  backgroundContainer.appendChild(canvas);
  resizeCanvas();
  
  // Debounce resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 250);
  }, { passive: true });

  // Create shooting stars with CSS animation (simplified - no dynamic repositioning)
  const shootingStarGlowColor = `rgba(${rs.getPropertyValue(
    '--spice-rgb-shooting-star-glow'
  )},${0.1})`;
  
  for (let i = 0; i < 3; i++) {
    const shootingstar = document.createElement('span');
    shootingstar.className = 'shootingstar';
    
    if (Math.random() < 0.75) {
      shootingstar.style.top = '-4px';
      shootingstar.style.right = `${random(0, 90)}%`;
    } else {
      shootingstar.style.top = `${random(0, 50)}%`;
      shootingstar.style.right = '-4px';
    }

    shootingstar.style.boxShadow = `0 0 0 4px ${shootingStarGlowColor}, 0 0 0 8px ${shootingStarGlowColor}, 0 0 20px ${shootingStarGlowColor}`;
    shootingstar.style.animationDuration = `${Math.floor(Math.random() * 3) + 3}s`;
    shootingstar.style.animationDelay = `${Math.floor(Math.random() * 7)}s`;

    backgroundContainer.appendChild(shootingstar);
  }
  function updateOffsets() {
    const topBar = document.querySelector('.main-topBar-background');
    const nav = document.querySelector('.Root__globalNav');

    if (!topBar || !nav) return;

    const topBarHeight = topBar.offsetHeight;
    const navHeight = nav.offsetHeight;
    const totalOffset = topBarHeight + navHeight;

    document.documentElement.style.setProperty(
      '--header-offset',
      totalOffset * -1 + 'px'
    );
  }

  // Use ResizeObserver for efficient offset updates
  const resizeObserver = new ResizeObserver(updateOffsets);
  const topBar = document.querySelector('.main-topBar-background');
  const nav = document.querySelector('.Root__globalNav');
  
  if (topBar) resizeObserver.observe(topBar);
  if (nav) resizeObserver.observe(nav);

  updateOffsets();
});