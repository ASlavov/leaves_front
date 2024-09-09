
const authUserComposable = async (params) => {
    return $fetch('/api/authUser', {
        method: 'POST',
        body: {
            email: params.email,
            password: params.password
        },
    });
}
export default authUserComposable;
