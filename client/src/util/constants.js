const prod = {
    API_URL: 'https://scout.robotigers1796.com',
};
const dev = {
    API_URL: 'http://localhost:5000',
};

export const config = process.env.NODE_ENV === 'development' ? dev : prod;
export const year = 2022;
