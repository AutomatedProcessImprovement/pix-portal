import axios from "../axios";

export const analyse = async (newJsonFile: Blob | File
) => {
    const formData = new FormData()
    formData.append("event_log", newJsonFile as Blob)

    return await axios.post(
        '/jobs',
        formData)
};