import Amplify, { Storage } from 'aws-amplify';
import config from "./aws-exports";

Amplify.configure(config);

/**
 * ファイルを保存
 * @param {string} key キー
 * @param {object} object オブジェクト
 * @param {object} config 設定（オプション）
 * @returns 結果
 */
export async function put(key, object, config = null) {
    try {
        return await Storage.put(key, object, config);
    } catch (err) {
        console.error('error:', err);
    }
}


/**
 * ファイルを削除
 * @param {string} key キー
 * @param {object} object オブジェクト
 * @param {object} config 設定（オプション）
 * @returns 結果
 */
 export async function remove(key, object, config = null) {
    try {
        return await Storage.remove(key, object, config);
    } catch (err) {
        console.error('error:', err);
    }
}


/**
 * ファイルを削除
 * @param {string} key キー
 * @param {object} config 設定（オプション）
 * @returns 署名付きURLまたはファイル
 */
 export async function get(key, config = null) {
    try {
        return await Storage.get(key, config);
    } catch (err) {
        console.error('error:', err);
    }
}


/**
 * ファイル一覧を取得
 * @param {string} path キー
 * @param {object} config 設定（オプション）
 * @returns 
 */
 export async function list(path, config = null) {
    try {
        return await Storage.list(path, config);
    } catch (err) {
        console.error('error:', err);
    }
}