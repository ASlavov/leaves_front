
const authUserComposable = async (params) => {
    try {
        const response = await $fetch('/api/auth/authUser', {
            method: 'POST',
            body: {
                email: params.email,
                password: params.password,
            },
        });

        // If the response contains a token or userId, return the result
        if (response.userId) {
            return response;
        }

        // If no token/userId, throw an error to catch in the auth store
        throw new Error('Invalid credentials');
    } catch (error) {
        // Rethrow any error to be caught by the store
        throw new Error('Invalid credentials');
    }
}
export default authUserComposable;
