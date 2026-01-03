/**
 * TODOアプリケーションのメインロジック
 * CRUD操作、イベントハンドリング、DOM操作を担当
 */

// DOM要素への参照（初期化時に設定）
let todoForm;
let todoInput;
let todoList;
let emptyState;
let totalCount;
let completedCount;

/**
 * ユニークなIDを生成
 * @returns {string} ユニークなID文字列
 */
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * 統計情報を更新（合計数と完了数）
 */
function updateStats() {
  const todos = getTodos();
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;

  totalCount.textContent = total;
  completedCount.textContent = completed;

  // TODOが0個の場合は空状態を表示
  if (total === 0) {
    emptyState.classList.remove('hidden');
    todoList.style.display = 'none';
  } else {
    emptyState.classList.add('hidden');
    todoList.style.display = 'block';
  }
}

/**
 * 新しいTODOを追加
 * @param {string} text - TODOの内容
 * @returns {Object|null} 作成されたTODOオブジェクト、失敗時はnull
 */
function addTodo(text) {
  // 入力値のバリデーション
  const trimmedText = text.trim();

  if (!trimmedText) {
    alert('TODOの内容を入力してください');
    return null;
  }

  // TODOオブジェクトを作成
  const todo = {
    id: generateId(),
    text: trimmedText,
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 既存のTODOを取得して新しいTODOを追加
  const todos = getTodos();
  todos.push(todo);

  // localStorageに保存
  if (saveTodos(todos)) {
    // 画面を再レンダリング
    renderTodos();
    return todo;
  }

  return null;
}

/**
 * TODOの完了状態をトグル
 * @param {string} id - 対象TODOのID
 * @returns {boolean} 成功したかどうか
 */
function toggleTodo(id) {
  const todos = getTodos();

  // 対象のTODOを探して完了状態を反転
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    console.error('Todo not found:', id);
    return false;
  }

  todo.completed = !todo.completed;
  todo.updatedAt = Date.now();

  // 保存して再レンダリング
  if (saveTodos(todos)) {
    renderTodos();
    return true;
  }

  return false;
}

/**
 * TODOのテキストを編集
 * @param {string} id - 対象TODOのID
 * @param {string} newText - 新しいテキスト
 * @returns {boolean} 成功したかどうか
 */
function editTodo(id, newText) {
  const trimmedText = newText.trim();

  if (!trimmedText) {
    alert('TODOの内容を入力してください');
    return false;
  }

  const todos = getTodos();
  const todo = todos.find(t => t.id === id);

  if (!todo) {
    console.error('Todo not found:', id);
    return false;
  }

  todo.text = trimmedText;
  todo.updatedAt = Date.now();

  if (saveTodos(todos)) {
    renderTodos();
    return true;
  }

  return false;
}

/**
 * TODOを削除
 * @param {string} id - 削除するTODOのID
 * @returns {boolean} 成功したかどうか
 */
function deleteTodo(id) {
  const todos = getTodos();

  // 指定されたID以外のTODOでフィルタリング
  const filteredTodos = todos.filter(t => t.id !== id);

  if (filteredTodos.length === todos.length) {
    console.error('Todo not found:', id);
    return false;
  }

  if (saveTodos(filteredTodos)) {
    renderTodos();
    return true;
  }

  return false;
}

/**
 * 単一のTODOアイテムのDOM要素を作成
 * @param {Object} todo - TODOオブジェクト
 * @returns {HTMLElement} 作成されたli要素
 */
