// Clerk Configuration for PHI DeID Studio
const CLERK_CONFIG = {
  publishableKey: 'pk_test_bWF4aW11bS1waXBlZmlzaC0xOS5jbGVyay5hY2NvdW50cy5kZXYk',
  afterSignInUrl: '/index.html',
  afterSignUpUrl: '/index.html',
  signInUrl: '/login.html',
  signUpUrl: '/signup.html'
};

// Initialize Clerk
async function initClerk() {
  try {
    const clerk = window.Clerk;
    
    if (!clerk) {
      console.error('Clerk not loaded');
      return;
    }

    await clerk.load({
      publishableKey: CLERK_CONFIG.publishableKey
    });

    // Check if user is signed in
    if (clerk.user) {
      console.log('User is signed in:', clerk.user.id);
      showAuthenticatedUI(clerk.user);
    } else {
      console.log('User is not signed in');
      
      // Redirect to login if on protected pages
      const protectedPages = ['/index.html', '/home.html'];
      const currentPath = window.location.pathname;
      
      if (protectedPages.some(page => currentPath.endsWith(page))) {
        window.location.href = CLERK_CONFIG.signInUrl;
        return;
      }
      
      showSignInButton();
    }

    // Listen for auth state changes
    clerk.addListener((payload) => {
      if (payload.user) {
        showAuthenticatedUI(payload.user);
      } else {
        // Redirect to login on sign out
        if (!window.location.pathname.endsWith('/landing.html')) {
          window.location.href = CLERK_CONFIG.signInUrl;
        }
      }
    });

  } catch (error) {
    console.error('Error initializing Clerk:', error);
  }
}

function showAuthenticatedUI(user) {
  const authSection = document.getElementById('auth-section');
  if (authSection) {
    const initials = user.firstName ? 
      user.firstName.charAt(0).toUpperCase() + (user.lastName ? user.lastName.charAt(0).toUpperCase() : '') : 
      'U';
    
    authSection.innerHTML = `
      <div class="user-info">
        <div class="user-avatar">${initials}</div>
        <div class="user-name">${user.firstName || 'User'}</div>
        <div class="user-email">${user.emailAddresses?.[0]?.emailAddress || ''}</div>
        <button id="sign-out-btn" class="btn btn-secondary" style="margin-top: 0.5rem;">Sign Out</button>
      </div>
    `;
    
    document.getElementById('sign-out-btn')?.addEventListener('click', async () => {
      try {
        await window.Clerk.signOut();
        window.location.href = '/landing.html';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    });
  }
}

function showSignInButton() {
  const authSection = document.getElementById('auth-section');
  if (authSection) {
    authSection.innerHTML = `
      <div class="auth-container">
        <button id="sign-in-btn" class="btn btn-primary">Sign In</button>
        <button id="sign-up-btn" class="btn btn-secondary">Sign Up</button>
      </div>
    `;
    
    document.getElementById('sign-in-btn')?.addEventListener('click', async () => {
      window.location.href = CLERK_CONFIG.signInUrl;
    });
    
    document.getElementById('sign-up-btn')?.addEventListener('click', async () => {
      window.location.href = CLERK_CONFIG.signUpUrl;
    });
  }
}

// Check authentication status for protected routes
async function checkAuthStatus() {
  try {
    const clerk = window.Clerk;
    if (!clerk) return;

    await clerk.load({
      publishableKey: CLERK_CONFIG.publishableKey
    });

    const isProtectedPage = window.location.pathname.endsWith('/index.html') || 
                           window.location.pathname.endsWith('/home.html');
    
    if (isProtectedPage && !clerk.user) {
      window.location.href = CLERK_CONFIG.signInUrl;
    }

  } catch (error) {
    console.error('Error checking auth status:', error);
  }
}

// Initialize Clerk when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  initClerk();
});