export function checkResponse(res) {
    if (res.ok) {
        return res;
    }
    const msg = `${res.status}:${res.statusText} (${res.url})`;
    console.log(msg);
    console.log(res);
    return Promise.reject(new Error(msg));
}
