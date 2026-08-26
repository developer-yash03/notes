export function createDebouncedSearch(callback, delay = 300) {
  let timeoutId = null;

  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export function createStatsTracker() {
  let actionCount = 0;

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

export function scheduleToastNotification(message, setNotification, duration = 3500) {
  queueMicrotask(() => {
    setNotification({ message, type: 'info', visible: true });
  });

  const timer = setTimeout(() => {
    setNotification(prev => ({ ...prev, visible: false }));
  }, duration);

  return timer;
}

export function processNoteMetadata(note) {
  const formattedDate = formatNoteDate(note.createdAt);
  const readingTime = calculateReadingTime(note.content);
  return { formattedDate, readingTime };
}

function formatNoteDate(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function calculateReadingTime(text) {
  if (!text) return '1 min read';
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export function readNoteFileWithCallback(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(null, reader.result);
  reader.onerror = () => callback(new Error('Failed to read file'), null);
  reader.readAsText(file);
}

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
