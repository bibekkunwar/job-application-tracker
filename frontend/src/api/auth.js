const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async(email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({email, password})
    });
    const data = await response.json();
    if(!response.ok){
        throw new Error(data.error);
    }
    return data;
}

export const registerUser = async(email,password) => {

    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({email, password})
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.error);
    }
    return data;

}