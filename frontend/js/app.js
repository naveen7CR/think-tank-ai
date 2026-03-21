// frontend/js/app.js - Complete Think Tank AI Frontend (Enhanced)
const API_URL = 'https://think-tank-ai-backend.onrender.com/api';
let token = null;
let currentUser = null;
let socket = null;
let studyChart = null;

// ============ AUTHENTICATION ============

// Toggle between student and mentor fields in registration
function toggleRoleFields() {
    const role = document.getElementById('register-role').value;
    const studentFields = document.getElementById('student-fields');
    const mentorFields = document.getElementById('mentor-fields');

    if (role === 'student') {
        studentFields.style.display = 'block';
        mentorFields.style.display = 'none';
        toggleCollegeFields();
    } else {
        studentFields.style.display = 'none';
        mentorFields.style.display = 'block';
    }
}

// Toggle college fields based on education level
function toggleCollegeFields() {
    const education = document.getElementById('register-education').value;
    const collegeFields = document.getElementById('college-fields');
    const classField = document.getElementById('class-field');

    if (education === 'college') {
        collegeFields.style.display = 'block';
        if (classField) classField.style.display = 'block';
    } else if (education === 'graduate') {
        collegeFields.style.display = 'none';
        if (classField) classField.style.display = 'none';
    } else {
        collegeFields.style.display = 'none';
        if (classField) classField.style.display = 'block';
    }
}

// Enhanced Register function
async function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    if (!name || !email || !password) {
        alert('Please fill all required fields');
        return;
    }

    let userData = { name, email, password, role };

    if (role === 'student') {
        const education = document.getElementById('register-education').value;
        const studentClass = document.getElementById('register-class').value;

        userData.educationLevel = education;
        userData.studentClass = studentClass;

        if (education === 'college') {
            const college = document.getElementById('register-college').value;
            const branch = document.getElementById('register-branch').value;
            userData.institution = college;
            userData.branch = branch;
        } else if (education === 'school') {
            userData.institution = 'High School';
        } else {
            userData.institution = 'Graduate';
        }
    } else {
        const expertise = Array.from(document.getElementById('register-expertise').selectedOptions).map(opt => opt.value);
        const experience = document.getElementById('register-experience').value;
        const qualification = document.getElementById('register-qualification').value;
        const bio = document.getElementById('register-bio').value;

        userData.skillTags = expertise;
        userData.experience = experience;
        userData.qualification = qualification;
        userData.bio = bio;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            closeAuthModal();
            showDashboard();
            initSocket();
            alert('🎉 Welcome to Think Tank AI!');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed. Make sure backend is running');
    }
}

// Login function
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            closeAuthModal();
            showDashboard();
            initSocket();
            alert('👋 Welcome back!');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login failed');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    if (socket) socket.disconnect();
    window.location.reload();
}

// Show dashboard after login
function showDashboard() {
    const heroSection = document.getElementById('hero-section');
    if (heroSection) heroSection.style.display = 'none';

    const featuresSection = document.querySelector('.features');
    if (featuresSection) featuresSection.style.display = 'none';

    const dashboard = document.getElementById('dashboard');
    if (dashboard) dashboard.style.display = 'block';

    const navAuth = document.getElementById('nav-auth');
    if (navAuth) navAuth.style.display = 'none';

    const userMenu = document.getElementById('user-menu');
    if (userMenu) userMenu.style.display = 'flex';

    const userNameNav = document.getElementById('user-name-nav');
    if (userNameNav) userNameNav.textContent = currentUser.name;

    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) userAvatar.src = currentUser.avatar || 'https://via.placeholder.com/40';

    // Update profile info
    const profileName = document.getElementById('profile-name');
    if (profileName) profileName.textContent = currentUser.name;

    const profileRole = document.getElementById('profile-role');
    if (profileRole) profileRole.textContent = currentUser.role === 'mentor' ? '🌟 Mentor' : '📚 Student';

    const profileStars = document.getElementById('profile-stars');
    if (profileStars) profileStars.textContent = currentUser.stars;

    const profileRating = document.getElementById('profile-rating');
    if (profileRating) profileRating.textContent = currentUser.mentorRating || 0;

    const profileHours = document.getElementById('profile-hours');
    if (profileHours) profileHours.textContent = currentUser.studyHours || 0;

    // Load all data
    loadMentors();
    loadStudyStats();
    loadMockTests();
    loadKnowledgeGraph();
    loadConversations();

    showSection('ai-assistant');
}

