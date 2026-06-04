/**
 * GoViral AI - Visualizer Module (Audience Retention Charting)
 */

class RetentionVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.width = 0;
    this.height = 0;
    this.padding = { top: 20, right: 30, bottom: 30, left: 40 };
    
    // Default mock data (percentage retention over 30 seconds)
    this.benchmarkData = [
      { x: 0, y: 100 }, { x: 3, y: 92 }, { x: 6, y: 88 }, { x: 9, y: 85 },
      { x: 12, y: 82 }, { x: 15, y: 80 }, { x: 18, y: 77 }, { x: 21, y: 75 },
      { x: 24, y: 72 }, { x: 27, y: 70 }, { x: 30, y: 68 }
    ];

    this.baseVideoData = [
      { x: 0, y: 100 }, { x: 3, y: 74 }, { x: 6, y: 70 }, { x: 9, y: 68 },
      { x: 12, y: 40 }, { x: 15, y: 44 }, { x: 18, y: 43 }, { x: 21, y: 41 },
      { x: 24, y: 39 }, { x: 27, y: 37 }, { x: 30, y: 35 }
    ];

    this.activeVideoData = JSON.parse(JSON.stringify(this.baseVideoData));
    
    // Listen for window resize to redraw graph responsively
    window.addEventListener('resize', () => this.resize());
  }

  init() {
    this.resize();
  }

  resize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.draw();
  }

  // Adjusts the retention curve based on applied checklist fixes
  updateFixes(fixes) {
    this.activeVideoData = JSON.parse(JSON.stringify(this.baseVideoData));
    
    // Fix 1: Add Text Overlay to Hook (Boosts first 3s)
    if (fixes.hookOverlay) {
      for (let i = 1; i <= 3; i++) {
        this.activeVideoData[i].y += 8; // Boost points after 0s
      }
    }
    
    // Fix 2: Cut silence at 0:12 (Fills the drop-off valley)
    if (fixes.pacingCut) {
      for (let i = 4; i < this.activeVideoData.length; i++) {
        // Shift values at and after 12s upward to smooth out drop-off
        const recovery = 18 - (i - 4) * 0.8;
        this.activeVideoData[i].y += Math.max(0, recovery);
      }
    }

    // Fix 3: Music boost (Brings up retention in middle section)
    if (fixes.musicBoost) {
      for (let i = 3; i < 8; i++) {
        this.activeVideoData[i].y += 4;
      }
    }

    // Fix 4: CTA end (Increases the final frames)
    if (fixes.ctaEnd) {
      this.activeVideoData[this.activeVideoData.length - 1].y += 5;
      this.activeVideoData[this.activeVideoData.length - 2].y += 3;
    }

    // Cap at 99% to keep realistic
    this.activeVideoData.forEach(pt => {
      if (pt.x > 0 && pt.y > 99) pt.y = 99;
    });

    this.draw();
  }

  // Draw chart elements inside the SVG
  draw() {
    if (this.width === 0 || this.height === 0) return;
    
    // Clear existing
    this.container.innerHTML = '';
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'svg-chart');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    
    // Define Gradients and Filters
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--violet)" stop-opacity="0.3"></stop>
        <stop offset="100%" stop-color="var(--violet)" stop-opacity="0.0"></stop>
      </linearGradient>
      <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="var(--violet)"></stop>
        <stop offset="50%" stop-color="var(--cyber-blue)"></stop>
        <stop offset="100%" stop-color="var(--violet)"></stop>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    `;
    svg.appendChild(defs);
    
    // Grid Lines & Background Markers
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Horizontal lines at 25%, 50%, 75%, 100%
    const levels = [25, 50, 75, 100];
    levels.forEach(lvl => {
      const y = this.valToY(lvl);
      
      // Grid line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', this.padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', this.width - this.padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'hsla(var(--border-dim) / 0.4)');
      line.setAttribute('stroke-dasharray', '4,4');
      gridGroup.appendChild(line);
      
      // Y-axis label text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', this.padding.left - 10);
      text.setAttribute('y', y + 4);
      text.setAttribute('fill', 'hsla(var(--text-muted) / 0.8)');
      text.setAttribute('font-size', '10px');
      text.setAttribute('text-anchor', 'end');
      text.textContent = `${lvl}%`;
      gridGroup.appendChild(text);
    });
    
    // X-axis timeline markers (every 5 seconds)
    for (let sec = 0; sec <= 30; sec += 5) {
      const x = this.timeToX(sec);
      
      // Timeline tick label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', this.height - this.padding.bottom + 18);
      text.setAttribute('fill', 'hsla(var(--text-muted) / 0.8)');
      text.setAttribute('font-size', '10px');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = `0:${sec.toString().padStart(2, '0')}`;
      gridGroup.appendChild(text);
    }
    svg.appendChild(gridGroup);
    
    // Draw Viral Benchmark Path
    const benchmarkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    benchmarkPath.setAttribute('d', this.pointsToPath(this.benchmarkData));
    benchmarkPath.setAttribute('fill', 'none');
    benchmarkPath.setAttribute('stroke', 'hsla(var(--text-muted) / 0.3)');
    benchmarkPath.setAttribute('stroke-width', '2');
    benchmarkPath.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(benchmarkPath);
    
    // Draw Area under Active Video Path
    const activeAreaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathD = this.pointsToPath(this.activeVideoData);
    const closedD = `${pathD} L ${this.timeToX(30)} ${this.height - this.padding.bottom} L ${this.padding.left} ${this.height - this.padding.bottom} Z`;
    activeAreaPath.setAttribute('d', closedD);
    activeAreaPath.setAttribute('fill', 'url(#area-gradient)');
    svg.appendChild(activeAreaPath);
    
    // Draw Active Video Stroke Path
    const activeStrokePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    activeStrokePath.setAttribute('d', pathD);
    activeStrokePath.setAttribute('fill', 'none');
    activeStrokePath.setAttribute('stroke', 'url(#line-gradient)');
    activeStrokePath.setAttribute('stroke-width', '3');
    activeStrokePath.setAttribute('filter', 'url(#glow)');
    svg.appendChild(activeStrokePath);
    
    // Dropoff Highlight Point (only show if pacing issue is NOT resolved)
    const dropoffChecked = document.getElementById('fix-pacing-cut')?.checked;
    if (!dropoffChecked) {
      const markerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const dropX = this.timeToX(12);
      const dropY = this.valToY(40);
      
      // Glowing highlight ring
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', dropX);
      ring.setAttribute('cy', dropY);
      ring.setAttribute('r', '8');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', 'hsl(var(--gold))');
      ring.setAttribute('stroke-width', '2');
      ring.innerHTML = `<animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />`;
      
      // Solid center dot
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', dropX);
      dot.setAttribute('cy', dropY);
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', 'hsl(var(--gold))');
      
      markerGroup.appendChild(ring);
      markerGroup.appendChild(dot);
      svg.appendChild(markerGroup);
    }
    
    this.container.appendChild(svg);
  }

  // Coordinate Converters
  timeToX(time) {
    const minX = this.padding.left;
    const maxX = this.width - this.padding.right;
    return minX + (time / 30) * (maxX - minX);
  }

  valToY(val) {
    const minY = this.padding.top;
    const maxY = this.height - this.padding.bottom;
    return maxY - (val / 100) * (maxY - minY);
  }

  // Curve interpolation (simplifies line drawing)
  pointsToPath(points) {
    if (points.length === 0) return '';
    
    let path = `M ${this.timeToX(points[0].x)} ${this.valToY(points[0].y)}`;
    
    for (let i = 1; i < points.length; i++) {
      const x0 = this.timeToX(points[i - 1].x);
      const y0 = this.valToY(points[i - 1].y);
      const x1 = this.timeToX(points[i].x);
      const y1 = this.valToY(points[i].y);
      
      // Control points for smooth bezier curves
      const cpX1 = x0 + (x1 - x0) / 2;
      const cpY1 = y0;
      const cpX2 = x0 + (x1 - x0) / 2;
      const cpY2 = y1;
      
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x1} ${y1}`;
    }
    
    return path;
  }
}

// Global hook
window.RetentionVisualizer = RetentionVisualizer;
