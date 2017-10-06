export const processResponse = (res) =>
    res.json().then((data) => {
        if (res.ok) {
            return data;
        } else {
            throw data;
        }
    });