// Show different sections
function showSection(sectionName) {
    const sections = ['ai-assistant', 'mentors', 'tracker', 'knowledge', 'mocktests', 'profile'];
    sections.forEach(section => {
        const el = document.getElementById(`${section}-section`);
        if (el) el.style.display = 'none';
    });

    const activeSection = document.getElementById(`${sectionName}-section`);
    if (activeSection) activeSection.style.display = 'block';

    // Refresh chart when tracker section is shown
    if (sectionName === 'tracker' && studyChart) {
        studyChart.update();
    }
}

// ============ AVATAR UPLOAD ============

async function uploadAvatar() {
    const fileInput = document.getElementById('avatar-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first');
        return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('File too large! Maximum size is 2MB');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch(`${API_URL}/upload/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            const userAvatar = document.getElementById('user-avatar');
            const profileAvatar = document.getElementById('profile-avatar');
            if (userAvatar) userAvatar.src = data.avatar;
            if (profileAvatar) profileAvatar.src = data.avatar;
            alert('Avatar updated successfully!');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload avatar');
    }
}

// ============ AI ASSISTANT ============

async function askAI() {
    const questionInput = document.getElementById('ai-question');
    if (!questionInput) return;

    const question = questionInput.value;
    if (!question) return;

    const messagesDiv = document.getElementById('ai-messages');
    if (!messagesDiv) return;

    messagesDiv.innerHTML += `
        <div class="message user">
            <i class="fas fa-user"></i>
            <div class="message-content">
                <p>${escapeHtml(question)}</p>
            </div>
        </div>
    `;

    questionInput.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    messagesDiv.innerHTML += `
        <div class="message bot typing">
            <i class="fas fa-robot"></i>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        const response = await fetch(`${API_URL}/ai/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json();

        const typingIndicator = document.querySelector('.message.typing');
        if (typingIndicator) typingIndicator.remove();

        if (data.success) {
            const formattedAnswer = formatAIResponse(data.answer);

            messagesDiv.innerHTML += `
                <div class="message bot">
                    <i class="fas fa-robot"></i>
                    <div class="message-content">
                        ${formattedAnswer}
                        ${data.suggestions && data.suggestions.length > 0 ? `
                            <div class="suggestions">
                                <p><strong>💡 Follow-up Questions:</strong></p>
                                <div class="suggestions-buttons">
                                    ${data.suggestions.map(s => `
                                        <button class="suggestion-btn" onclick="askFollowUp('${escapeHtml(s)}')">
                                            ${escapeHtml(s)}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            messagesDiv.innerHTML += `
                <div class="message bot error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="message-content">
                        <p>Sorry, I couldn't process that. Please try again.</p>
                    </div>
                </div>
            `;
        }

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error('AI Error:', error);
        const typingIndicator = document.querySelector('.message.typing');
        if (typingIndicator) typingIndicator.remove();

        messagesDiv.innerHTML += `
            <div class="message bot error">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="message-content">
                    <p>⚠️ Connection error. Please check your connection.</p>
                </div>
            </div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

function askFollowUp(suggestion) {
    const questionInput = document.getElementById('ai-question');
    if (questionInput) {
        questionInput.value = suggestion;
        askAI();
    }
}

function formatAIResponse(text) {
    if (!text) return '<p>No response</p>';

    let formatted = text
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        .replace(/^[-*] (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    if (!formatted.startsWith('<h1') && !formatted.startsWith('<h2') && !formatted.startsWith('<h3')) {
        formatted = `<p>${formatted}</p>`;
    }

    return `<div class="ai-response">${formatted}</div>`;
}

// ============ STUDY TRACKER WITH CHART ============

async function trackStudy() {
    const hoursInput = document.getElementById('study-hours');
    const topicsInput = document.getElementById('study-topics');

    const hours = parseFloat(hoursInput?.value);
    const topics = topicsInput?.value || '';

    if (!hours || hours <= 0) {
        alert('Please enter valid hours');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/study/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                hours,
                topics: topics.split(',').map(t => t.trim()).filter(t => t)
            })
        });

        const data = await response.json();

        if (data.success) {
            alert(`✅ Tracked ${hours} hours! Total: ${data.data.totalHours} hours`);
            if (hoursInput) hoursInput.value = '';
            if (topicsInput) topicsInput.value = '';
            loadStudyStats();
        }
    } catch (error) {
        console.error('Error tracking study:', error);
        alert('Failed to track study hours');
    }
}

async function loadStudyStats() {
    try {
        const response = await fetch(`${API_URL}/study/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('streak-count').textContent = data.data.streak || 0;
            document.getElementById('total-hours').textContent = data.data.totalHours || 0;
            document.getElementById('total-stars').textContent = data.data.stars || 0;

            // Update chart with weekly data if available
            if (data.data.weeklyData) {
                updateStudyChart(data.data.weeklyData);
            } else {
                // Demo data for chart
                updateStudyChart([2, 4, 3, 5, 6, 4, 3]);
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStudyChart(weeklyData) {
    const ctx = document.getElementById('studyChart');
    if (!ctx) return;

    const canvasContext = ctx.getContext('2d');

    if (studyChart) {
        studyChart.destroy();
    }

    studyChart = new Chart(canvasContext, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Hours Studied',
                data: weeklyData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#fff',
                    bodyColor: '#e2e8f0'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day'
                    }
                }
            }
        }
    });
}

