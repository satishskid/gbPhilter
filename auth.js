// Simple Authentication System for PHI De-ID Studio
(function() {
    'use strict';
    
    const AUTH_CONFIG = {
        username: 'qnalyticss',
        password: 'deid2024',
        storageKey: 'phideid_auth'
    };

    class SimpleAuth {
        constructor() {
            this.isAuthenticated = this.checkAuth();
            this.init();
        }

        init() {
            if (!this.isAuthenticated) {
                this.showLogin();
            } else {
                this.showApp();
            }
        }

        checkAuth() {
            const auth = localStorage.getItem(AUTH_CONFIG.storageKey);
            return auth === 'authenticated';
        }

        login(username, password) {
            if (username === AUTH_CONFIG.username && password === AUTH_CONFIG.password) {
                localStorage.setItem(AUTH_CONFIG.storageKey, 'authenticated');
                this.isAuthenticated = true;
                this.hideLogin();
                this.showApp();
                return true;
            }
            return false;
        }

        logout() {
            localStorage.removeItem(AUTH_CONFIG.storageKey);
            this.isAuthenticated = false;
            this.hideApp();
            this.showLogin();
        }

        showLogin() {
            const overlay = document.createElement('div');
            overlay.id = 'auth-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;

            overlay.innerHTML = `
                <div style="max-width: 400px; width: 90%; padding: 20px;">
                    <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center;">
                        <div style="margin-bottom: 30px;">
                            <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">PHI De-ID Studio</h2>
                            <p style="margin: 0; color: #666; font-size: 16px;">Secure Login Required</p>
                        </div>
                        <form id="login-form">
                            <div style="margin-bottom: 20px; text-align: left;">
                                <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 500;">Username</label>
                                <input type="text" id="username" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box;">
                            </div>
                            <div style="margin-bottom: 20px; text-align: left;">
                                <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 500;">Password</label>
                                <input type="password" id="password" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; box-sizing: border-box;">
                            </div>
                            <button type="submit" style="width: 100%; padding: 14px; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; transition: background 0.3s;">
                                Sign In
                            </button>
                            <div id="auth-error" style="display: none; margin-top: 15px; padding: 10px; background: #fee; color: #c33; border-radius: 4px; font-size: 14px;">
                                Invalid credentials. Please try again.
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';

            document.getElementById('login-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (this.login(username, password)) {
                    document.getElementById('auth-error').style.display = 'none';
                } else {
                    document.getElementById('auth-error').style.display = 'block';
                }
            });
        }

        hideLogin() {
            const overlay = document.getElementById('auth-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                    document.body.style.overflow = 'auto';
                }, 300);
            }
        }

        showApp() {
            document.body.style.overflow = 'auto';
            
            if (!document.getElementById('logout-btn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logout-btn';
                logoutBtn.textContent = 'Logout';
                logoutBtn.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    z-index: 1000;
                `;
                logoutBtn.onclick = () => this.logout();
                document.body.appendChild(logoutBtn);
            }
        }

        hideApp() {
            document.body.style.overflow = 'hidden';
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.remove();
        }
    }

    // Initialize auth when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new SimpleAuth();
        });
    } else {
        new SimpleAuth();
    }
})();