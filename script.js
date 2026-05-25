// Estado da aplicação
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    // Carregar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Se já está logado, mostrar feed
    if (localStorage.getItem('currentUser')) {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        showFeed();
    }

    // Eventos de login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// Alternar entre páginas de login e registro
function togglePages() {
    document.getElementById('loginPage').classList.toggle('active');
    document.getElementById('registerPage').classList.toggle('active');
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showFeed();
        
        // Limpar formulário
        document.getElementById('loginForm').reset();
    } else {
        alert('Email ou senha incorretos!');
    }
}

// Handle Register
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;
    
    if (password !== confirm) {
        alert('As senhas não coincidem!');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('Este email já está registado!');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        avatar: '👤'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Conta criada com sucesso! Faça login.');
    togglePages();
    document.getElementById('registerForm').reset();
}

// Mostrar Feed
function showFeed() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('feedPage').classList.add('active');
    
    // Atualizar nome do utilizador
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatarDisplay').textContent = currentUser.avatar || '👤';
    document.getElementById('userEmail').textContent = currentUser.location || '@usuario';
    
    // Atualizar avatar do post
    document.getElementById('createPostAvatar').textContent = currentUser.avatar || '👤';
    
    // Carregar posts
    loadPosts();
}

// Abrir input de arquivo
function openFileInput(type) {
    const input = document.getElementById(type === 'image' ? 'imageInput' : 'videoInput');
    input.click();
}

// Criar post
function createPost() {
    const text = document.getElementById('postText').value.trim();
    const imageInput = document.getElementById('imageInput');
    const videoInput = document.getElementById('videoInput');
    
    if (!text && !imageInput.files.length && !videoInput.files.length) {
        alert('Escreva algo ou adicione uma foto/vídeo!');
        return;
    }
    
    // Ler arquivo se existir
    let mediaData = null;
    let mediaType = null;
    
    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            createPostData(text, e.target.result, 'image');
        };
        reader.readAsDataURL(imageInput.files[0]);
        return;
    }
    
    if (videoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            createPostData(text, e.target.result, 'video');
        };
        reader.readAsDataURL(videoInput.files[0]);
        return;
    }
    
    createPostData(text, null, null);
}

function createPostData(text, media, mediaType) {
    const post = {
        id: Date.now(),
        author: currentUser.name,
        authorId: currentUser.id,
        avatar: currentUser.avatar,
        text: text,
        media: media,
        mediaType: mediaType,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        shares: 0
    };
    
    posts.unshift(post);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    // Limpar inputs
    document.getElementById('postText').value = '';
    document.getElementById('imageInput').value = '';
    document.getElementById('videoInput').value = '';
    
    // Recarregar posts
    loadPosts();
}

// Carregar posts
function loadPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Nenhum post ainda. Seja o primeiro a publicar!</p>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

// Criar elemento de post
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post';
    
    const date = new Date(post.timestamp);
    const timeAgo = getTimeAgo(date);
    
    let mediaHTML = '';
    if (post.media) {
        if (post.mediaType === 'image') {
            mediaHTML = `<img src="${post.media}" class="post-media" alt="Imagem">`;
        } else if (post.mediaType === 'video') {
            mediaHTML = `<video src="${post.media}" class="post-media" controls style="width: 100%; max-height: 400px; border-radius: 10px; margin-top: 12px;"></video>`;
        }
    }
    
    const isOwnPost = post.authorId === currentUser.id;
    const deleteBtn = isOwnPost ? `<button class="post-delete" onclick="deletePost(${post.id})">✕</button>` : '';
    
    div.innerHTML = `
        <div class="post-top">
            <div class="post-author">
                <div class="post-avatar-small">${post.avatar}</div>
                <div class="post-author-info">
                    <span class="post-author-name">${post.author}</span>
                    <span class="post-time">${timeAgo}</span>
                </div>
            </div>
            ${deleteBtn}
        </div>
        <div class="post-content">
            <p class="post-text">${post.text}</p>
            ${mediaHTML}
        </div>
        <div class="post-footer">
            <div class="post-action" onclick="likePost(${post.id})">
                <span>❤️</span>
                <span>${post.likes}</span>
            </div>
            <div class="post-action" onclick="commentPost(${post.id})">
                <span>💬</span>
                <span>${post.comments}</span>
            </div>
            <div class="post-action" onclick="sharePost(${post.id})">
                <span>🔄</span>
                <span>${post.shares}</span>
            </div>
        </div>
    `;
    
    return div;
}

