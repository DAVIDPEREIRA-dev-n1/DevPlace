// ==================== ESTADO DA APLICAÇÃO ====================

let currentUser = null;
let posts = [];


// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', async function () {

    // Carregar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Verificar se existe sessão guardada
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showFeed();
        } catch (error) {
            localStorage.removeItem('currentUser');
        }
    }

    // Login
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registo
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Converter emails para minúsculas
    const loginEmail = document.getElementById('loginEmail');

    if (loginEmail) {
        loginEmail.addEventListener('input', function () {
            this.value = this.value.toLowerCase();
        });
    }

    const registerEmail = document.getElementById('registerEmail');

    if (registerEmail) {
        registerEmail.addEventListener('input', function () {
            this.value = this.value.toLowerCase();
        });
    }
});


// ==================== API ====================

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(`api/${endpoint}`, {
            ...options,

            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        const text = await response.text();

        console.log('Resposta do servidor:', text);

        let data;

        try {
            data = JSON.parse(text);
        } catch (error) {

            console.error(
                'O servidor não devolveu JSON:',
                text
            );

            throw new Error(
                'O servidor devolveu uma resposta inválida. ' +
                'Vê a consola (F12) para descobrir o erro.'
            );
        }

        if (!response.ok) {

            throw new Error(
                data.message ||
                'Ocorreu um erro no servidor.'
            );
        }

        return data;

    } catch (error) {

        console.error('Erro API:', error);

        throw error;
    }
}


// ==================== LOGIN / REGISTO ====================

function togglePages() {

    document
        .getElementById('loginPage')
        .classList
        .toggle('active');

    document
        .getElementById('registerPage')
        .classList
        .toggle('active');
}


// ==================== LOGIN ====================

async function handleLogin(e) {

    e.preventDefault();

    const email = document
        .getElementById('loginEmail')
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById('loginPassword')
        .value;

    if (!email || !password) {
        alert('Preenche o email e a senha.');
        return;
    }

    try {

        const response = await fetch('api/login.php', {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.message || 'Erro ao fazer login.');

            return;
        }

        if (data.success) {

            currentUser = {
                id: data.user.id,
                name: data.user.username,
                email: data.user.email,
                password: password,
                avatar: data.user.avatar || '👤',
                bio: data.user.bio || ''
            };

            localStorage.setItem(
                'currentUser',
                JSON.stringify(currentUser)
            );

            showFeed();

            document
                .getElementById('loginForm')
                .reset();
        }

    } catch (error) {

        console.error('Erro no login:', error);

        alert(
            'O servidor devolveu uma resposta inválida. ' +
            'Vê a consola (F12) para descobrir o erro.'
        );
    }
}

// ==================== REGISTO ====================

async function handleRegister(e) {

    e.preventDefault();

    const name =
        document.getElementById('registerName').value.trim();

    const email =
        document.getElementById('registerEmail').value.trim();

    const password =
        document.getElementById('registerPassword').value;

    const confirm =
        document.getElementById('registerConfirm').value;


    if (!name || !email || !password || !confirm) {

        alert('Preencha todos os campos!');

        return;
    }


    if (password !== confirm) {

        alert('As senhas não coincidem!');

        return;
    }


    if (password.length < 6) {

        alert(
            'A senha deve ter pelo menos 6 caracteres!'
        );

        return;
    }


    try {

        await apiRequest('register.php', {

            method: 'POST',

            body: JSON.stringify({

                name: name,
                email: email,
                password: password

            })
        });


        alert(
            'Conta criada com sucesso! Faça login.'
        );


        document
            .getElementById('registerForm')
            .reset();


        togglePages();

    } catch (error) {

        alert(error.message);
    }
}


// ==================== FEED ====================