// ============ MENTORS ============
// ============ MENTORS ============

async function loadMentors() {
    try {
        const subjectFilter = document.getElementById('mentor-subject-filter');
        const sortSelect = document.getElementById('mentor-sort');

        const subject = subjectFilter?.value || '';
        const sort = sortSelect?.value || 'stars';

        let url = `${API_URL}/mentorship/mentors`;
        if (subject) url += `?subject=${subject}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        const mentorsList = document.getElementById('mentors-list');
        if (!mentorsList) return;

        if (data.success && data.data.length > 0) {
            let mentors = data.data;

            if (sort === 'rating') mentors.sort((a, b) => b.mentorRating - a.mentorRating);
            else if (sort === 'sessions') mentors.sort((a, b) => b.totalSessions - a.totalSessions);
            else mentors.sort((a, b) => b.stars - a.stars);

            mentorsList.innerHTML = mentors.map((m, idx) => `
                <div class="mentor-card">
                    <img src="${m.avatar || 'https://via.placeholder.com/70'}" alt="${m.name}" class="mentor-avatar">
                    <div class="mentor-info">
                        <h4>${m.name} ${idx === 0 ? '🏆' : ''}</h4>
                        <div class="mentor-stats">
                            <span>⭐ ${m.stars || 0} stars</span>
                            <span>📊 ${m.mentorRating || 0}/5 rating</span>
                            <span>#${idx + 1} Rank</span>
                        </div>
                        <p class="mentor-skills">${m.skillTags?.join(' • ') || 'General'}</p>
                        <p class="mentor-bio">${m.bio || 'Expert mentor ready to help!'}</p>
                        <div class="mentor-buttons">
                            <button onclick="chatWithMentor('${m._id}', '${m.name}')" class="btn-chat">
                                <i class="fas fa-comment"></i> Chat
                            </button>
                            <button onclick="requestSession('${m._id}', 'chat')" class="btn-session">
                                <i class="fas fa-calendar-alt"></i> Book Session
                            </button>
                            <button onclick="startVideoCall('${m._id}', 'video')" class="btn-video">
                                <i class="fas fa-video"></i> Video Call
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            mentorsList.innerHTML = '<p>No mentors available yet. Be the first mentor!</p>';
        }
    } catch (error) {
        console.error('Error loading mentors:', error);
        const mentorsList = document.getElementById('mentors-list');
        if (mentorsList) mentorsList.innerHTML = '<p>Error loading mentors. Please try again.</p>';
    }
}

// ============ KNOWLEDGE GRAPH ============

