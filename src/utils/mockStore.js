const keyOf = (type) => `unlock_mock_${type}`;

export function loadMock(type, fallback = []) {
  try {
    const raw = localStorage.getItem(keyOf(type));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveMock(type, items) {
  localStorage.setItem(keyOf(type), JSON.stringify(items));
}

export function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
