import Amplify, { Auth } from 'aws-amplify';

Amplify.configure({
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',

        // REQUIRED - Amazon Cognito Region
        region: 'XX-XXXX-X',

        // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
        // Required only if it's different from Amazon Cognito Region
        identityPoolRegion: 'XX-XXXX-X',

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'XX-XXXX-X_abcd1234',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3',

        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: false,

        // OPTIONAL - Configuration for cookie storage
        // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
        cookieStorage: {
            // REQUIRED - Cookie domain (only required if cookieStorage is provided)
            domain: '.yourdomain.com',
            // OPTIONAL - Cookie path
            path: '/',
            // OPTIONAL - Cookie expiration in days
            expires: 365,
            // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
            sameSite: "strict" | "lax",
            // OPTIONAL - Cookie secure flag
            // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
            secure: true
        },

        // OPTIONAL - customized storage object
        storage: MyStorage,

        // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
        authenticationFlowType: 'USER_PASSWORD_AUTH',

        // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
        clientMetadata: { myCustomKey: 'myCustomValue' },

        // OPTIONAL - Hosted UI configuration
        oauth: {
            domain: 'your_cognito_domain',
            scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            redirectSignIn: 'http://localhost:3000/',
            redirectSignOut: 'http://localhost:3000/',
            responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
        }
    }
});

/**
 * 現在の設定を取得
 * @returns 設定情報
 */
export function getAuthCurrentConfig() {
    return Auth.configure();
}

/**
 * サインアップ
 * @param {object} userInfo ユーザ情報
 * {username, password, email, phone_number}
 * @returns サインアップ情報
 */
export async function signUp(userInfo) {
    try {
        const {
            username,
            password,
            email,
            phone_number
        } = userInfo;

        let userConfiger = {
            username,
            password
        };

        let attributes = {};
        if (!!email) {
            attributes = {
                email
            };
        }
        if (!!phone_number) {
            attributes = {
                ...attributes,
                phone_number
            };
        }
        userConfiger = {...userConfiger, attributes };
        return await Auth.signUp(userConfiger);
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * サインアップ再送
 * @param {*} username ユーザ名
 */
export async function resendSignUp(username) {
    try {
        await Auth.resendSignUp(username);
    } catch (err) {
        console.error('error:', err);
    }
}


/**
 * サインアップ確認
 * @param {string} username ユーザ名
 * @param {string} code 認証コード
 */
export async function confirmSignUp(username, code) {
    try {
        await Auth.confirmSignUp(username, code);
    } catch (err) {
        console.error('error', err);
    }
}

/**
 *  サインイン
 * @param {string} username ユーザ名
 * @param {string} password パスワード
 * @returns ユーザ情報
 */
export async function signIn(username, password) {
    try {
        return await Auth.signIn(username, password);
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * サインアウト
 */
export async function signOut() {
    try {
        return await Auth.signOut();
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * グルバールサインアウト
 */
export async function globalSignOut() {
    try {
        await Auth.signOut({ global: true });
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * パスワード変更
 * @param {object} cognitoUser cognitoユーザ
 * @param {string} oldPassword 旧パスワード
 * @param {string} newPassword 新パスワード
 * @returns 変更結果
 */
export async function changePassword(cognitoUser, oldPassword, newPassword) {
    try {
        return await Auth.changePassword(cognitoUser, oldPassword, newPassword);
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * パースワードを忘れる
 * @param {string} username ユーザ名
 * @returns パスワードを忘れる結果
 */
export async function forgotPassword(username) {
    try {
        return await Auth.forgotPassword(username);
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * パスワード忘れサブミット
 * @param {string} username ユーザ名
 * @param {string} code 認証コード
 * @param {string} password パスワード
 * @returns 結果
 */
export async function forgotPasswordSubmit(username, code, password) {
    try {
        return await Auth.forgotPasswordSubmit(username, code, password);
    } catch (err) {
        console.error('error:', err);
    }
}


/**
 * 新パースワードを完了
 * @param {object} cognitoUser cognitoユーザ
 * @param {string} password パスワード
 * @param {string} requiredAttributes 必須属性
 * @returns 結果
 */
export async function completeNewPassword(cognitoUser, password, requiredAttributes) {
    try {
        return await Auth.completeNewPassword(cognitoUser, password, requiredAttributes);
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * 現在セッションを取得
 * @returns 現在セッション
 */
export async function currentSession() {
    try {
        return await Auth.currentSession();
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * 現在ユーザ認証情報を取得
 * @returns 現在ユーザ認証情報
 */
export async function currentAuthenticatedUser() {
    try {
        return await Auth.currentAuthenticatedUser();
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * 現在資格情報取得
 * @returns 現在情報資格
 */
export async function currentCredentials() {
    try {
        return await Auth.currentCredentials();
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * 現在ユーザ資格情報取得
 * @returns 現在ユーザ資格情報
 */
export async function currentUserCredentials() {
    try {
        return await Auth.currentUserCredentials();
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * 現在ユーザ情報取得
 * @returns 現在ユーザ情報
 */
export async function currentUserInfo() {
    try {
        return await Auth.currentUserInfo();
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * 現在ユーザプールユーザ取得
 * @returns 現在ユーザプールユーザ
 */
export async function currentUserPoolUser() {
    try {
        return await Auth.currentUserPoolUser();
    } catch (err) {
        console.error('error:', err);
    }
}


/**
 * ユーザ属性取得
 * @returns ユーザ属性
 */
export async function userAttributes() {
    try {
        return await Auth.userAttributes();
    } catch (err) {
        console.error('error:', err);
    }
}

/**
 * ユーザセッション取得
 * @param {object} cognitoUser ユーザ
 * @returns ユーザセッション
 */
 export async function userSession(cognitoUser) {
    try {
        return await Auth.userSession(cognitoUser);
    } catch (err) {
        console.error('error:', err);
    }
}