function createTodoElement(todo) {
  // li要素を作成
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.setAttribute('data-id', todo.id);

  if (todo.completed) {
    li.classList.add('completed');
  }

  // チェックボックス
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = todo.completed;

  // テキスト表示用のspan
  const textSpan = document.createElement('span');
  textSpan.className = 'todo-text';
  textSpan.textContent = todo.text;

  // アクションボタンのコンテナ
  const actions = document.createElement('div');
  actions.className = 'todo-actions';

  // 編集ボタン
  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-small btn-edit';
  editBtn.textContent = '編集';

  // 削除ボタン
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-small btn-delete';
  deleteBtn.textContent = '削除';

  // ボタンをアクションコンテナに追加
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  // 全要素をli要素に追加
  li.appendChild(checkbox);
  li.appendChild(textSpan);
  li.appendChild(actions);

  return li;
}

/**
 * 全てのTODOを画面に表示
 */
function renderTodos() {
  const todos = getTodos();

  // リストをクリア
  todoList.innerHTML = '';

  // DocumentFragmentを使用してパフォーマンスを最適化
  const fragment = document.createDocumentFragment();

  // 各TODOの要素を作成してfragmentに追加
  todos.forEach(todo => {
    const todoElement = createTodoElement(todo);
    fragment.appendChild(todoElement);
  });

  // 一度にDOMに追加
  todoList.appendChild(fragment);

  // 統計情報を更新
  updateStats();
}

/**
 * インライン編集モードを開始
 * @param {HTMLElement} todoItem - 編集するTODOアイテムの要素
 */
function startEditMode(todoItem) {
  const id = todoItem.getAttribute('data-id');
  const textSpan = todoItem.querySelector('.todo-text');
  const currentText = textSpan.textContent;

  // テキスト入力フィールドを作成
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-text-input';
  input.value = currentText;

  // textSpanをinputに置き換え
  textSpan.replaceWith(input);
  input.focus();
  input.select();

  // 編集完了の処理
  const finishEdit = () => {
    const newText = input.value;

    if (newText.trim() && newText !== currentText) {
      editTodo(id, newText);
    } else {
      // 変更なしの場合は単純に再レンダリング
      renderTodos();
    }
  };

  // Enterキーで確定
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      finishEdit();
    }
  });

  // Escapeキーでキャンセル
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      renderTodos();
    }
  });

  // フォーカスが外れたら確定
  input.addEventListener('blur', finishEdit);
}

/**
 * フォーム送信ハンドラー
 * @param {Event} event - フォーム送信イベント
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const text = todoInput.value;

  if (addTodo(text)) {
    // 成功したら入力フィールドをクリア
    todoInput.value = '';
    todoInput.focus();
  }
}

/**
 * TODOリストのクリックイベントハンドラー（イベント委譲）
 * @param {Event} event - クリックイベント
 */
function handleTodoListClick(event) {
  const target = event.target;
  const todoItem = target.closest('.todo-item');

  if (!todoItem) return;

  const id = todoItem.getAttribute('data-id');

  // チェックボックスがクリックされた場合
  if (target.className === 'todo-checkbox') {
    toggleTodo(id);
  }
  // 編集ボタンがクリックされた場合
  else if (target.classList.contains('btn-edit')) {
    startEditMode(todoItem);
  }
  // 削除ボタンがクリックされた場合
  else if (target.classList.contains('btn-delete')) {
    if (confirm('このTODOを削除してもよろしいですか？')) {
      deleteTodo(id);
    }
  }
}

/**
 * アプリケーションの初期化
 */
function init() {
  // DOM要素への参照を取得
  todoForm = document.getElementById('todo-form');
  todoInput = document.getElementById('todo-input');
  todoList = document.getElementById('todo-list');
  emptyState = document.getElementById('empty-state');
  totalCount = document.getElementById('total-count');
  completedCount = document.getElementById('completed-count');

  // イベントリスナーを設定
  todoForm.addEventListener('submit', handleFormSubmit);
  todoList.addEventListener('click', handleTodoListClick);

  // 既存のTODOを読み込んで表示
  renderTodos();

  // 入力フィールドにフォーカス
  todoInput.focus();

  console.log('TODO App initialized');
}

// DOMの読み込みが完了したら初期化
document.addEventListener('DOMContentLoaded', init);