function showFeed() {

    document
        .getElementById('loginPage')
        .classList
        .remove('active');

    document
        .getElementById('registerPage')
        .classList
        .remove('active');

    document
        .getElementById('feedPage')
        .classList
        .add('active');


    // Nome
    document
        .getElementById('userName')
        .textContent =
        currentUser.name;


    // Avatar
    document
        .getElementById('userAvatarDisplay')
        .textContent =
        currentUser.avatar || '👤';


    // Localização
    document
        .getElementById('userEmail')
        .textContent =
        currentUser.location || '@usuario';


    // Avatar do post
    document
        .getElementById('createPostAvatar')
        .textContent =
        currentUser.avatar || '👤';


    // Carregar posts
    loadPosts();
}


// ==================== FICHEIROS ====================

function openFileInput(type) {

    const input = document.getElementById(
        type === 'image'
            ? 'imageInput'
            : 'videoInput'
    );

    input.click();
}


// ==================== CRIAR POST ====================

async function createPost() {

    const text =
        document
            .getElementById('postText')
            .value
            .trim();


    const imageInput =
        document.getElementById('imageInput');

    const videoInput =
        document.getElementById('videoInput');


    if (
        !text &&
        !imageInput.files.length &&
        !videoInput.files.length
    ) {

        alert(
            'Escreva algo ou adicione uma foto/vídeo!'
        );

        return;
    }


    /*
        Nesta primeira versão estamos a mandar
        apenas texto para a API.

        O upload de imagens/vídeos precisa de
        FormData + backend PHP para guardar os ficheiros.
    */

    if (
        imageInput.files.length ||
        videoInput.files.length
    ) {

        alert(
            'O upload de imagens/vídeos será ligado ao PHP depois.'
        );

        return;
    }


    try {

        await apiRequest('create_post.php', {

            method: 'POST',

            body: JSON.stringify({

                text: text

            })
        });


        // Limpar
        document
            .getElementById('postText')
            .value = '';

        imageInput.value = '';
        videoInput.value = '';


        // Atualizar feed
        loadPosts();

    } catch (error) {

        alert(error.message);
    }
}


// ==================== CARREGAR POSTS ====================

