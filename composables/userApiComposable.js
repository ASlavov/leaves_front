
const getUserProfileComposable = async (userId) => {
    return $fetch('/api/user/getProfile', {
        method: 'POST',
        body: {
            userId: userId
        },
    });
}
export default getUserProfileComposable;
