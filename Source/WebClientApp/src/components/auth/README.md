# VTT Tools Authentication System

This directory contains the complete authentication system implementation for the VTT Tools WebClientApp, covering all use cases UC003-UC008.

## 🔐 Authentication Use Cases Implemented

### **UC003 - Account Registration**
- **Component**: `RegistrationForm`
- **Features**: Real-time validation, password strength meter, email verification, external providers
- **Security**: Password strength validation, terms acceptance, comprehensive error handling

### **UC004 - User Login**
- **Component**: `LoginForm` (enhanced)
- **Features**: Remember me, rate limiting, external providers, 2FA integration
- **Security**: Credential validation, session management, lockout protection

### **UC005 - User Logout**
- **Component**: `LogoutButton`
- **Features**: Secure logout, confirmation dialogs, complete session cleanup
- **Security**: Token invalidation, state cleanup, proper redirects

### **UC006 - Password Reset**
- **Components**: `PasswordResetRequestForm`, `PasswordResetConfirmForm`
- **Features**: Email validation, secure token handling, password strength validation
- **Security**: Token expiration, secure password requirements

### **UC007 - Two-Factor Authentication**
- **Components**: `TwoFactorSetupForm`, `TwoFactorVerificationForm`, `RecoveryCodeForm`, `RecoveryCodesManager`
- **Features**: QR code generation, step-by-step setup, recovery codes, verification
- **Security**: TOTP authentication, secure backup codes, device trust

### **UC008 - External Login Providers**
- **Integration**: OAuth with Google, Microsoft, GitHub
- **Components**: Integrated into `LoginForm` and `RegistrationForm`
- **Features**: Account linking, profile merging, comprehensive error handling

## 🎨 Design System

All components use **Material UI** with the **Studio Professional theme**:
- Consistent color palette and typography
- Responsive design for all screen sizes
- Accessibility compliance (WCAG guidelines)
- Professional, clean interface design

## 🔧 Technical Architecture

### **State Management**
- **Redux Toolkit** with RTK Query for API integration
- **Auth Slice** for authentication state
- **Real-time updates** and cache invalidation

### **API Integration**
- **RTK Query** for all authentication endpoints
- **Real backend communication** (no mocks)
- **Comprehensive error handling** with user-friendly messages
- **Automatic retry logic** and request caching

### **TypeScript Support**
- **Strict typing** for all authentication interfaces
- **Type safety** throughout the authentication flow
- **IntelliSense support** for better developer experience

## 📁 Component Overview

### **Core Authentication Forms**
```typescript
LoginForm              // Enhanced login with 2FA support
RegistrationForm       // Complete registration with validation
PasswordResetRequestForm   // Email-based password reset request
PasswordResetConfirmForm   // Token-based password reset confirmation
```

### **Two-Factor Authentication**
```typescript
TwoFactorSetupForm         // QR code setup wizard
TwoFactorVerificationForm  // Login verification
RecoveryCodeForm          // Backup code verification
RecoveryCodesManager      // Recovery code management
```

### **Profile & Security Management**
```typescript
ProfileSettings       // User profile management
SecuritySettings     // Password & 2FA management
```

### **Authentication Status & Controls**
```typescript
AuthStatus           // User status display with menu
LogoutButton        // Secure logout with confirmation
```

## 🚀 Usage Examples

### **Basic Login Integration**
```typescript
import { LoginForm } from '@/components/auth';

<LoginForm
  onSwitchToRegister={() => setMode('register')}
  onSwitchToResetPassword={() => setMode('reset')}
  onLoginResult={(result) => {
    if (result?.requiresTwoFactor) {
      setMode('two-factor');
    }
  }}
/>
```

### **User Authentication Status**
```typescript
import { AuthStatus } from '@/components/auth';

<AuthStatus
  onNavigateToProfile={() => navigate('/profile')}
  onNavigateToSecurity={() => navigate('/security')}
  showFullControls={true}
/>
```

### **Profile Management**
```typescript
import { ProfileSettings, SecuritySettings } from '@/components/auth';

// Profile page
<ProfileSettings />

// Security page
<SecuritySettings />
```

## 🔄 Authentication Flow

1. **Initial Login**: User enters credentials
2. **2FA Check**: If enabled, redirect to 2FA verification
3. **Verification**: TOTP code or recovery code
4. **Success**: Redirect to dashboard with full authentication
5. **Session Management**: Remember me and token refresh handling

## 🛡️ Security Features

### **Password Security**
- **Strength validation** with visual feedback
- **Secure storage** (server-side hashing)
- **Password change** with current password verification

### **Two-Factor Authentication**
- **TOTP support** (Google Authenticator, etc.)
- **QR code generation** for easy setup
- **Recovery codes** for backup access
- **Device trust** with "remember this device"

### **Session Security**
- **Rate limiting** for login attempts
- **Account lockout** protection
- **Secure logout** with complete session cleanup
- **Remember me** with configurable duration

### **API Security**
- **CSRF protection** with request headers
- **Cookie-based authentication** for secure sessions
- **Token validation** and refresh handling
- **Error sanitization** to prevent information leakage

## 📱 Responsive Design

All components are fully responsive and work seamlessly across:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## ♿ Accessibility

- **WCAG 2.1 AA compliance**
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support
- **Focus management** for form flows

## 🧪 Testing Considerations

The authentication system is designed to be easily testable with:
- **Component isolation** for unit testing
- **Mock API support** for integration testing
- **Error simulation** for error handling testing
- **Accessibility testing** hooks

## 🔗 Integration Points

### **Backend APIs**
- Uses existing ASP.NET Core Identity endpoints
- Integrates with VTT Tools microservices architecture
- Supports .NET Aspire service discovery

### **Error Handling**
- Integrates with global error handling system
- Uses notification system for user feedback
- Comprehensive error logging and reporting

### **Navigation**
- React Router integration for auth flows
- Protected route support with auth checks
- Seamless redirect handling after authentication

---

## 🚀 Quick Start

1. **Import components** from `@/components/auth`
2. **Use LoginPage** as the main authentication entry point
3. **Add AuthStatus** to your app header/navbar
4. **Integrate ProfileSettings** and **SecuritySettings** in user settings

The authentication system is ready for production use with comprehensive security, excellent user experience, and full integration with the VTT Tools platform.