// Gostar de post
function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        localStorage.setItem('posts', JSON.stringify(posts));
        loadPosts();
    }
}

// Comentar post
function commentPost(postId) {
    const comment = prompt('Escreva seu comentário:');
    if (comment) {
        const post = posts.find(p => p.id === postId);
        if (post) {
            post.comments++;
            localStorage.setItem('posts', JSON.stringify(posts));
            loadPosts();
        }
    }
}

// Partilhar post
function sharePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.shares++;
        localStorage.setItem('posts', JSON.stringify(posts));
        loadPosts();
        alert('Post partilhado com sucesso! 🎉');
    }
}

// Eliminar post
function deletePost(postId) {
    if (confirm('Tem certeza que deseja eliminar este post?')) {
        posts = posts.filter(p => p.id !== postId);
        localStorage.setItem('posts', JSON.stringify(posts));
        loadPosts();
    }
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('feedPage').classList.remove('active');
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('loginForm').reset();
    }
}

// Auxiliar: Tempo relativo
function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
    if (seconds < 2592000) return `há ${Math.floor(seconds / 86400)}d`;
    
    return date.toLocaleDateString('pt-BR');
}

// Validações adicionais
document.getElementById('loginEmail').addEventListener('input', function() {
    this.value = this.value.toLowerCase();
});

document.getElementById('registerEmail').addEventListener('input', function() {
    this.value = this.value.toLowerCase();
});

// ==================== ACCOUNT SETTINGS ====================

// Mostrar/Ocultar menu dropdown de conta
function toggleAccountMenu() {
    const menu = document.getElementById('accountMenu');
    menu.classList.toggle('active');
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', function closeMenu(e) {
        if (!e.target.closest('.user-info') && !e.target.closest('.account-menu')) {
            menu.classList.remove('active');
            document.removeEventListener('click', closeMenu);
        }
    });
}

// Abrir modal de editar perfil
function openEditProfileModal() {
    document.getElementById('accountMenu').classList.remove('active');
    
    // Preencher formulário com dados atuais
    document.getElementById('editName').value = currentUser.name || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editLocation').value = currentUser.location || '';
    document.getElementById('currentAvatar').textContent = currentUser.avatar || '👤';
    document.getElementById('newAvatar').value = currentUser.avatar || '👤';
    
    document.getElementById('editProfileModal').classList.add('active');
}

// Fechar modal de editar perfil
function closeEditProfileModal() {
    document.getElementById('editProfileModal').classList.remove('active');
}

// Mudar avatar
function changeAvatar(emoji) {
    document.getElementById('currentAvatar').textContent = emoji;
    document.getElementById('newAvatar').value = emoji;
}

// Guardar alterações de perfil
function saveProfileChanges(e) {
    e.preventDefault();
    
    const newAvatar = document.getElementById('newAvatar').value;
    const newName = document.getElementById('editName').value;
    const newBio = document.getElementById('editBio').value;
    const newLocation = document.getElementById('editLocation').value;
    
    if (!newName) {
        alert('Nome não pode estar vazio!');
        return;
    }
    
    // Atualizar utilizador
    currentUser.avatar = newAvatar;
    currentUser.name = newName;
    currentUser.bio = newBio;
    currentUser.location = newLocation;
    
    // Atualizar na lista de utilizadores
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }
    
    // Guardar no localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users));
    
    // Atualizar UI
    document.getElementById('userAvatarDisplay').textContent = newAvatar;
    document.getElementById('userName').textContent = newName;
    document.getElementById('userEmail').textContent = newLocation || '@usuario';
    document.getElementById('createPostAvatar').textContent = newAvatar;
    
    // Atualizar avatar nos posts
    loadPosts();
    
    closeEditProfileModal();
    alert('Perfil atualizado com sucesso! ✅');
}

