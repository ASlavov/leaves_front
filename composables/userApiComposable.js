
const getUserProfileComposable = async (params) => {
    return $fetch('/api/user/getProfile', {
        method: 'POST',
        body: {
            email: params.email,
            password: params.password
        },
    });
}
export default getUserProfileComposable;
