console.log(process.env.NODE_EN)
export default () => ({
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '1234', 10),
});