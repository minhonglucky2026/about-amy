const form = document.getElementById('gbForm');
const list = document.getElementById('gbList');
const status = document.getElementById('gbStatus');
const submit = document.getElementById('gbSubmit');

function renderMessages(messages) {
  if (!messages.length) return;
  list.replaceChildren(...messages.map(({name, message, created}) => {
    const item = document.createElement('article');
    const meta = document.createElement('div');
    const author = document.createElement('strong');
    const time = document.createElement('time');
    const body = document.createElement('p');
    item.className = 'gb-item';
    meta.className = 'gb-meta';
    author.textContent = name;
    time.dateTime = created;
    time.textContent = new Date(created).toLocaleString('zh-CN');
    body.textContent = message;
    meta.append(author, time);
    item.append(meta, body);
    return item;
  }));
}

async function requestMessages(options) {
  const response = await fetch('/api/messages', options);
  if (!response.ok) throw new Error('留言服务暂时不可用');
  renderMessages(await response.json());
}

requestMessages().catch(() => {
  status.textContent = '请通过配套服务打开页面以使用留言功能。';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const {name, message} = Object.fromEntries(new FormData(form));
  if (!name.trim() || !message.trim()) {
    status.textContent = '请填写称呼和留言。';
    return;
  }
  submit.disabled = true;
  status.textContent = '';
  try {
    await requestMessages({
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, message})
    });
    form.reset();
    status.textContent = '留言已发布。';
  } catch {
    status.textContent = '发布失败，请稍后重试。';
  } finally {
    submit.disabled = false;
  }
});
