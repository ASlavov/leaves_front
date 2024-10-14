export default async function (url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await $fetch(url, options);
            return response; // If successful, return the response
        } catch (error) {
            if (i === retries - 1) {
                throw error; // If it's the last attempt, throw the error
            }
            await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
            delay *= 2; // Exponential backoff
        }
    }
}
