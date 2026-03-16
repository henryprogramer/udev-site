(() => {
  const canvas = document.getElementById('binary-rain');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let running = !prefersReduced.matches;
  let width = 0;
  let height = 0;
  let fontSize = 16;
  let columnSpacing = 16;
  let columns = 0;
  let rows = 0;
  let speed = 0.08;
  let xOffset = 0;
  let offsets = [];
  let speeds = [];
  let phases = [];

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.floor(window.innerWidth);
    height = Math.floor(window.innerHeight);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fontSize = Math.max(14, Math.round(width / 95));
    columnSpacing = Math.max(16, Math.round(fontSize * 1.6));
    columns = Math.max(1, Math.floor(width / columnSpacing));
    rows = Math.ceil(height / fontSize) + 1;

    const totalWidth = columns * columnSpacing;
    xOffset = Math.max(0, Math.floor((width - totalWidth) / 2));

    offsets = Array.from({ length: columns }, () => Math.random() * rows);
    speeds = Array.from({ length: columns }, () => speed * (0.7 + Math.random() * 0.6));
    phases = Array.from({ length: columns }, () => (Math.random() > 0.5 ? 1 : 0));
  };

  const draw = () => {
    if (!running) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "Space Grotesk", "Sora", monospace`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < columns; i += 1) {
      const x = xOffset + i * columnSpacing;
      const head = offsets[i];
      const headRow = Math.floor(head) % rows;
      const trailLength = Math.min(rows, 30);

      for (let r = 0; r < rows; r += 1) {
        const y = (r + head) * fontSize;
        const yPos = y % height;
        const distance = (r - headRow + rows) % rows;
        let alpha = 0.05;

        if (distance < trailLength) {
          alpha = 0.42 - (distance / trailLength) * 0.34;
        }

        const digit = (r + phases[i]) % 2 === 0 ? '1' : '0';
        const isHighlight = distance === 0 || (distance === 1 && i % 4 === 0);
        const glowAlpha = isHighlight ? Math.min(1, alpha + 0.35) : alpha;
        const color = isHighlight ? '245, 245, 245' : '215, 215, 215';
        ctx.fillStyle = `rgba(${color}, ${glowAlpha.toFixed(2)})`;
        ctx.fillText(digit, x, yPos);
      }

      offsets[i] = (offsets[i] + speeds[i]) % rows;
    }

    requestAnimationFrame(draw);
  };

  const handleMotion = (event) => {
    running = !event.matches;
    if (running) {
      ctx.clearRect(0, 0, width, height);
      requestAnimationFrame(draw);
    }
  };

  resize();
  requestAnimationFrame(draw);
  window.addEventListener('resize', resize);
  prefersReduced.addEventListener('change', handleMotion);
})();
