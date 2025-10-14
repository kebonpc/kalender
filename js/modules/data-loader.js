/**
 * Fetches pre-computed holiday data from a JSON file.
 * @returns {Promise<object>} A promise that resolves with the holiday data object.
 */
export async function loadHolidayData() {
    try {
        const response = await fetch('data/holidays.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Could not load holiday data:", error);
        return {}; // Return an empty object on failure
    }
}