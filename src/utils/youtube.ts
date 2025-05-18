export function getYoutubeEmbedUrl(youtubeWatchUrl?: string): string {
    if (!youtubeWatchUrl) return "";
    let videoId: string | null = null;

    try {
        const url = new URL(youtubeWatchUrl);
        if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
            videoId = url.searchParams.get("v");
        } else if (url.hostname === "youtu.be") {
            videoId = url.pathname.substring(1);
        }
    } catch (e) {
        console.warn("Could not parse as standard YouTube URL, trying fallback:", youtubeWatchUrl, e);
    }

    if (!videoId && youtubeWatchUrl.includes("googleusercontent.com/youtube.com/")) {
        const parts = youtubeWatchUrl.split('/');
        const potentialId = parts[parts.length - 1];
        if (potentialId && !potentialId.includes('.')) {
            videoId = potentialId;
        }
    }

    if (!videoId && !youtubeWatchUrl.includes("/") && youtubeWatchUrl.length === 11) {
        console.warn("Assuming the provided string is a YouTube Video ID:", youtubeWatchUrl);
        videoId = youtubeWatchUrl;
    }


    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}