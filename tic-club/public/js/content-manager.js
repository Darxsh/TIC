class ContentManager {
    constructor() {
        this.contentTypes = ['gallery', 'events', 'team', 'press'];
        this.currentType = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadContentTypes();
    }

    setupEventListeners() {
        document.getElementById('contentTypeSelect')?.addEventListener('change', (e) => {
            this.currentType = e.target.value;
            this.loadContent(this.currentType);
        });

        document.getElementById('addContentBtn')?.addEventListener('click', () => {
            this.showAddContentForm();
        });
    }

    async loadContentTypes() {
        const contentSection = document.getElementById('contentSection');
        if (!contentSection) return;

        contentSection.innerHTML = `
            <div class="content-header">
                <div class="content-controls">
                    <select id="contentTypeSelect" class="content-select">
                        ${this.contentTypes.map(type => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`).join('')}
                    </select>
                    <button id="addContentBtn" class="add-content-btn">
                        <i class="fas fa-plus"></i> Add New
                    </button>
                </div>
            </div>
            <div id="contentList" class="content-list"></div>
            <div id="contentForm" class="content-form hidden"></div>
        `;

        // Load initial content
        this.currentType = this.contentTypes[0];
        await this.loadContent(this.currentType);
    }

    async loadContent(type) {
        const contentList = document.getElementById('contentList');
        if (!contentList) return;

        try {
            const response = await fetch(`/api/admin/content/${type}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load content');

            const content = await response.json();
            this.renderContentList(content);
        } catch (error) {
            this.showError('Failed to load content. Please try again.');
        }
    }

    renderContentList(content) {
        const contentList = document.getElementById('contentList');
        if (!contentList) return;

        contentList.innerHTML = content.map(item => `
            <div class="content-item" data-id="${item._id}">
                <div class="content-item-preview">
                    ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ''}
                </div>
                <div class="content-item-details">
                    <h3>${item.title}</h3>
                    <p>${item.description?.substring(0, 100)}...</p>
                </div>
                <div class="content-item-actions">
                    <button onclick="contentManager.editContent('${item._id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="contentManager.deleteContent('${item._id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showAddContentForm() {
        const contentForm = document.getElementById('contentForm');
        if (!contentForm) return;

        contentForm.classList.remove('hidden');
        contentForm.innerHTML = `
            <form id="addContentForm" class="form">
                <h3>Add New ${this.currentType.charAt(0).toUpperCase() + this.currentType.slice(1)}</h3>
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="image">Image URL</label>
                    <input type="text" id="image" name="image">
                </div>
                ${this.getTypeSpecificFields()}
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Save</button>
                    <button type="button" onclick="contentManager.hideForm()" class="cancel-btn">Cancel</button>
                </div>
            </form>
        `;

        document.getElementById('addContentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContent(new FormData(e.target));
        });
    }

    getTypeSpecificFields() {
        switch (this.currentType) {
            case 'events':
                return `
                    <div class="form-group">
                        <label for="date">Event Date</label>
                        <input type="datetime-local" id="date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="location">Location</label>
                        <input type="text" id="location" name="location" required>
                    </div>
                `;
            case 'team':
                return `
                    <div class="form-group">
                        <label for="role">Role</label>
                        <input type="text" id="role" name="role" required>
                    </div>
                    <div class="form-group">
                        <label for="socialLinks">Social Links (comma-separated)</label>
                        <input type="text" id="socialLinks" name="socialLinks">
                    </div>
                `;
            default:
                return '';
        }
    }

    async saveContent(formData) {
        try {
            const data = Object.fromEntries(formData.entries());
            const response = await fetch(`/api/admin/content/${this.currentType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save content');

            this.hideForm();
            await this.loadContent(this.currentType);
            this.showSuccess('Content saved successfully!');
        } catch (error) {
            this.showError('Failed to save content. Please try again.');
        }
    }

    async editContent(id) {
        try {
            const response = await fetch(`/api/admin/content/${this.currentType}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to load content');

            const content = await response.json();
            this.showEditForm(content);
        } catch (error) {
            this.showError('Failed to load content for editing. Please try again.');
        }
    }

    showEditForm(content) {
        this.showAddContentForm(); // Reuse the add form structure
        const form = document.getElementById('addContentForm');
        if (!form) return;

        // Populate form fields
        Object.entries(content).forEach(([key, value]) => {
            const field = form.elements[key];
            if (field) {
                if (field.type === 'datetime-local') {
                    field.value = new Date(value).toISOString().slice(0, 16);
                } else {
                    field.value = value;
                }
            }
        });

        // Update form submission handler for edit
        form.onsubmit = async (e) => {
            e.preventDefault();
            await this.updateContent(content._id, new FormData(e.target));
        };
    }

    async updateContent(id, formData) {
        try {
            const data = Object.fromEntries(formData.entries());
            const response = await fetch(`/api/admin/content/${this.currentType}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update content');

            this.hideForm();
            await this.loadContent(this.currentType);
            this.showSuccess('Content updated successfully!');
        } catch (error) {
            this.showError('Failed to update content. Please try again.');
        }
    }

    async deleteContent(id) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/admin/content/${this.currentType}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete content');

            await this.loadContent(this.currentType);
            this.showSuccess('Content deleted successfully!');
        } catch (error) {
            this.showError('Failed to delete content. Please try again.');
        }
    }

    hideForm() {
        const contentForm = document.getElementById('contentForm');
        if (contentForm) {
            contentForm.classList.add('hidden');
            contentForm.innerHTML = '';
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('active');
            setTimeout(() => errorMessage.classList.remove('active'), 5000);
        }
    }

    showSuccess(message) {
        // You can implement a success message UI component here
        console.log(message);
    }
}

// Initialize content manager
const contentManager = new ContentManager();