async function buildKnowledgeGraph() {
    const subjectSelect = document.getElementById('knowledge-subject');
    const subject = subjectSelect?.value;

    if (!subject) {
        alert('Please select a subject');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/knowledge/build`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ subject })
        });

        const data = await response.json();

        if (data.success) {
            renderKnowledgeGraph(data.data);
            displayRecommendations(data.data);
        } else {
            alert('Failed to build knowledge graph');
        }
    } catch (error) {
        console.error('Error building graph:', error);
        alert('Failed to build knowledge graph');
    }
}

function renderKnowledgeGraph(graph) {
    const container = document.getElementById('knowledge-graph');
    if (!container) return;

    if (!graph || !graph.nodes || graph.nodes.length === 0) {
        container.innerHTML = '<p>Build your learning path to see the graph!</p>';
        return;
    }

    const completed = new Set(graph.completedNodes || []);
    const progress = graph.progress || 0;

    container.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="graph-nodes">
            ${graph.nodes.map(node => `
                <div class="graph-node ${completed.has(node.id) ? 'completed' : ''} ${graph.recommendedNext?.includes(node.id) ? 'recommended' : ''}">
                    <div class="node-title">${node.name}</div>
                    <div class="node-difficulty">${node.difficulty}</div>
                    ${!completed.has(node.id) && graph.recommendedNext?.includes(node.id) ? `
                        <button onclick="completeTopic('${node.id}')" class="btn-complete">Mark Complete ✓</button>
                    ` : completed.has(node.id) ? '<span class="completed-badge">✅ Completed</span>' : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function displayRecommendations(graph) {
    const recDiv = document.getElementById('recommendations');
    if (!recDiv) return;

    if (!graph.recommendedNext || graph.recommendedNext.length === 0) {
        recDiv.innerHTML = '<p>🎉 You\'ve completed all topics! Great job!</p>';
        return;
    }

    const recommendedNodes = graph.nodes.filter(n => graph.recommendedNext.includes(n.id));
    recDiv.innerHTML = `
        <h3>📚 Recommended Next Steps</h3>
        <div class="recommendations-list">
            ${recommendedNodes.map(node => `
                <div class="rec-item">
                    <strong>${node.name}</strong>
                    <p>Difficulty: ${node.difficulty}</p>
                    <button onclick="completeTopic('${node.id}')" class="btn-start">Start Learning →</button>
                </div>
            `).join('')}
        </div>
    `;
}

async function completeTopic(nodeId) {
    const subjectSelect = document.getElementById('knowledge-subject');
    const subject = subjectSelect?.value;

    try {
        const response = await fetch(`${API_URL}/knowledge/complete/${nodeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ subject, score: 90 })
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            renderKnowledgeGraph(data.data);
            displayRecommendations(data.data);
        }
    } catch (error) {
        console.error('Error completing topic:', error);
        alert('Failed to mark topic as complete');
    }
}

async function loadKnowledgeGraph() {
    const subjectSelect = document.getElementById('knowledge-subject');
    const subject = subjectSelect?.value || 'Computer Science';

    try {
        const response = await fetch(`${API_URL}/knowledge/my-graph?subject=${subject}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (data.success && data.data) {
            renderKnowledgeGraph(data.data);
            displayRecommendations(data.data);
        }
    } catch (error) {
        console.error('Error loading graph:', error);
    }
}

// ============ MOCK TESTS ============

async function loadMockTests() {
    try {
        const response = await fetch(`${API_URL}/mocktests`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        const testsDiv = document.getElementById('mocktests-list');
        if (!testsDiv) return;

        if (data.success && data.data.length > 0) {
            testsDiv.innerHTML = data.data.map(test => `
                <div class="mocktest-card">
                    <h4>${test.title}</h4>
                    <p>Subject: ${test.subject} | ${test.difficulty}</p>
                    <p>📝 ${test.totalMarks} marks | ⏱️ ${test.timeLimit} min</p>
                    <button onclick="startTest('${test._id}')" class="btn-primary">Start Test</button>
                </div>
            `).join('');
        } else {
            testsDiv.innerHTML = '<p>No mock tests available yet. Check back soon!</p>';
        }
    } catch (error) {
        console.error('Error loading tests:', error);
        const testsDiv = document.getElementById('mocktests-list');
        if (testsDiv) testsDiv.innerHTML = '<p>Error loading tests</p>';
    }
}

async function startTest(testId) {
    alert('Test feature coming soon! This will include:\n- Timed questions\n- AI-powered analysis\n- Detailed feedback\n- Topic-wise breakdown');
}

// ============ REAL-TIME CHAT ============

function initSocket() {
    if (socket) socket.disconnect();

    try {
        socket = io('https://think-tank-ai-backend.onrender.com');
        socket.emit('join', currentUser._id);

        socket.on('receive_message', (message) => {
            if (window.currentChatUser === message.senderId) {
                displayMessage(message);
            }
            loadConversations();
            updateUnreadBadge();
        });
    } catch (error) {
        console.error('Socket connection error:', error);
    }
}

async function loadConversations() {
    try {
        const response = await fetch(`${API_URL}/chat/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        const convList = document.getElementById('conversations-list');
        if (!convList) return;

        if (data.success && data.data && data.data.length > 0) {
            // Show only people you've actually chatted with
            convList.innerHTML = data.data.map(conv => `
                <div class="conversation-item" onclick="openChat('${conv.user._id}', '${conv.user.name}')">
                    <img src="${conv.user.avatar || 'https://via.placeholder.com/40'}" alt="${conv.user.name}">
                    <div class="conv-info">
                        <strong>${conv.user.name}</strong>
                        <p>${conv.lastMessage?.content?.substring(0, 30) || 'Click to start chatting'}</p>
                    </div>
                    ${conv.unreadCount > 0 ? `<span class="unread-count">${conv.unreadCount}</span>` : ''}
                </div>
            `).join('');
        } else {
            // Show helpful message when no conversations yet
            convList.innerHTML = '<p style="text-align: center; padding: 20px;">💬 No conversations yet.<br>Click "Chat" on any mentor to start a conversation!</p>';
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
        const convList = document.getElementById('conversations-list');
        if (convList) convList.innerHTML = '<p style="text-align: center; padding: 20px;">Error loading conversations. Please refresh.</p>';
    }
}
function openChat(userId, userName) {
    window.currentChatUser = userId;

    const chatWidget = document.getElementById('chat-widget');
    const convList = document.getElementById('conversations-list');
    const chatArea = document.getElementById('chat-area');
    const chatMessages = document.getElementById('chat-messages');

    if (chatWidget) chatWidget.style.display = 'flex';
    if (convList) convList.style.display = 'none';
    if (chatArea) chatArea.style.display = 'flex';
    if (chatMessages) chatMessages.innerHTML = '';

    loadMessages(userId);
}

async function loadMessages(userId) {
    try {
        const response = await fetch(`${API_URL}/chat/messages/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        const messagesDiv = document.getElementById('chat-messages');
        if (!messagesDiv) return;

        if (data.success && data.data.length > 0) {
            messagesDiv.innerHTML = data.data.map(msg => `
                <div class="chat-message ${msg.sender._id === currentUser._id ? 'sent' : 'received'}">
                    <p>${escapeHtml(msg.content)}</p>
                    <small>${new Date(msg.createdAt).toLocaleTimeString()}</small>
                </div>
            `).join('');
        } else {
            messagesDiv.innerHTML = '<p>No messages yet. Say hello!</p>';
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const content = chatInput?.value;

    if (!content || !window.currentChatUser) {
        alert('Please select a mentor to chat with first');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                receiverId: window.currentChatUser,
                content: content
            })
        });

        const data = await response.json();

        if (data.success) {
            if (chatInput) chatInput.value = '';
            displayMessage(data.data);
            if (socket) {
                socket.emit('send_message', {
                    receiverId: window.currentChatUser,
                    ...data.data
                });
            }
            // Refresh conversation list to show new message
            loadConversations();
        } else {
            alert(data.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}

function displayMessage(message) {
    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;

    messagesDiv.innerHTML += `
        <div class="chat-message ${message.sender._id === currentUser._id ? 'sent' : 'received'}">
            <p>${escapeHtml(message.content)}</p>
            <small>${new Date(message.createdAt).toLocaleTimeString()}</small>
        </div>
    `;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function toggleChat() {
    const chatBody = document.getElementById('chat-body');
    if (chatBody) {
        chatBody.style.display = chatBody.style.display === 'none' ? 'flex' : 'none';
    }
}

function chatWithMentor(mentorId, mentorName) {
    openChat(mentorId, mentorName);
}

function updateUnreadBadge() {
    const badge = document.getElementById('unread-badge');
    if (badge) {
        badge.style.display = 'none';
    }
}

// ============ SESSION BOOKING ============

async function requestSession(mentorId, type) {
    const price = type === 'video' ? 100 : 50;

    if (confirm(`Book a ${type} session for $${price}?`)) {
        try {
            const response = await fetch(`${API_URL}/sessions/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mentorId, type, price })
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ Session booked! Please complete payment.`);
            }
        } catch (error) {
            console.error('Error booking session:', error);
            alert('Failed to book session');
        }
    }
}

// ============ PROFILE ============

async function updateProfile() {
    const editName = document.getElementById('edit-name');
    const editBio = document.getElementById('edit-bio');
    const editSkills = document.getElementById('edit-skills');

    const name = editName?.value;
    const bio = editBio?.value;
    const skills = editSkills ? Array.from(editSkills.selectedOptions).map(opt => opt.value) : [];

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, bio, skillTags: skills })
        });

        const data = await response.json();

        if (data.success) {
            alert('Profile updated!');
            currentUser = data.data;

            const profileName = document.getElementById('profile-name');
            if (profileName) profileName.textContent = currentUser.name;

            const userNameNav = document.getElementById('user-name-nav');
            if (userNameNav) userNameNav.textContent = currentUser.name;
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
    }
}

// ============ UI HELPER FUNCTIONS ============

function showAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.style.display = 'block';

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (type === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        // Reset form when showing register
        resetRegistrationForm();
    }
}

function resetRegistrationForm() {
    // Reset student/mentor fields visibility
    const studentFields = document.getElementById('student-fields');
    const mentorFields = document.getElementById('mentor-fields');
    if (studentFields) studentFields.style.display = 'block';
    if (mentorFields) mentorFields.style.display = 'none';

    // Reset education fields
    const education = document.getElementById('register-education');
    if (education) education.value = 'school';
    toggleCollegeFields();
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
}

function switchAuthForm(type) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (type === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        resetRegistrationForm();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMarkdown(text) {
    return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// ============ INITIALIZATION ============

const savedToken = localStorage.getItem('token');
if (savedToken) {
    token = savedToken;
    fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentUser = data.user;
                showDashboard();
                initSocket();
            } else {
                localStorage.removeItem('token');
            }
        })
        .catch(() => {
            localStorage.removeItem('token');
        });
}

// Video Call Functions
let peerConnection = null;
let localStream = null;
let currentCallId = null;

async function startVideoCall(targetUserId, callType = 'video') {
    try {
        // Request camera and microphone
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        document.getElementById('localVideo').srcObject = localStream;

        // Initialize call on server
        const response = await fetch(`${API_URL}/video/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ targetUserId, callType })
        });

        const data = await response.json();
        if (data.success) {
            currentCallId = data.callId;
            showVideoCallModal();

            // Setup WebRTC connection
            setupWebRTC(targetUserId);
        }
    } catch (error) {
        console.error('Error starting video call:', error);
        alert('Unable to access camera/microphone');
    }
}

function setupWebRTC(targetUserId) {
    // Configuration for STUN servers (free)
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
        document.getElementById('remoteVideo').srcObject = event.streams[0];
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                targetUserId: targetUserId,
                callId: currentCallId
            });
        }
    };

    // Create offer
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
            socket.emit('video-offer', {
                offer: peerConnection.localDescription,
                targetUserId: targetUserId,
                callId: currentCallId
            });
        });
}

function showVideoCallModal() {
    const modal = document.getElementById('video-call-modal');
    if (modal) modal.style.display = 'block';
}

function closeVideoCall() {
    const modal = document.getElementById('video-call-modal');
    if (modal) modal.style.display = 'none';
    endCall();
}

let isMuted = false;
let isVideoOff = false;

function toggleMute() {
    if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        isMuted = !isMuted;
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            muteBtn.innerHTML = isMuted ? '<i class="fas fa-microphone-slash"></i>' : '<i class="fas fa-microphone"></i>';
        }
    }
}

function toggleVideo() {
    if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        isVideoOff = !isVideoOff;
        const videoBtn = document.getElementById('videoBtn');
        if (videoBtn) {
            videoBtn.innerHTML = isVideoOff ? '<i class="fas fa-video-slash"></i>' : '<i class="fas fa-video"></i>';
        }
    }
}

async function endCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    if (currentCallId) {
        await fetch(`${API_URL}/video/end/${currentCallId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        currentCallId = null;
    }

    closeVideoCall();
}

// Add video call button to mentor cards
// Update the mentor card button section to include video call

// Search mentors function
function searchMentors() {
    const searchTerm = document.getElementById('mentor-search').value.toLowerCase();
    const mentorCards = document.querySelectorAll('.mentor-card');

    mentorCards.forEach(card => {
        const name = card.querySelector('h4')?.innerText.toLowerCase() || '';
        const skills = card.querySelector('.mentor-skills')?.innerText.toLowerCase() || '';
        const bio = card.querySelector('.mentor-bio')?.innerText.toLowerCase() || '';

        if (name.includes(searchTerm) || skills.includes(searchTerm) || bio.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Search mentors in real-time
let allMentorsData = [];

async function loadMentors() {
    try {
        const subjectFilter = document.getElementById('mentor-subject-filter');
        const sortSelect = document.getElementById('mentor-sort');
        const searchInput = document.getElementById('mentor-search');

        const subject = subjectFilter?.value || '';
        const sort = sortSelect?.value || 'stars';
        const searchTerm = searchInput?.value?.toLowerCase() || '';

        let url = `${API_URL}/mentorship/mentors`;
        if (subject) url += `?subject=${subject}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        const mentorsList = document.getElementById('mentors-list');
        if (!mentorsList) return;

        if (data.success && data.data.length > 0) {
            let mentors = data.data;

            // Filter by search term
            if (searchTerm) {
                mentors = mentors.filter(m =>
                    m.name.toLowerCase().includes(searchTerm) ||
                    m.skillTags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                    (m.bio && m.bio.toLowerCase().includes(searchTerm))
                );
            }

            // Sort mentors
            if (sort === 'rating') mentors.sort((a, b) => b.mentorRating - a.mentorRating);
            else if (sort === 'sessions') mentors.sort((a, b) => b.totalSessions - a.totalSessions);
            else mentors.sort((a, b) => b.stars - a.stars);

            if (mentors.length === 0) {
                mentorsList.innerHTML = '<p>No mentors found matching your search.</p>';
                return;
            }

            mentorsList.innerHTML = mentors.map((m, idx) => `
                <div class="mentor-card" data-name="${m.name.toLowerCase()}" data-skills="${m.skillTags?.join(' ').toLowerCase() || ''}">
                    <img src="${m.avatar || 'https://via.placeholder.com/70'}" alt="${m.name}" class="mentor-avatar">
                    <div class="mentor-info">
                        <h4>${m.name} ${idx === 0 ? '🏆' : ''}</h4>
                        <div class="mentor-stats">
                            <span>⭐ ${m.stars || 0} stars</span>
                            <span>📊 ${m.mentorRating || 0}/5 rating</span>
                            <span>#${idx + 1} Rank</span>
                            <span>📚 ${m.totalSessions || 0} sessions</span>
                        </div>
                        <p class="mentor-skills">${m.skillTags?.join(' • ') || 'General'}</p>
                        <p class="mentor-bio">${m.bio || 'Expert mentor ready to help!'}</p>
                        <div class="mentor-buttons">
                            <button onclick="chatWithMentor('${m._id}', '${m.name}')" class="btn-chat">
                                <i class="fas fa-comment"></i> Chat
                            </button>
                            <button onclick="requestSession('${m._id}', 'chat')" class="btn-session">
                                <i class="fas fa-calendar-alt"></i> Book Session
                            </button>
                            <button onclick="startVideoCall('${m._id}', 'video')" class="btn-video">
                                <i class="fas fa-video"></i> Video Call
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            mentorsList.innerHTML = '<p>No mentors available yet. Be the first mentor! Register as a mentor to help others.</p>';
        }
    } catch (error) {
        console.error('Error loading mentors:', error);
        const mentorsList = document.getElementById('mentors-list');
        if (mentorsList) mentorsList.innerHTML = '<p>Error loading mentors. Please refresh the page.</p>';
    }
}

// Real-time search function
function searchMentors() {
    loadMentors(); // Reload with search term
}