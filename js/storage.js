/**
 * localStorage操作を管理するモジュール
 * TODOデータの永続化を担当
 */

// localStorageのキー名
const STORAGE_KEY = 'todos';

/**
 * localStorageから全てのTODOを取得
 * @returns {Array} TODOオブジェクトの配列
 */
function getTodos() {
  try {
    const todosJson = localStorage.getItem(STORAGE_KEY);

    // データが存在しない場合は空配列を返す
    if (!todosJson) {
      return [];
    }

    // JSON文字列をパースして配列として返す
    const todos = JSON.parse(todosJson);

    // 配列であることを確認
    if (!Array.isArray(todos)) {
      console.warn('Invalid todos data format. Resetting to empty array.');
      return [];
    }

    return todos;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    // エラーが発生した場合は空配列を返す
    return [];
  }
}

/**
 * TODOの配列をlocalStorageに保存
 * @param {Array} todos - 保存するTODOオブジェクトの配列
 * @returns {boolean} 保存が成功したかどうか
 */
function saveTodos(todos) {
  try {
    // 配列であることを確認
    if (!Array.isArray(todos)) {
      throw new Error('todos must be an array');
    }

    // オブジェクトをJSON文字列に変換して保存
    const todosJson = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, todosJson);

    return true;
  } catch (error) {
    // QuotaExceededError: ストレージ容量超過
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      alert('ストレージ容量が一杯です。いくつかのTODOを削除してください。');
    } else {
      console.error('Error saving to localStorage:', error);
      alert('データの保存に失敗しました。');
    }

    return false;
  }
}

/**
 * localStorageから全てのTODOを削除（開発/デバッグ用）
 * @returns {boolean} 削除が成功したかどうか
 */
function clearTodos() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * localStorageの使用状況を確認（開発/デバッグ用）
 * @returns {Object} ストレージの使用状況
 */
function getStorageInfo() {
  try {
    const todosJson = localStorage.getItem(STORAGE_KEY);
    const byteSize = todosJson ? new Blob([todosJson]).size : 0;
    const kiloByteSize = (byteSize / 1024).toFixed(2);

    return {
      itemCount: getTodos().length,
      byteSize: byteSize,
      kiloByteSize: kiloByteSize + ' KB'
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}
