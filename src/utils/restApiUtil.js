import Amplify, { API } from 'aws-amplify';
import config from "./aws-exports";

Amplify.configure(config);


/**
 * DELETEメソッド
 * @param {string} apiName api名
 * @param {string} path パス
 * @param {object} init init
 * @returns 結果
 */
export async function del(apiName, path, init) {
    try {
        return await API.del(apiName, path, init);
    } catch (err) {
        console.error('error:', err);
        return err;
    }
}

/**
 * GETメソッド
 * @param {string} apiName api名
 * @param {string} path パス
 * @param {object} init init
 * @returns 結果
 */
 export async function get(apiName, path, init) {
    try {
        return await API.get(apiName, path, init);
    } catch (err) {
        console.error('error:', err);
        return err;
    }
}

/**
 * POSTメソッド
 * @param {string} apiName api名
 * @param {string} path パス
 * @param {object} init init
 * @returns 結果
 */
 export async function post(apiName, path, init) {
    try {
        return await API.post(apiName, path, init);
    } catch (err) {
        console.error('error:', err);
        return err;
    }
}

/**
 * PUTメソッド
 * @param {string} apiName api名
 * @param {string} path パス
 * @param {object} init init
 * @returns 結果
 */
 export async function put(apiName, path, init) {
    try {
        return await API.put(apiName, path, init);
    } catch (err) {
        console.error('error:', err);
        return err;
    }
}

/**
 * HEADメソッド
 * @param {string} apiName api名
 * @param {string} path パス
 * @param {object} init init
 * @returns 結果
 */
 export async function head(apiName, path, init) {
    try {
        return await API.head(apiName, path, init);
    } catch (err) {
        console.error('error:', err);
        return err;
    }
}

/**
 * PATCHメソッド
 * @param {string} apiName api名
 * @param {string} path パス
 * @param {object} init init
 * @returns 結果
 */
 export async function patch(apiName, path, init) {
    try {
        return await API.patch(apiName, path, init);
    } catch (err) {
        console.error('error:', err);
        return err;
    }
}