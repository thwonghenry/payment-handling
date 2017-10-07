export const processResponse = (res) =>
    res.json().then((data) => {
        console.log(data);
        if (res.ok) {
            return data;
        } else {
            throw data.meta;
        }
    });