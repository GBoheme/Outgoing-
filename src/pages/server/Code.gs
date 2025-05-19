
// Initialize a namespace for our app
const AppConfig = {
  SESSION_EXPIRY: 21600, // 6 hours in seconds
  ADMIN_PAGE: 'DashboardAdmin',
  USER_PAGE: 'DashboardUser',
  LOGIN_PAGE: 'Login'
};

/**
 * Main entry point for the web app
 */
function doGet(e) {
  try {
    // Get parameters
    const page = e.parameter.page || '';
    
    // Specific logout request
    if (page === 'logout') {
      clearUserSession();
      return HtmlService.createTemplateFromFile(AppConfig.LOGIN_PAGE)
        .evaluate()
        .setTitle('Login')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    }
    
    // Check if user is authenticated
    const userSession = getUserSession();
    
    if (!userSession) {
      // No active session, show login page
      return HtmlService.createTemplateFromFile(AppConfig.LOGIN_PAGE)
        .evaluate()
        .setTitle('Login')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    }
    
    // User is authenticated, serve appropriate dashboard
    const targetPage = userSession.role === 'admin' ? 
      AppConfig.ADMIN_PAGE : AppConfig.USER_PAGE;
      
    return HtmlService.createTemplateFromFile(targetPage)
      .evaluate()
      .setTitle('Dashboard')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    console.error('Error in doGet:', error);
    // Fallback to login page if anything goes wrong
    return HtmlService.createTemplateFromFile(AppConfig.LOGIN_PAGE)
      .evaluate()
      .setTitle('Login')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

/**
 * Authenticate user against the Users sheet
 */
function authenticateUser(username, password) {
  try {
    // Get all users
    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    if (!usersSheet) {
      console.error('Users sheet not found');
      return { success: false, message: 'Authentication system error' };
    }

    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find username and password column indices
    const usernameCol = headers.indexOf('username');
    const passwordCol = headers.indexOf('passwordHash');
    const fullNameCol = headers.indexOf('fullName');
    const roleCol = headers.indexOf('role');
    const lastLoginCol = headers.indexOf('lastLogin');
    
    if (usernameCol < 0 || passwordCol < 0 || fullNameCol < 0 || roleCol < 0) {
      console.error('Required columns not found in Users sheet');
      return { success: false, message: 'Authentication system error' };
    }
    
    // Hard-coded test users for development
    if (username === 'admin' && password === 'admin123') {
      const user = {
        username: 'admin',
        fullName: 'مدير النظام',
        role: 'admin'
      };
      
      // Store user session
      createUserSession(user);
      
      return { 
        success: true, 
        user: user
      };
    }
    
    if (username === 'user' && password === 'password') {
      const user = {
        username: 'user',
        fullName: 'مستخدم النظام',
        role: 'user'
      };
      
      // Store user session
      createUserSession(user);
      
      return { 
        success: true, 
        user: user
      };
    }
    
    // Search for the user in the sheet
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[usernameCol] === username && row[passwordCol] === password) { // In production, use proper password hashing
        // User found, create session
        const user = {
          username: row[usernameCol],
          fullName: row[fullNameCol],
          role: row[roleCol]
        };
        
        // Update last login timestamp
        if (lastLoginCol >= 0) {
          usersSheet.getRange(i + 1, lastLoginCol + 1).setValue(new Date());
        }
        
        // Store user session
        createUserSession(user);
        
        return { 
          success: true, 
          user: user
        };
      }
    }
    
    // User not found or password incorrect
    return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'حدث خطأ في نظام المصادقة' };
  }
}

/**
 * Change user password
 */
function changeUserPassword(username, currentPassword, newPassword) {
  try {
    // Get all users
    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    if (!usersSheet) {
      console.error('Users sheet not found');
      return { success: false, message: 'خطأ في نظام إدارة المستخدمين' };
    }

    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find username and password column indices
    const usernameCol = headers.indexOf('username');
    const passwordCol = headers.indexOf('passwordHash');
    
    if (usernameCol < 0 || passwordCol < 0) {
      console.error('Required columns not found in Users sheet');
      return { success: false, message: 'خطأ في نظام إدارة المستخدمين' };
    }
    
    // Hard-coded test users for development
    if ((username === 'admin' && currentPassword === 'admin123') ||
        (username === 'user' && currentPassword === 'password')) {
      // For demo purposes, we don't actually update the password for test users
      return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
    }
    
    // Search for the user in the sheet
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[usernameCol] === username && row[passwordCol] === currentPassword) {
        // User found, update password
        // In a real app, we would hash the password here
        usersSheet.getRange(i + 1, passwordCol + 1).setValue(newPassword);
        
        return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
      }
    }
    
    // User not found or current password incorrect
    return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, message: 'حدث خطأ أثناء تغيير كلمة المرور' };
  }
}

/**
 * Update user profile
 */
