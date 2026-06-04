/**
 * GoViral AI - Main Application Coordinator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Sub-Modules
  const visualizer = new window.RetentionVisualizer('svg-chart-container');
  const analyzer = new window.ContentAnalyzer();
  const coach = new window.CreatorCoach('chat-messages', 'chat-input-text', 'btn-send-message');
  
  coach.init();

  // State Management
  let isAnalyzing = false;
  let activeInputType = 'video'; // 'video' or 'text'
  
  // Element Selectors
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  
  const tabVideo = document.getElementById('tab-video');
  const tabText = document.getElementById('tab-text');
  const panelVideo = document.getElementById('panel-video');
  const panelText = document.getElementById('panel-text');
  
  const dropzone = document.getElementById('dropzone');
  const videoFileInput = document.getElementById('video-file-input');
  const btnBrowseVideo = document.getElementById('btn-browse-video');
  const uploadProgress = document.getElementById('upload-progress');
  const progressStatus = document.getElementById('progress-status');
  const progressDetail = document.getElementById('progress-detail');
  const progressBarFill = document.getElementById('progress-bar-fill');
  
  const scriptTextarea = document.getElementById('script-textarea');
  const btnAnalyzeText = document.getElementById('btn-analyze-text');
  const charCountSpan = document.getElementById('char-count');
  
  const resultsDashboard = document.getElementById('results-dashboard');
  
  // Scoring Indicators
  const txtViralityScore = document.getElementById('txt-virality-score');
  const lblViralityStatus = document.getElementById('lbl-virality-status');
  const txtHookScore = document.getElementById('txt-hook-score');
  const txtPacingScore = document.getElementById('txt-pacing-score');
  const progressFillHook = document.getElementById('progress-fill-hook');
  const progressFillPacing = document.getElementById('progress-fill-pacing');
  const lblHookFeedback = document.getElementById('lbl-hook-feedback');
  const lblPacingFeedback = document.getElementById('lbl-pacing-feedback');
  
  // Checklist Fix Checkboxes
  const fixCheckboxes = document.querySelectorAll('.fix-checkbox');
  
  // Copywriting Tabs
  const optTabHooks = document.getElementById('opt-tab-hooks');
  const optTabCaptions = document.getElementById('opt-tab-captions');
  const optPanelHooks = document.getElementById('opt-panel-hooks');
  const optPanelCaptions = document.getElementById('opt-panel-captions');
  
  // ==========================================================================
  // 1. Theme Configuration
  // ==========================================================================
  btnThemeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', targetTheme);
    
    // Toggle sun/moon icon vector inside button
    if (targetTheme === 'light') {
      btnThemeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    } else {
      btnThemeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    }
    
    // Redraw graph
    visualizer.draw();
  });

  // ==========================================================================
  // 2. Input Navigation Tabs
  // ==========================================================================
  tabVideo.addEventListener('click', () => switchTab('video'));
  tabText.addEventListener('click', () => switchTab('text'));

  function switchTab(type) {
    if (isAnalyzing) return;
    activeInputType = type;
    
    if (type === 'video') {
      tabVideo.classList.add('active');
      tabText.classList.remove('active');
      panelVideo.classList.add('active');
      panelText.classList.remove('active');
      tabVideo.setAttribute('aria-selected', 'true');
      tabText.setAttribute('aria-selected', 'false');
    } else {
      tabText.classList.add('active');
      tabVideo.classList.remove('active');
      panelText.classList.add('active');
      panelVideo.classList.remove('active');
      tabText.setAttribute('aria-selected', 'true');
      tabVideo.setAttribute('aria-selected', 'false');
    }
  }

  // ==========================================================================
  // 3. Script / Text Input Parsing
  // ==========================================================================
  scriptTextarea.addEventListener('input', () => {
    const textLength = scriptTextarea.value.length;
    charCountSpan.textContent = textLength;
  });

  btnAnalyzeText.addEventListener('click', () => {
    const text = scriptTextarea.value.trim();
    if (!text) {
      alert("Please paste a script draft to analyze.");
      return;
    }
    
    // Run text grader
    isAnalyzing = true;
    btnAnalyzeText.disabled = true;
    btnAnalyzeText.textContent = "Analyzing Script...";
    
    setTimeout(() => {
      const results = analyzer.analyzeText(text);
      displayResults(results.scores);
      
      // Customize feed descriptions for text input
      lblHookFeedback.textContent = "Verbal hooks scored according to trigger-word occurrence.";
      lblPacingFeedback.textContent = results.feedback;
      
      isAnalyzing = false;
      btnAnalyzeText.disabled = false;
      btnAnalyzeText.innerHTML = `Analyze Script <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    }, 1500);
  });

  // ==========================================================================
  // 4. Video File Upload & Dropzone Simulation
  // ==========================================================================
  
  // Drag & drop triggers
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      processVideoFile(files[0]);
    } else {
      alert("Please drop a valid video file (.mp4, .mov, etc.)");
    }
  });

  btnBrowseVideo.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop bubble so dropzone click isn't retriggered
    videoFileInput.click();
  });

  videoFileInput.addEventListener('change', () => {
    const files = videoFileInput.files;
    if (files.length > 0) {
      processVideoFile(files[0]);
    }
  });

  dropzone.addEventListener('click', () => {
    if (!isAnalyzing) videoFileInput.click();
  });

  // Upload/Processing pipeline simulator
  function processVideoFile(file) {
    isAnalyzing = true;
    uploadProgress.style.display = 'flex';
    
    // Step 1: Uploading
    let progress = 0;
    progressBarFill.style.width = '0%';
    progressStatus.textContent = "Uploading video draft...";
    progressDetail.textContent = `Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Transition to Step 2: Transcribing
        progressBarFill.style.width = '100%';
        setTimeout(() => {
          runTranscriptionPhase();
        }, 600);
      } else {
        progressBarFill.style.width = `${progress}%`;
      }
    }, 150);
  }

  function runTranscriptionPhase() {
    progressStatus.textContent = "Transcribing audio track...";
    progressDetail.textContent = "Running Speech-to-Text alignment and sentence parsing";
    progressBarFill.style.width = '0%';
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Transition to Step 3: Scene analysis
        progressBarFill.style.width = '100%';
        setTimeout(() => {
          runVisualAnalysisPhase();
        }, 500);
      } else {
        progressBarFill.style.width = `${progress}%`;
      }
    }, 200);
  }

  function runVisualAnalysisPhase() {
    progressStatus.textContent = "Analyzing visual pacing...";
    progressDetail.textContent = "Mapping motion vectors, frame-cuts, and text timings";
    progressBarFill.style.width = '0%';
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Complete Analysis
        progressBarFill.style.width = '100%';
        setTimeout(() => {
          uploadProgress.style.display = 'none';
          isAnalyzing = false;
          
          // Load base scores
          displayResults(analyzer.baseScores);
        }, 600);
      } else {
        progressBarFill.style.width = `${progress}%`;
      }
    }, 150);
  }

  // ==========================================================================
  // 5. Dashboard Update & Display Layouts
  // ==========================================================================
  function displayResults(scores) {
    // Reset checkbox fix states to unchecked on fresh analyses
    fixCheckboxes.forEach(cb => cb.checked = false);
    
    // Show results section
    resultsDashboard.classList.remove('hidden');
    
    // Smooth scroll down to result view
    resultsDashboard.scrollIntoView({ behavior: 'smooth' });
    
    // Initialize Visualizer canvas
    visualizer.init();
    visualizer.updateFixes(getCheckboxStates());
    
    // Update numerical elements with counts animations
    updateScoreUI(scores);
  }

  function updateScoreUI(scores) {
    // Trigger gauge SVG dash calculation
    // Circle perimeter: 2 * Math.PI * 40 = 251.2
    const fillPercent = scores.virality / 100;
    const offset = 251.2 - (fillPercent * 251.2);
    
    const gaugeFill = document.getElementById('gauge-fill-virality');
    if (gaugeFill) {
      gaugeFill.style.strokeDashoffset = offset;
    }
    
    // Animate numbers
    analyzer.animateNumber('txt-virality-score', scores.virality);
    analyzer.animateNumber('txt-hook-score', scores.hook);
    analyzer.animateNumber('txt-pacing-score', scores.pacing);
    
    // Set text gauges
    progressFillHook.style.width = `${scores.hook}%`;
    progressFillPacing.style.width = `${scores.pacing}%`;
    
    // Set status text
    const labelData = analyzer.getScoreLabel(scores.virality);
    lblViralityStatus.textContent = labelData.text;
    lblViralityStatus.className = `status-badge ${labelData.class}`;
  }

  // ==========================================================================
  // 6. Fix Checklist Sync
  // ==========================================================================
  fixCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const activeStates = getCheckboxStates();
      
      // Update graph line
      visualizer.updateFixes(activeStates);
      
      // Recalculate score totals
      const freshScores = analyzer.recalculateScores(activeStates);
      updateScoreUI(freshScores);
    });
  });

  function getCheckboxStates() {
    return {
      hookOverlay: document.getElementById('fix-hook-overlay').checked,
      pacingCut: document.getElementById('fix-pacing-cut').checked,
      musicBoost: document.getElementById('fix-music-boost').checked,
      ctaEnd: document.getElementById('fix-cta-end').checked
    };
  }

  // ==========================================================================
  // 7. Copywriting Panel Navigation
  // ==========================================================================
  optTabHooks.addEventListener('click', () => {
    optTabHooks.classList.add('active');
    optTabCaptions.classList.remove('active');
    optPanelHooks.classList.add('active');
    optPanelCaptions.classList.remove('active');
  });

  optTabCaptions.addEventListener('click', () => {
    optTabCaptions.classList.add('active');
    optTabHooks.classList.remove('active');
    optPanelCaptions.classList.add('active');
    optPanelHooks.classList.remove('active');
  });

  // ==========================================================================
  // 8. Clipboard Copy Utilities
  // ==========================================================================
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const textToCopy = document.getElementById(targetId)?.textContent;
      
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            const originalText = btn.textContent;
            btn.textContent = "Copied!";
            btn.style.borderColor = "var(--emerald)";
            btn.style.color = "hsl(var(--emerald))";
            
            setTimeout(() => {
              btn.textContent = originalText;
              btn.style.borderColor = "";
              btn.style.color = "";
            }, 1500);
          })
          .catch(err => {
            console.error("Clipboard copy failed:", err);
          });
      }
    });
  });
});
