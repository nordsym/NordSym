/**
 * MC Bridge - Mission Control → Three.js Geometry Connection
 * NOW WITH LIVING GEOMETRY - auto-morphs every 7 seconds regardless of events
 * MC events influence WHICH shape, but morphing is CONSTANT
 */

(function() {
  'use strict';

  const MC_BRIDGE = {
    // Config
    CONVEX_URL: 'https://agile-crane-840.convex.cloud',
    POLL_INTERVAL: 10000, // 10 seconds for MC polling
    MORPH_INTERVAL: 7000, // 7 seconds between morphs - ALWAYS ALIVE
    INITIAL_DELAY: 15000, // 15 seconds - let the beautiful sphere breathe on landing
    USER_INTERACTION_PAUSE: 30000, // 30 seconds pause after user click

    // State
    lastEventId: null,
    lastMorphTime: 0,
    lastUserInteraction: 0,
    currentShapeIndex: 0,
    initialized: false,
    morphIntervalId: null,
    
    // All available shapes for cycling (curated for visual impact)
    SHAPE_CYCLE: [
      { geometry: 'fibonacci_sphere', material: 'neural' },
      { geometry: 'tesseract', material: 'crystal' },
      { geometry: 'lorenz_attractor', material: 'quantum' },
      { geometry: 'stellated_dodecahedron', material: 'crystal' },
      { geometry: 'torus', material: 'organic' },
      { geometry: 'structure', material: 'neural' },
      { geometry: 'geode', material: 'quantum' },
      { geometry: 'flower_of_life', material: 'organic' },
      { geometry: 'diamond_brilliant', material: 'crystal' },
      { geometry: 'seed_of_life', material: 'organic' },
      { geometry: 'adaptation', material: 'neural' },
      { geometry: 'relation', material: 'quantum' }
    ],

    // Activity type → Geometry mapping (MC events influence selection)
    ACTIVITY_MAP: {
      'task': { geometry: 'structure', material: 'neural' },
      'task_done': { geometry: 'tesseract', material: 'crystal' },
      'research': { geometry: 'lorenz_attractor', material: 'quantum' },
      'commit': { geometry: 'stellated_dodecahedron', material: 'crystal' },
      'email': { geometry: 'relation', material: 'neural' },
      'notification': { geometry: 'adaptation', material: 'organic' },
      'approval_request': { geometry: 'geode', material: 'quantum' },
      'deal_won': { geometry: 'diamond_brilliant', material: 'crystal' }
    },

    // Get geometry reference
    getGeometry() {
      try {
        return window.nord?.unifiedGeometry?.elasticGeometry;
      } catch (e) {
        return null;
      }
    },

    // Apply a morph
    applyMorph(mapping) {
      const geo = this.getGeometry();
      if (!geo) return false;

      try {
        if (mapping.geometry && typeof geo.morphToShape === 'function') {
          geo.morphToShape(mapping.geometry);
          console.log(`[MC-Bridge] 🔮 Morphed to: ${mapping.geometry}`);
        }
        if (mapping.material && typeof geo.setMaterial === 'function') {
          geo.setMaterial(mapping.material);
        }
        this.lastMorphTime = Date.now();
        return true;
      } catch (err) {
        console.error('[MC-Bridge] Morph error:', err);
        return false;
      }
    },

    // Get next shape in cycle
    getNextShape() {
      this.currentShapeIndex = (this.currentShapeIndex + 1) % this.SHAPE_CYCLE.length;
      return this.SHAPE_CYCLE[this.currentShapeIndex];
    },

    // Get random shape (more organic feel)
    getRandomShape() {
      const idx = Math.floor(Math.random() * this.SHAPE_CYCLE.length);
      this.currentShapeIndex = idx;
      return this.SHAPE_CYCLE[idx];
    },

    // The LIVING morph - happens every 7 seconds
    doLivingMorph() {
      // Respect user interaction pause
      const timeSinceUser = Date.now() - this.lastUserInteraction;
      if (timeSinceUser < this.USER_INTERACTION_PAUSE) {
        console.log(`[MC-Bridge] Paused (user interacted ${Math.ceil((this.USER_INTERACTION_PAUSE - timeSinceUser) / 1000)}s remaining)`);
        return;
      }

      // Pick next shape and morph
      const shape = this.getRandomShape();
      this.applyMorph(shape);
    },

    // Fetch latest MC events (influences shape selection)
    async fetchLatestEvents() {
      try {
        const response = await fetch(`${this.CONVEX_URL}/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'visualEvents:latest',
            args: {}
          })
        });
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
      } catch (err) {
        return [];
      }
    },

    // Poll MC for new events (logs them, random cycle handles morphing)
    async pollMC() {
      const events = await this.fetchLatestEvents();
      
      if (events.length > 0) {
        const latestEvent = events[0];
        
        // Just log new events - don't force morph (let random cycle be organic)
        if (latestEvent.id !== this.lastEventId) {
          console.log('[MC-Bridge] 📡 MC event:', latestEvent.type, '-', latestEvent.title);
          this.lastEventId = latestEvent.id;
        }
      }
    },

    // Notify that user interacted manually
    notifyUserInteraction() {
      this.lastUserInteraction = Date.now();
      console.log('[MC-Bridge] 👆 User interaction - pausing auto-morph for 30s');
    },

    // Initialize
    init() {
      if (this.initialized) return;

      const checkReady = () => {
        if (this.getGeometry()) {
          console.log('[MC-Bridge] ✓ Connected to geometry');
          this.initialized = true;

          // Hook into morphToShape to detect user clicks
          const geo = this.getGeometry();
          const originalMorph = geo.morphToShape.bind(geo);
          geo.morphToShape = (...args) => {
            const stack = new Error().stack || '';
            if (!stack.includes('MC_BRIDGE')) {
              this.notifyUserInteraction();
            }
            return originalMorph(...args);
          };

          // Let the beautiful landing sphere breathe for 15 seconds
          console.log('[MC-Bridge] 🌟 Letting landing sphere breathe for 15s...');
          
          setTimeout(() => {
            // Start the LIVING morph cycle - every 7 seconds
            this.morphIntervalId = setInterval(() => this.doLivingMorph(), this.MORPH_INTERVAL);
            console.log('[MC-Bridge] 💓 Living morph started (every 7s)');

            // Also poll MC for events (influences shape selection)
            setInterval(() => this.pollMC(), this.POLL_INTERVAL);
            
            // Initial MC poll (but don't morph immediately - let random cycle handle it)
            this.pollMC();
          }, this.INITIAL_DELAY);

        } else {
          setTimeout(checkReady, 1000);
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(checkReady, 2000));
      } else {
        setTimeout(checkReady, 2000);
      }
    }
  };

  // Auto-init
  MC_BRIDGE.init();
  
  // Expose for debugging
  window.MC_BRIDGE = MC_BRIDGE;
  
  console.log('[MC-Bridge] 🚀 Module loaded (LIVING MODE)');
})();