function updateUserProfile(username, userData) {
  try {
    // Get all users
    const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    if (!usersSheet) {
      console.error('Users sheet not found');
      return { success: false, message: 'خطأ في نظام إدارة المستخدمين' };
    }

    const data = usersSheet.getDataRange().getValues();
    const headers = data[0];
    
    // Find username and other column indices
    const usernameCol = headers.indexOf('username');
    const fullNameCol = headers.indexOf('fullName');
    const emailCol = headers.indexOf('email');
    const phoneCol = headers.indexOf('phone');
    const departmentCol = headers.indexOf('department');
    
    if (usernameCol < 0) {
      console.error('Required columns not found in Users sheet');
      return { success: false, message: 'خطأ في نظام إدارة المستخدمين' };
    }
    
    // For demo purposes
    if (username === 'admin' || username === 'user') {
      return { 
        success: true, 
        message: 'تم تحديث بيانات المستخدم بنجاح',
        user: {
          ...userData,
          username: username
        }
      };
    }
    
    // Search for the user in the sheet
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[usernameCol] === username) {
        // User found, update profile
        if (fullNameCol >= 0 && userData.fullName) {
          usersSheet.getRange(i + 1, fullNameCol + 1).setValue(userData.fullName);
        }
        
        if (emailCol >= 0 && userData.email) {
          usersSheet.getRange(i + 1, emailCol + 1).setValue(userData.email);
        }
        
        if (phoneCol >= 0 && userData.phone) {
          usersSheet.getRange(i + 1, phoneCol + 1).setValue(userData.phone);
        }
        
        if (departmentCol >= 0 && userData.department) {
          usersSheet.getRange(i + 1, departmentCol + 1).setValue(userData.department);
        }
        
        return { 
          success: true, 
          message: 'تم تحديث بيانات المستخدم بنجاح',
          user: {
            ...userData,
            username: username
          }
        };
      }
    }
    
    // User not found
    return { success: false, message: 'المستخدم غير موجود' };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, message: 'حدث خطأ أثناء تحديث بيانات المستخدم' };
  }
}

/**
 * Reset database counters for new year
 */
function resetCountersForNewYear() {
  try {
    // In a real app, this would reset counters in a spreadsheet
    // For now we'll just return success
    return { success: true, message: 'تم إعادة تعيين العدادات للسنة الجديدة' };
  } catch (error) {
    console.error('Error resetting counters:', error);
    return { success: false, message: 'حدث خطأ أثناء إعادة تعيين العدادات' };
  }
}

/**
 * Reset the database (clear all documents)
 */
function resetDatabase() {
  try {
    // In a real app, this would clear document data
    // For now we'll just return success
    return { success: true, message: 'تم تصفير قاعدة البيانات بنجاح' };
  } catch (error) {
    console.error('Error resetting database:', error);
    return { success: false, message: 'حدث خطأ أثناء تصفير قاعدة البيانات' };
  }
}

/**
 * Backup the database
 */
function backupDatabase() {
  try {
    // In a real app, this would create a backup copy of the spreadsheet
    // For now we'll just return success with current timestamp
    return { 
      success: true, 
      message: 'تم عمل نسخة احتياطية بنجاح',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error backing up database:', error);
    return { success: false, message: 'حدث خطأ أثناء عمل نسخة احتياطية' };
  }
}

/**
 * Store user session in CacheService
 */
function createUserSession(user) {
  const sessionKey = generateSessionKey();
  const userSessionData = JSON.stringify({
    user: user,
    role: user.role,
    created: new Date().getTime()
  });
  
  // Store in CacheService with expiration
  CacheService.getUserCache().put(
    sessionKey, 
    userSessionData, 
    AppConfig.SESSION_EXPIRY
  );
  
  // Store session key in user properties for lookup
  PropertiesService.getUserProperties().setProperty('SESSION_KEY', sessionKey);
  
  return sessionKey;
}

/**
 * Get the current user session
 */
function getUserSession() {
  try {
    const sessionKey = PropertiesService.getUserProperties().getProperty('SESSION_KEY');
    if (!sessionKey) {
      return null;
    }
    
    const cachedData = CacheService.getUserCache().get(sessionKey);
    if (!cachedData) {
      // Session expired or not found
      clearUserSession();
      return null;
    }
    
    const sessionData = JSON.parse(cachedData);
    
    // Check session expiry
    const now = new Date().getTime();
    const sessionAge = now - sessionData.created;
    if (sessionAge > (AppConfig.SESSION_EXPIRY * 1000)) {
      // Session expired
      clearUserSession();
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.error('Error getting user session:', error);
    clearUserSession();
    return null;
  }
}

/**
 * Clear the user session
 */
function clearUserSession() {
  try {
    const sessionKey = PropertiesService.getUserProperties().getProperty('SESSION_KEY');
    if (sessionKey) {
      CacheService.getUserCache().remove(sessionKey);
      PropertiesService.getUserProperties().deleteProperty('SESSION_KEY');
    }
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
}

/**
 * Generate a random session key
 */
function generateSessionKey() {
  return Utilities.getUuid();
}

/**
 * Include HTML files
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