async function loadPosts() {

    const container =
        document.getElementById('postsContainer');


    container.innerHTML = '';


    try {

        const data =
            await apiRequest('posts.php', {

                method: 'GET'

            });


        posts = data.posts || [];


        if (posts.length === 0) {

            container.innerHTML = `
                <p style="
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 40px;
                ">
                    Nenhum post ainda.
                    Seja o primeiro a publicar!
                </p>
            `;

            return;
        }


        posts.forEach(post => {

            const postElement =
                createPostElement(post);

            container.appendChild(postElement);

        });


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p style="
                text-align:center;
                padding:40px;
            ">
                Não foi possível carregar os posts.
            </p>
        `;
    }
}


// ==================== ELEMENTO DO POST ====================

function createPostElement(post) {

    const div =
        document.createElement('div');

    div.className = 'post';


    const date =
        new Date(post.created_at);


    const timeAgo =
        getTimeAgo(date);


    // Media
    let mediaHTML = '';


    if (post.media) {

        if (post.media_type === 'image') {

            mediaHTML = `
                <img
                    src="${escapeHTML(post.media)}"
                    class="post-media"
                    alt="Imagem"
                >
            `;

        } else if (post.media_type === 'video') {

            mediaHTML = `
                <video
                    src="${escapeHTML(post.media)}"
                    class="post-media"
                    controls
                    style="
                        width: 100%;
                        max-height: 400px;
                        border-radius: 10px;
                        margin-top: 12px;
                    "
                ></video>
            `;
        }
    }


    // Verificar se é o nosso post
    const isOwnPost =
        Number(post.author_id) ===
        Number(currentUser.id);


    const deleteBtn =
        isOwnPost
            ? `
                <button
                    class="post-delete"
                    onclick="deletePost(${post.id})"
                >
                    ✕
                </button>
              `
            : '';


    div.innerHTML = `

        <div class="post-top">

            <div class="post-author">

                <div class="post-avatar-small">
                    ${escapeHTML(post.avatar || '👤')}
                </div>


                <div class="post-author-info">

                    <span class="post-author-name">
                        ${escapeHTML(post.author_name)}
                    </span>


                    <span class="post-time">
                        ${timeAgo}
                    </span>

                </div>

            </div>


            ${deleteBtn}

        </div>


        <div class="post-content">

            <p class="post-text">
                ${escapeHTML(post.text || '')}
            </p>

            ${mediaHTML}

        </div>


        <div class="post-footer">

            <div
                class="post-action"
                onclick="likePost(${post.id})"
            >

                <span>❤️</span>

                <span>
                    ${post.likes}
                </span>

            </div>


            <div
                class="post-action"
                onclick="commentPost(${post.id})"
            >

                <span>💬</span>

                <span>
                    ${post.comments}
                </span>

            </div>


            <div
                class="post-action"
                onclick="sharePost(${post.id})"
            >

                <span>🔄</span>

                <span>
                    ${post.shares}
                </span>

            </div>

        </div>
    `;


    return div;
}


// ==================== LIKE ====================

async function likePost(postId) {

    try {

        await apiRequest('like_post.php', {

            method: 'POST',

            body: JSON.stringify({

                post_id: postId

            })
        });


        loadPosts();

    } catch (error) {

        alert(error.message);
    }
}


// ==================== COMENTÁRIO ====================

async function commentPost(postId) {

    const comment =
        prompt('Escreva seu comentário:');


    if (!comment || !comment.trim()) {

        return;
    }


    try {

        await apiRequest('comment_post.php', {

            method: 'POST',

            body: JSON.stringify({

                post_id: postId,

                comment: comment.trim()

            })
        });


        loadPosts();

    } catch (error) {

        alert(error.message);
    }
}


// ==================== PARTILHAR ====================

async function sharePost(postId) {

    try {

        await apiRequest('share_post.php', {

            method: 'POST',

            body: JSON.stringify({

                post_id: postId

            })
        });


        loadPosts();

        alert(
            'Post partilhado com sucesso! 🎉'
        );

    } catch (error) {

        alert(error.message);
    }
}


// ==================== ELIMINAR POST ====================

async function deletePost(postId) {

    if (
        !confirm(
            'Tem certeza que deseja eliminar este post?'
        )
    ) {

        return;
    }


    try {

        await apiRequest('delete_post.php', {

            method: 'POST',

            body: JSON.stringify({

                post_id: postId

            })
        });


        loadPosts();

    } catch (error) {

        alert(error.message);
    }
}


// ==================== LOGOUT ====================

function logout() {

    if (
        !confirm(
            'Tem certeza que deseja sair?'
        )
    ) {

        return;
    }


    currentUser = null;

    posts = [];


    localStorage.removeItem(
        'currentUser'
    );


    document
        .getElementById('feedPage')
        .classList
        .remove('active');


    document
        .getElementById('loginPage')
        .classList
        .add('active');


    document
        .getElementById('loginForm')
        .reset();
}


// ==================== TEMPO ====================

function getTimeAgo(date) {

    const now = new Date();

    const seconds =
        Math.floor(
            (now - date) / 1000
        );


    if (seconds < 60) {

        return 'agora';
    }


    if (seconds < 3600) {

        return `há ${Math.floor(seconds / 60)}m`;
    }


    if (seconds < 86400) {

        return `há ${Math.floor(seconds / 3600)}h`;
    }


    if (seconds < 2592000) {

        return `há ${Math.floor(seconds / 86400)}d`;
    }


    return date.toLocaleDateString('pt-PT');
}


// ==================== ACCOUNT SETTINGS ====================


// Menu
function toggleAccountMenu() {

    const menu =
        document.getElementById('accountMenu');


    menu.classList.toggle('active');


    if (menu.classList.contains('active')) {

        const closeMenu = function (e) {

            if (
                !e.target.closest('.user-info') &&
                !e.target.closest('.account-menu')
            ) {

                menu.classList.remove('active');

                document.removeEventListener(
                    'click',
                    closeMenu
                );
            }
        };


        setTimeout(() => {

            document.addEventListener(
                'click',
                closeMenu
            );

        }, 0);
    }
}


// ==================== EDITAR PERFIL ====================

function openEditProfileModal() {

    document
        .getElementById('accountMenu')
        .classList
        .remove('active');


    document
        .getElementById('editName')
        .value =
        currentUser.name || '';


    document
        .getElementById('editBio')
        .value =
        currentUser.bio || '';


    document
        .getElementById('editLocation')
        .value =
        currentUser.location || '';


    document
        .getElementById('currentAvatar')
        .textContent =
        currentUser.avatar || '👤';


    document
        .getElementById('newAvatar')
        .value =
        currentUser.avatar || '👤';


    document
        .getElementById('editProfileModal')
        .classList
        .add('active');
}


function closeEditProfileModal() {

    document
        .getElementById('editProfileModal')
        .classList
        .remove('active');
}


// ==================== AVATAR ====================

function changeAvatar(emoji) {

    document
        .getElementById('currentAvatar')
        .textContent =
        emoji;


    document
        .getElementById('newAvatar')
        .value =
        emoji;
}


// ==================== GUARDAR PERFIL ====================

async function saveProfileChanges(e) {

    e.preventDefault();


    const newAvatar =
        document.getElementById('newAvatar').value;


    const newName =
        document
            .getElementById('editName')
            .value
            .trim();


    const newBio =
        document
            .getElementById('editBio')
            .value
            .trim();


    const newLocation =
        document
            .getElementById('editLocation')
            .value
            .trim();


    if (!newName) {

        alert(
            'Nome não pode estar vazio!'
        );

        return;
    }


    try {

        const data =
            await apiRequest(
                'update_profile.php',
                {

                    method: 'POST',

                    body: JSON.stringify({

                        name: newName,

                        bio: newBio,

                        location: newLocation,

                        avatar: newAvatar

                    })
                }
            );


        currentUser = data.user;


        localStorage.setItem(
            'currentUser',
            JSON.stringify(currentUser)
        );


        // Atualizar UI
        document
            .getElementById('userAvatarDisplay')
            .textContent =
            currentUser.avatar || '👤';


        document
            .getElementById('userName')
            .textContent =
            currentUser.name;


        document
            .getElementById('userEmail')
            .textContent =
            currentUser.location || '@usuario';


        document
            .getElementById('createPostAvatar')
            .textContent =
            currentUser.avatar || '👤';


        loadPosts();


        closeEditProfileModal();


        alert(
            'Perfil atualizado com sucesso! ✅'
        );

    } catch (error) {

        alert(error.message);
    }
}


// ==================== SETTINGS ====================

function openSettingsModal() {

    document
        .getElementById('accountMenu')
        .classList
        .remove('active');


    const settings =
        JSON.parse(
            localStorage.getItem(
                'userSettings_' +
                currentUser.id
            )
        ) || {};


    document
        .getElementById('privateAccount')
        .checked =
        settings.privateAccount || false;


    document
        .getElementById('allowComments')
        .checked =
        settings.allowComments !== false;


    document
        .getElementById('notifLikes')
        .checked =
        settings.notifLikes !== false;


    document
        .getElementById('notifComments')
        .checked =
        settings.notifComments !== false;


    document
        .getElementById('notifFollows')
        .checked =
        settings.notifFollows !== false;


    document
        .getElementById('settingsModal')
        .classList
        .add('active');
}


function closeSettingsModal() {

    document
        .getElementById('settingsModal')
        .classList
        .remove('active');
}


function saveSettings() {

    const settings = {

        privateAccount:
            document.getElementById(
                'privateAccount'
            ).checked,

        allowComments:
            document.getElementById(
                'allowComments'
            ).checked,

        notifLikes:
            document.getElementById(
                'notifLikes'
            ).checked,

        notifComments:
            document.getElementById(
                'notifComments'
            ).checked,

        notifFollows:
            document.getElementById(
                'notifFollows'
            ).checked
    };


    localStorage.setItem(

        'userSettings_' +
        currentUser.id,

        JSON.stringify(settings)
    );


    closeSettingsModal();


    alert(
        'Configurações guardadas com sucesso! ✅'
    );
}


// ==================== ALTERAR PASSWORD ====================

function openChangePasswordModal() {

    closeSettingsModal();


    document
        .getElementById('changePasswordModal')
        .classList
        .add('active');
}


function closeChangePasswordModal() {

    document
        .getElementById('changePasswordModal')
        .classList
        .remove('active');
}


async function saveNewPassword(e) {

    e.preventDefault();


    const currentPassword =
        document.getElementById(
            'currentPassword'
        ).value;


    const newPassword =
        document.getElementById(
            'newPassword'
        ).value;


    const confirmPassword =
        document.getElementById(
            'confirmNewPassword'
        ).value;


    if (
        newPassword !==
        confirmPassword
    ) {

        alert(
            'As senhas novas não coincidem!'
        );

        return;
    }


    if (newPassword.length < 6) {

        alert(
            'A senha deve ter pelo menos 6 caracteres!'
        );

        return;
    }


    try {

        await apiRequest(
            'change_password.php',
            {

                method: 'POST',

                body: JSON.stringify({

                    current_password:
                        currentPassword,

                    new_password:
                        newPassword

                })
            }
        );


        document
            .getElementById(
                'changePasswordForm'
            )
            .reset();


        closeChangePasswordModal();


        alert(
            'Senha alterada com sucesso! ✅'
        );

    } catch (error) {

        alert(error.message);
    }
}


// ==================== ELIMINAR CONTA ====================

async function deleteAccount() {

    const confirmation =
        prompt(
            'Tem certeza? Esta ação é irreversível.\n' +
            'Digite "CONFIRMAR" para eliminar sua conta:'
        );


    if (confirmation !== 'CONFIRMAR') {

        if (confirmation !== null) {

            alert(
                'Operação cancelada.'
            );
        }

        return;
    }


    try {

        await apiRequest(
            'delete_account.php',
            {

                method: 'POST'

            }
        );


        localStorage.removeItem(
            'currentUser'
        );


        localStorage.removeItem(
            'userSettings_' +
            currentUser.id
        );


        currentUser = null;

        posts = [];


        alert(
            'Conta eliminada com sucesso.'
        );


        document
            .getElementById('settingsModal')
            .classList
            .remove('active');


        document
            .getElementById('feedPage')
            .classList
            .remove('active');


        document
            .getElementById('loginPage')
            .classList
            .add('active');


    } catch (error) {

        alert(error.message);
    }
}


// ==================== FECHAR MODAIS ====================

document.addEventListener(
    'click',
    function (e) {

        const modals =
            document.querySelectorAll(
                '.modal.active'
            );


        modals.forEach(modal => {

            if (e.target === modal) {

                modal.classList.remove(
                    'active'
                );
            }
        });
    }
);


// ==================== TEMA ESCURO ====================

function toggleTheme() {

    const html =
        document.getElementById(
            'htmlElement'
        );


    const currentTheme =
        html.getAttribute(
            'data-theme'
        );


    const newTheme =
        currentTheme === 'dark'
            ? 'light'
            : 'dark';


    setTheme(newTheme);
}


function setTheme(theme) {

    const html =
        document.getElementById(
            'htmlElement'
        );


    html.setAttribute(
        'data-theme',
        theme
    );


    localStorage.setItem(
        'theme',
        theme
    );


    const themeBtn =
        document.querySelector(
            '.theme-toggle'
        );


    if (themeBtn) {

        themeBtn.textContent =
            theme === 'dark'
                ? '☀️'
                : '🌙';
    }
}


// ==================== SEGURANÇA ====================

function escapeHTML(value) {

    const div =
        document.createElement('div');


    div.textContent =
        value ?? '';


    return div.innerHTML;
}