// Abrir modal de configurações
function openSettingsModal() {
    document.getElementById('accountMenu').classList.remove('active');
    
    // Carregar configurações atuais
    const settings = JSON.parse(localStorage.getItem('userSettings_' + currentUser.id)) || {};
    document.getElementById('privateAccount').checked = settings.privateAccount || false;
    document.getElementById('allowComments').checked = settings.allowComments !== false;
    document.getElementById('notifLikes').checked = settings.notifLikes !== false;
    document.getElementById('notifComments').checked = settings.notifComments !== false;
    document.getElementById('notifFollows').checked = settings.notifFollows !== false;
    
    document.getElementById('settingsModal').classList.add('active');
}

// Fechar modal de configurações
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

// Guardar configurações
function saveSettings() {
    const settings = {
        privateAccount: document.getElementById('privateAccount').checked,
        allowComments: document.getElementById('allowComments').checked,
        notifLikes: document.getElementById('notifLikes').checked,
        notifComments: document.getElementById('notifComments').checked,
        notifFollows: document.getElementById('notifFollows').checked
    };
    
    localStorage.setItem('userSettings_' + currentUser.id, JSON.stringify(settings));
    closeSettingsModal();
    alert('Configurações guardadas com sucesso! ✅');
}

// Abrir modal de mudar senha
function openChangePasswordModal() {
    closeSettingsModal();
    document.getElementById('changePasswordModal').classList.add('active');
}

// Fechar modal de mudar senha
function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').classList.remove('active');
}

// Guardar nova senha
function saveNewPassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // Validar senha atual
    if (currentPassword !== currentUser.password) {
        alert('Senha atual incorreta!');
        return;
    }
    
    // Validar senhas
    if (newPassword !== confirmPassword) {
        alert('As senhas novas não coincidem!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    // Atualizar senha
    currentUser.password = newPassword;
    
    // Atualizar utilizador
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }
    
    // Guardar no localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users));
    
    document.getElementById('changePasswordForm').reset();
    closeChangePasswordModal();
    alert('Senha alterada com sucesso! ✅');
}

// Eliminar conta
function deleteAccount() {
    const confirmation = prompt('Tem certeza? Esta ação é irreversível.\nDigite "CONFIRMAR" para eliminar sua conta:');
    
    if (confirmation === 'CONFIRMAR') {
        // Remover utilizador
        users = users.filter(u => u.id !== currentUser.id);
        
        // Remover posts do utilizador
        posts = posts.filter(p => p.authorId !== currentUser.id);
        
        // Guardar alterações
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('posts', JSON.stringify(posts));
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userSettings_' + currentUser.id);
        
        alert('Conta eliminada com sucesso.');
        
        // Voltar ao login
        currentUser = null;
        document.getElementById('settingsModal').classList.remove('active');
        document.getElementById('feedPage').classList.remove('active');
        document.getElementById('loginPage').classList.add('active');
    } else if (confirmation !== null) {
        alert('Operação cancelada.');
    }
}

// Fechar modais ao clicar fora
document.addEventListener('click', function(e) {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ==================== TEMA ESCURO ====================

// Alternar tema
function toggleTheme() {
    const html = document.getElementById('htmlElement');
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme);
}

// Definir tema
function setTheme(theme) {
    const html = document.getElementById('htmlElement');
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Atualizar emoji do botão
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}
