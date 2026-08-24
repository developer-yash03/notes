/**
 * JAVASCRIPT CONCEPTS DEMONSTRATION MODULE
 * -------------------------------------------------------------
 * 1. Closures (Debounce & State Enclosure)
 * 2. Event Loop (Macrotasks vs Microtasks)
 * 3. Hoisting (Function Declarations vs TDZ)
 * 4. Promises vs Callbacks (Wrapping Callbacks into Promises)
 */

// =============================================================
// 1. CLOSURES
// =============================================================
/**
 * `createDebouncedSearch` creates a closure over the `timeoutId` variable.
 * The returned function retains access to its lexical scope (`timeoutId`)
 * even after `createDebouncedSearch` has finished executing.
 */
export function createDebouncedSearch(callback, delay = 300) {
  let timeoutId = null; // Enclosed in closure

  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

/**
 * Closure-based note statistics generator.
 * Encapsulates calculation rules inside a private lexical scope.
 */
export function createStatsTracker() {
  let actionCount = 0; // Private state via closure

  return {
    trackAction(actionName) {
      actionCount++;
      return `${actionName} (Total actions in session: ${actionCount})`;
    },
    getCount() {
      return actionCount;
    }
  };
}

// =============================================================
// 2. EVENT LOOP (Microtasks vs Macrotasks)
// =============================================================
/**
 * Demonstrates the JavaScript Event Loop prioritization:
 * - Microtasks (queueMicrotask, Promise.resolve) run BEFORE the next render/macrotask.
 * - Macrotasks (setTimeout, setInterval) run in subsequent event loop ticks.
 */
export function scheduleToastNotification(message, setNotification, duration = 3500) {
  // Step 1: Synchronous execution
  console.log('[Event Loop] 1. Synchronous: Preparing notification request');

  // Step 2: Microtask Queue (immediate prioritization before repaint)
  queueMicrotask(() => {
    console.log('[Event Loop] 2. Microtask: State initialized immediately in current tick');
    setNotification({ message, type: 'info', visible: true });
  });

  // Step 3: Macrotask Queue (timer placed in Macrotask queue)
  const timer = setTimeout(() => {
    console.log('[Event Loop] 3. Macrotask (setTimeout): Dismissing notification after delay');
    setNotification(prev => ({ ...prev, visible: false }));
  }, duration);

  return timer;
}

// =============================================================
// 3. HOISTING
// =============================================================
/**
 * Demonstrating Hoisting:
 * `formatNoteDate` and `calculateReadingTime` are function declarations.
 * JavaScript hoists function declarations entirely to the top of their scope,
 * meaning they can be called anywhere in this file, even BEFORE their declaration line!
 */
export function processNoteMetadata(note) {
  // These functions are invoked HERE, before their definitions below,
  // demonstrating JavaScript function declaration hoisting.
  const formattedDate = formatNoteDate(note.createdAt);
  const readingTime = calculateReadingTime(note.content);
  return { formattedDate, readingTime };
}

// Hoisted Function Declaration 1
function formatNoteDate(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Hoisted Function Declaration 2
function calculateReadingTime(text) {
  if (!text) return '1 min read';
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// =============================================================
// 4. PROMISES VS CALLBACKS
// =============================================================
/**
 * Traditional Callback Pattern:
 * Asynchronous operation that depends on error-first callback.
 */
export function readNoteFileWithCallback(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(null, reader.result);
  reader.onerror = () => callback(new Error('Failed to read file'), null);
  reader.readAsText(file);
}

/**
 * Promise-based Modern Pattern:
 * Refactors the callback-based FileReader into a clean, chainable Promise.
 * Solves "Callback Hell" and provides async/await compatibility.
 */
export function readNoteFileWithPromise(file) {
  return new Promise((resolve, reject) => {
    readNoteFileWithCallback(file, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}
